import { prisma } from '@/config/database';
import { ApplicationFilters } from '@/types';

export class ApplicationService {
  async applyToJob(userId: string, jobId: string, data: {
    resumeId: string;
    coverLetter?: string;
  }, idempotencyKey?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobSeekerProfile: true },
    });

    if (!user?.jobSeekerProfile) {
      throw new Error('Job seeker profile not found');
    }

    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: 'PUBLISHED',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!job) {
      throw new Error('Job not found or not available');
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_jobSeekerId: {
          jobId,
          jobSeekerId: user.jobSeekerProfile.id,
        },
      },
    });

    if (existingApplication) {
      throw new Error('Already applied to this job');
    }

    const resume = await prisma.resume.findFirst({
      where: {
        id: data.resumeId,
        jobSeekerId: user.jobSeekerProfile.id,
        deleted: false,
      },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        jobSeekerId: user.jobSeekerProfile.id,
        resumeId: data.resumeId,
        coverLetter: data.coverLetter,
        statusHistory: [
          {
            status: 'APPLIED',
            byUserId: userId,
            at: new Date().toISOString(),
            note: 'Application submitted',
          },
        ],
        metadata: {
          idempotencyKey,
          userAgent: 'API',
        },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            employer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    // Send notification to employer
    await this.sendNewApplicationNotification(application, job)
    
    // Send confirmation email to job seeker
    await this.sendApplicationConfirmationEmail(application, user)

    return { applicationId: application.id };
  }

  async getMyApplications(userId: string, filters: ApplicationFilters & { q?: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobSeekerProfile: true },
    });

    if (!user?.jobSeekerProfile) {
      throw new Error('Job seeker profile not found');
    }

    const where: any = { jobSeekerId: user.jobSeekerProfile.id };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.q) {
      where.job = {
        OR: [
          { title: { contains: filters.q, mode: 'insensitive' } },
          { employer: { name: { contains: filters.q, mode: 'insensitive' } } },
        ],
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.appliedAt = {};
      if (filters.dateFrom) {
        where.appliedAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.appliedAt.lte = new Date(filters.dateTo);
      }
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.appliedAt = 'desc';
    }

    const limit = filters.limit || 5;
    const page = filters.page || 1;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              remote: true,
              jobType: true,
              status: true,
              salaryAmount: true, // Include salary amount
              employer: {
                select: {
                  id: true,
                  name: true,
                  logoKey: true,
                },
              },
            },
          },
          resume: {
            select: {
              id: true,
              fileName: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page: page,
        limit: limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getApplication(userId: string, applicationId: string) {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        OR: [
          { jobSeeker: { userId } },
          { job: { employer: { ownerId: userId } } },
          { job: { employer: { admins: { some: { userId } } } } },
        ],
      },
      include: {
        job: {
          include: {
            employer: {
              select: {
                id: true,
                name: true,
                website: true,
                industry: true,
                location: true,
                logoKey: true,
              },
            },
          },
        },
        jobSeeker: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        resume: {
          select: {
            id: true,
            fileName: true,
            fileKey: true,
            parsedJson: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    return application;
  }

  async updateApplicationStatus(userId: string, applicationId: string, data: {
    status: string;
    note?: string;
  }) {
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        job: {
          employer: {
            OR: [
              { ownerId: userId },
              { admins: { some: { userId } } },
            ],
          },
        },
      },
      include: {
        job: true,
        jobSeeker: {
          include: { user: true },
        },
      },
    });

    if (!application) {
      throw new Error('Application not found or access denied');
    }

    const validTransitions: Record<string, string[]> = {
      APPLIED: ['VIEWED', 'REJECTED'],
      VIEWED: ['SHORTLISTED', 'REJECTED'],
      SHORTLISTED: ['INTERVIEW_SCHEDULED', 'REJECTED'],
      INTERVIEW_SCHEDULED: ['OFFERED', 'REJECTED'],
      OFFERED: ['HIRED', 'REJECTED'],
      HIRED: [],
      REJECTED: [],
    };

    const allowedStatuses = validTransitions[application.status] || [];
    if (!allowedStatuses.includes(data.status)) {
      throw new Error(`Cannot transition from ${application.status} to ${data.status}`);
    }

    const statusHistory = Array.isArray(application.statusHistory) 
      ? application.statusHistory 
      : [];

    statusHistory.push({
      status: data.status,
      byUserId: userId,
      at: new Date().toISOString(),
      note: data.note,
    });

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: data.status as any,
        statusHistory,
      },
    });

    // Send notification to job seeker
    await this.sendApplicationStatusNotification(updatedApplication, application.jobSeeker.user)
    
    // Send email notification
    await this.sendApplicationStatusEmail(updatedApplication, application.jobSeeker.user, data.note)

    return updatedApplication;
  }

  async getJobApplications(userId: string, jobId: string, filters: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    // First verify the user owns this job
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        employer: {
          OR: [
            { ownerId: userId },
            { admins: { some: { userId } } },
          ],
        },
      },
    });

    if (!job) {
      throw new Error('Job not found or access denied');
    }

    const where: any = { jobId };
    
    if (filters.status) {
      where.status = filters.status;
    }

    const limit = filters.limit || 20;
    const page = filters.page || 1;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              jobType: true,
            },
          },
          jobSeeker: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          resume: {
            select: {
              id: true,
              fileName: true,
              fileKey: true,
            },
          },
        },
        orderBy: {
          appliedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getEmployerApplications(userId: string, filters: {
    q?: string;
    status?: string;
    jobId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    // Get employer profile to access their jobs
    const employer = await prisma.employer.findFirst({
      where: {
        OR: [
          { ownerId: userId },
          { admins: { some: { userId } } },
        ],
      },
    });

    if (!employer) {
      throw new Error('Employer profile not found');
    }

    const where: any = {
      job: {
        employerId: employer.id,
      },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.jobId) {
      where.jobId = filters.jobId;
    }

    if (filters.q) {
      where.OR = [
        {
          jobSeeker: {
            user: {
              OR: [
                { firstName: { contains: filters.q, mode: 'insensitive' } },
                { lastName: { contains: filters.q, mode: 'insensitive' } },
                { email: { contains: filters.q, mode: 'insensitive' } },
              ],
            },
          },
        },
        {
          job: {
            title: { contains: filters.q, mode: 'insensitive' },
          },
        },
      ];
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.appliedAt = 'desc';
    }

    const limit = filters.limit || 20;
    const page = filters.page || 1;

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              jobType: true,
              status: true,
            },
          },
          jobSeeker: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                },
              },
            },
          },
          resume: {
            select: {
              id: true,
              fileName: true,
              fileKey: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  private async sendApplicationStatusNotification(application: any, jobSeeker: any) {
    try {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: jobSeeker.id,
          type: 'APPLICATION_STATUS_UPDATED',
          payload: {
            applicationId: application.id,
            jobTitle: application.job?.title,
            newStatus: application.status,
            employerName: application.job?.employer?.name,
          },
          createdAt: new Date(),
        },
      })
    } catch (error) {
      console.error('Failed to send application notification:', error)
    }
  }

  private async sendApplicationStatusEmail(application: any, jobSeeker: any, note?: string) {
    try {
      // TODO: Implement email sending logic
      console.log('Sending application status email to:', jobSeeker.email)
      console.log('Application status:', application.status)
      console.log('Job title:', application.job?.title)
      console.log('Note:', note)
      
      // Example email template data
      const emailData = {
        to: jobSeeker.email,
        subject: `Application Status Update - ${application.job?.title}`,
        template: 'application-status-update',
        data: {
          candidateName: `${jobSeeker.firstName} ${jobSeeker.lastName}`,
          jobTitle: application.job?.title,
          companyName: application.job?.employer?.name,
          newStatus: this.getStatusDisplayName(application.status),
          note,
          applicationUrl: `${process.env.FRONTEND_URL}/dashboard/applications/${application.id}`,
        },
      }
      
      // TODO: Queue email for sending
      console.log('Email queued:', emailData)
    } catch (error) {
      console.error('Failed to send application status email:', error)
    }
  }

  private getStatusDisplayName(status: string): string {
    const statusMap: Record<string, string> = {
      APPLIED: 'Applied',
      VIEWED: 'Under Review',
      SHORTLISTED: 'Shortlisted',
      INTERVIEW_SCHEDULED: 'Interview Scheduled',
      OFFERED: 'Offered',
      HIRED: 'Hired',
      REJECTED: 'Rejected',
    }
    return statusMap[status] || status
  }

  private async sendNewApplicationNotification(application: any, job: any) {
    try {
      // Get employer info to send notification
      const employer = await prisma.employer.findUnique({
        where: { id: job.employerId },
        include: {
          owner: true,
          admins: { include: { user: true } },
        },
      })

      if (!employer) return

      // Send notification to job owner
      await prisma.notification.create({
        data: {
          userId: employer.ownerId,
          type: 'NEW_APPLICATION_RECEIVED',
          payload: {
            applicationId: application.id,
            jobTitle: job.title,
            candidateName: `${application.jobSeeker?.user?.firstName} ${application.jobSeeker?.user?.lastName}`,
            jobId: job.id,
          },
          createdAt: new Date(),
        },
      })

      // Also send to admins
      for (const admin of employer.admins) {
        await prisma.notification.create({
          data: {
            userId: admin.userId,
            type: 'NEW_APPLICATION_RECEIVED',
            payload: {
              applicationId: application.id,
              jobTitle: job.title,
              candidateName: `${application.jobSeeker?.user?.firstName} ${application.jobSeeker?.user?.lastName}`,
              jobId: job.id,
            },
            createdAt: new Date(),
          },
        })
      }
    } catch (error) {
      console.error('Failed to send new application notification:', error)
    }
  }

  private async sendApplicationConfirmationEmail(application: any, user: any) {
    try {
      // TODO: Implement email sending logic
      console.log('Sending application confirmation email to:', user.email)
      console.log('Application ID:', application.id)
      console.log('Job title:', application.job?.title)
      
      // Example email template data
      const emailData = {
        to: user.email,
        subject: `Application Received - ${application.job?.title}`,
        template: 'application-confirmation',
        data: {
          candidateName: `${user.firstName} ${user.lastName}`,
          jobTitle: application.job?.title,
          companyName: application.job?.employer?.name,
          applicationId: application.id,
          dashboardUrl: `${process.env.FRONTEND_URL}/dashboard/applications`,
        },
      }
      
      // TODO: Queue email for sending
      console.log('Confirmation email queued:', emailData)
    } catch (error) {
      console.error('Failed to send application confirmation email:', error)
    }
  }
}
