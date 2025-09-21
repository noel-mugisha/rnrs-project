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

    // TODO: Send notification to employer
    // TODO: Send confirmation email to job seeker

    return { applicationId: application.id };
  }

  async getMyApplications(userId: string, filters: ApplicationFilters) {
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
        skip: ((filters.page || 1) - 1) * (filters.limit || 20),
        take: filters.limit || 20,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        pages: Math.ceil(total / (filters.limit || 20)),
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

    // TODO: Send notification to job seeker
    // TODO: Send email notification

    return updatedApplication;
  }
}