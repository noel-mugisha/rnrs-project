import { prisma } from '@/config/database';
import { cloudinary, generateUploadSignature } from '@/config/cloudinary';
import { logger } from '@/config/logger';
import crypto from 'crypto';

export class ResumeService {
  async requestUpload(userId: string, data: {
    fileName: string;
    fileType: string;
    fileSize: number;
  }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobSeekerProfile: true },
    });

    if (!user?.jobSeekerProfile) {
      throw new Error('Job seeker profile not found');
    }

    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || '').split(',');
    if (!allowedTypes.includes(data.fileType)) {
      throw new Error('File type not allowed');
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
    if (data.fileSize > maxSize) {
      throw new Error('File size exceeds limit');
    }

    const fingerprint = crypto
      .createHash('md5')
      .update(`${data.fileName}-${data.fileSize}-${Date.now()}`)
      .digest('hex');

    const resume = await prisma.resume.create({
      data: {
        jobSeekerId: user.jobSeekerProfile.id,
        fileName: data.fileName,
        mimeType: data.fileType,
        size: data.fileSize,
        fingerprint,
        fileKey: '', // Will be updated after upload
      },
    });

    const timestamp = Math.round(Date.now() / 1000);
    const publicId = `job-portal/resumes/${resume.id}`;
    
    const params = {
      timestamp,
      public_id: publicId,
      folder: 'job-portal/resumes',
      resource_type: 'raw',
    };

    const signature = generateUploadSignature(params);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload`;

    return {
      uploadUrl,
      resumeId: resume.id,
      uploadParams: {
        ...params,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
      },
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    };
  }

  async completeUpload(userId: string, data: {
    resumeId: string;
    storageKey: string;
  }) {
    const resume = await prisma.resume.findFirst({
      where: {
        id: data.resumeId,
        jobSeeker: { userId },
      },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    await prisma.resume.update({
      where: { id: data.resumeId },
      data: {
        fileKey: data.storageKey,
        parseStatus: 'PENDING',
      },
    });

    // TODO: Enqueue resume parsing job
    logger.info(`Resume upload completed: ${data.resumeId}`);

    return { success: true, resumeId: data.resumeId };
  }

  async getResumes(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { jobSeekerProfile: true },
    });

    if (!user?.jobSeekerProfile) {
      throw new Error('Job seeker profile not found');
    }

    const resumes = await prisma.resume.findMany({
      where: {
        jobSeekerId: user.jobSeekerProfile.id,
        deleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });

    return resumes;
  }

  async deleteResume(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        jobSeeker: { userId },
      },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    await prisma.resume.update({
      where: { id: resumeId },
      data: { deleted: true },
    });

    // TODO: Delete from Cloudinary
    if (resume.fileKey) {
      try {
        await cloudinary.uploader.destroy(resume.fileKey, { resource_type: 'raw' });
        logger.info(`Resume file deleted from Cloudinary: ${resume.fileKey}`);
      } catch (error) {
        logger.error(`Failed to delete resume file from Cloudinary: ${error}`);
      }
    }

    return { deleted: true };
  }

  async getResumeById(userId: string, resumeId: string) {
    const resume = await prisma.resume.findFirst({
      where: {
        id: resumeId,
        jobSeeker: { userId },
        deleted: false,
      },
    });

    if (!resume) {
      throw new Error('Resume not found');
    }

    return resume;
  }
}