import { prisma } from '@/config/database';
import { generateUniqueSlug } from '@/utils/slugify';

export class EmployerService {
  async createEmployer(userId: string, data: {
    name: string;
    website?: string;
    industry?: string;
    location?: string;
  }) {
    const existingEmployer = await prisma.employer.findUnique({
      where: { ownerId: userId },
    });

    if (existingEmployer) {
      throw new Error('Employer profile already exists');
    }

    const employer = await prisma.employer.create({
      data: {
        ownerId: userId,
        name: data.name,
        website: data.website,
        industry: data.industry,
        location: data.location,
      },
    });

    return employer;
  }

  async getEmployer(employerId: string) {
    const employer = await prisma.employer.findUnique({
      where: { id: employerId },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        jobs: {
          where: { status: 'PUBLISHED' },
          orderBy: { postedAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            jobs: {
              where: { status: 'PUBLISHED' },
            },
          },
        },
      },
    });

    if (!employer) {
      throw new Error('Employer not found');
    }

    return employer;
  }

  async updateEmployer(userId: string, employerId: string, data: {
    name?: string;
    website?: string;
    industry?: string;
    location?: string;
  }) {
    const employer = await prisma.employer.findFirst({
      where: {
        id: employerId,
        OR: [
          { ownerId: userId },
          { admins: { some: { userId } } },
        ],
      },
    });

    if (!employer) {
      throw new Error('Employer not found or access denied');
    }

    const updatedEmployer = await prisma.employer.update({
      where: { id: employerId },
      data,
    });

    return updatedEmployer;
  }

  async getUserEmployer(userId: string) {
    const employer = await prisma.employer.findUnique({
      where: { ownerId: userId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    return employer;
  }

  async createJob(userId: string, employerId: string, data: {
    workCategory: string;
    workType: string;
    title: string;
    description: string;
    requirements: string;
    location: string;
    salaryAmount: number;
    remote: boolean;
    jobType: string;
    experienceLevel: string;
  }) {
    const employer = await prisma.employer.findFirst({
      where: {
        id: employerId,
        OR: [
          { ownerId: userId },
          { admins: { some: { userId } } },
        ],
      },
    });

    if (!employer) {
      throw new Error('Employer not found or access denied');
    }

    const slug = generateUniqueSlug(data.title);

    const job = await prisma.job.create({
      data: {
        employerId,
        workCategory: data.workCategory,
        workType: data.workType,
        title: data.title,
        slug,
        description: data.description,
        requirements: data.requirements,
        location: data.location,
        salaryAmount: data.salaryAmount,
        remote: data.remote,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
      },
    });

    return job;
  }

  async getEmployerJobs(userId: string, employerId: string, filters: {
    status?: string;
    page: number;
    limit: number;
  }) {
    const employer = await prisma.employer.findFirst({
      where: {
        id: employerId,
        OR: [
          { ownerId: userId },
          { admins: { some: { userId } } },
        ],
      },
    });

    if (!employer) {
      throw new Error('Employer not found or access denied');
    }

    const where: any = { employerId };
    if (filters.status) {
      where.status = filters.status;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          _count: {
            select: { applications: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }
}