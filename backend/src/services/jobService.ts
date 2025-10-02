import { prisma } from '@/config/database';
import { JobSearchQuery } from '@/types';

export class JobService {
  async getPublicJob(jobId: string) {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: 'PUBLISHED',
      },
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
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new Error('Job not found');
    }

    return job;
  }

  async searchJobs(query: JobSearchQuery) {
    const where: any = {
      status: 'PUBLISHED',
      postedAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
        { requirements: { hasSome: [query.q] } },
        { responsibilities: { hasSome: [query.q] } },
      ];
    }

    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }

    if (query.remote !== undefined) {
      where.remote = query.remote;
    }

    if (query.jobType) {
      where.jobType = query.jobType;
    }

    if (query.experienceLevel) {
      where.experienceLevel = query.experienceLevel;
    }

    if (query.salaryMin || query.salaryMax) {
      where.salaryRange = {};
      if (query.salaryMin) {
        where.salaryRange.path = ['min'];
        where.salaryRange.gte = query.salaryMin;
      }
      if (query.salaryMax) {
        where.salaryRange.path = ['max'];
        where.salaryRange.lte = query.salaryMax;
      }
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.postedAt = 'desc';
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
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
          _count: {
            select: { applications: true },
          },
        },
        orderBy,
        skip: ((query.page || 1) - 1) * (query.limit || 20),
        take: query.limit || 20,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total,
        pages: Math.ceil(total / (query.limit || 20)),
      },
    };
  }

  async updateJob(userId: string, jobId: string, data: any) {
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

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return updatedJob;
  }

  async deleteJob(userId: string, jobId: string) {
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

    await prisma.job.update({
      where: { id: jobId },
      data: { status: 'ARCHIVED' },
    });

    return { deleted: true };
  }

  async publishJob(userId: string, jobId: string) {
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

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'PUBLISHED',
        postedAt: new Date(),
      },
    });

    return updatedJob;
  }

  async getJobApplicants(userId: string, jobId: string, filters: {
    status?: string;
    page: number;
    limit: number;
  }) {
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

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
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
        orderBy: { appliedAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  async getRecommendedJobs(userId: string, limit: number = 10) {
    // Get job seeker profile with skills and desired title
    const jobSeeker = await prisma.jobSeekerProfile.findUnique({
      where: { userId },
      select: {
        desiredTitle: true,
        skills: true,
      },
    });

    if (!jobSeeker) {
      return { jobs: [] };
    }

    // Get user's applications to exclude already applied jobs
    const applications = await prisma.application.findMany({
      where: { jobSeekerId: userId },
      select: { jobId: true },
    });
    const appliedJobIds = applications.map(app => app.jobId);

    // Build search criteria based on profile
    const where: any = {
      status: 'PUBLISHED',
      postedAt: { lte: new Date() },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    };

    // Exclude already applied jobs
    if (appliedJobIds.length > 0) {
      where.id = { notIn: appliedJobIds };
    }

    // Search conditions based on skills and desired title
    const searchConditions: any[] = [];

    // Match by desired title
    if (jobSeeker.desiredTitle) {
      searchConditions.push({
        title: { contains: jobSeeker.desiredTitle, mode: 'insensitive' },
      });
      searchConditions.push({
        description: { contains: jobSeeker.desiredTitle, mode: 'insensitive' },
      });
    }

    // Match by skills - search in job requirements and description
    if (jobSeeker.skills && Array.isArray(jobSeeker.skills)) {
      const skills = jobSeeker.skills as Array<{ category: string; work: string }>;
      skills.forEach(skill => {
        searchConditions.push({
          OR: [
            { title: { contains: skill.work, mode: 'insensitive' } },
            { description: { contains: skill.work, mode: 'insensitive' } },
            { requirements: { hasSome: [skill.work] } },
          ],
        });
      });
    }

    // If we have search conditions, add them
    if (searchConditions.length > 0) {
      where.OR = searchConditions;
    }

    // Fetch recommended jobs
    const jobs = await prisma.job.findMany({
      where,
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
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { postedAt: 'desc' },
      take: limit,
    });

    return { jobs };
  }
}
