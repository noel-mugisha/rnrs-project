import { prisma } from '@/config/database';
import { AuthenticatedRequest } from '@/types';

export class UserService {
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobSeekerProfile: {
          include: {
            resumes: {
              where: { deleted: false },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        employerProfile: {
          include: {
            jobs: {
              where: { status: { not: 'ARCHIVED' } },
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateProfile(userId: string, data: {
    phone?: string;
    desiredTitle?: string;
    about?: string;
    skills?: any;
    privacy?: any;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobSeekerProfile: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const updates: any = {};
    
    if (data.phone !== undefined) {
      updates.phone = data.phone;
    }

    if (user.jobSeekerProfile && (data.desiredTitle !== undefined || data.about !== undefined || data.skills !== undefined || data.privacy !== undefined)) {
      const profileUpdates: any = {};
      
      if (data.desiredTitle !== undefined) profileUpdates.desiredTitle = data.desiredTitle;
      if (data.about !== undefined) profileUpdates.about = data.about;
      if (data.skills !== undefined) profileUpdates.skills = data.skills;
      if (data.privacy !== undefined) profileUpdates.privacy = data.privacy;

      await prisma.jobSeekerProfile.update({
        where: { userId },
        data: profileUpdates,
      });
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: updates,
      });
    }

    return this.getCurrentUser(userId);
  }

  async deleteAccount(userId: string) {
    await prisma.$transaction([
      prisma.application.deleteMany({ where: { jobSeeker: { userId } } }),
      prisma.resume.deleteMany({ where: { jobSeeker: { userId } } }),
      prisma.jobSeekerProfile.deleteMany({ where: { userId } }),
      prisma.job.deleteMany({ where: { employer: { ownerId: userId } } }),
      prisma.employer.deleteMany({ where: { ownerId: userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.refreshToken.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);

    return { deleted: true };
  }
}