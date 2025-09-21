import { prisma } from '@/config/database';
import { NotificationType, NotificationPayload } from '@/types';
import { sendEmail } from '@/config/email';
import { logger } from '@/config/logger';

export class NotificationService {
  async createNotification(
    userId: string,
    type: NotificationType,
    payload: NotificationPayload
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        payload,
      },
    });

    // TODO: Send real-time notification via Socket.IO

    return notification;
  }

  async getUserNotifications(userId: string, filters: {
    read?: boolean;
    page: number;
    limit: number;
  }) {
    const where: any = { userId };
    if (filters.read !== undefined) {
      where.read = filters.read;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: { read: true },
    });

    return { success: true };
  }

  async sendWelcomeNotification(userId: string, firstName: string) {
    await this.createNotification(userId, 'WELCOME', {
      title: 'Welcome to Job Portal!',
      message: `Hi ${firstName}! Welcome to our job portal. Start exploring opportunities or post your first job.`,
      actionUrl: '/dashboard',
    });
  }

  async sendApplicationReceivedNotification(
    employerUserId: string,
    jobTitle: string,
    applicantName: string,
    applicationId: string
  ) {
    await this.createNotification(employerUserId, 'APPLICATION_RECEIVED', {
      title: 'New Job Application',
      message: `${applicantName} has applied for ${jobTitle}`,
      actionUrl: `/applications/${applicationId}`,
      metadata: { applicationId },
    });
  }

  async sendApplicationStatusChangedNotification(
    jobSeekerUserId: string,
    jobTitle: string,
    status: string,
    applicationId: string
  ) {
    const statusMessages: Record<string, string> = {
      VIEWED: 'Your application has been viewed',
      SHORTLISTED: 'Congratulations! You have been shortlisted',
      INTERVIEW_SCHEDULED: 'Interview has been scheduled',
      OFFERED: 'Congratulations! You have received a job offer',
      HIRED: 'Congratulations! You have been hired',
      REJECTED: 'Your application status has been updated',
    };

    await this.createNotification(jobSeekerUserId, 'APPLICATION_STATUS_CHANGED', {
      title: 'Application Status Update',
      message: `${statusMessages[status]} for ${jobTitle}`,
      actionUrl: `/applications/${applicationId}`,
      metadata: { applicationId, status },
    });
  }

  async sendEmailNotification(
    email: string,
    subject: string,
    template: string,
    data: Record<string, any>
  ) {
    try {
      // Simple template replacement
      let html = template;
      Object.keys(data).forEach(key => {
        html = html.replace(new RegExp(`{{${key}}}`, 'g'), data[key]);
      });

      await sendEmail({
        to: email,
        subject,
        html,
      });

      logger.info(`Email notification sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send email notification to ${email}:`, error);
      throw error;
    }
  }
}