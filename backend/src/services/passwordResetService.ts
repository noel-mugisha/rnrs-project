import { prisma } from '@/config/database';
import { hashPassword, generateSecureToken, generateTokenHash } from '@/utils/auth';
import { sendEmail } from '@/config/email';
import { logger } from '@/config/logger';

export class PasswordResetService {
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error('User not found');
    }

    const token = generateSecureToken();
    const tokenHash = generateTokenHash(token);
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    await this.sendPasswordResetEmail(user.email, user.firstName, token);
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = generateTokenHash(token);

    const storedToken = await prisma.passwordResetToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!storedToken) {
      throw new Error('Invalid or expired password reset token');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: storedToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: storedToken.id },
        data: { revoked: true },
      }),
    ]);
  }

  private async sendPasswordResetEmail(email: string, firstName: string, token: string) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const subject = 'Password Reset Request';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>You are receiving this email because a password reset request was made for your account. Please click the link below to reset your password:</p>
        <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Job Portal Team</p>
      </div>
    `;

    try {
      await sendEmail({ to: email, subject, html });
      logger.info(`Password reset email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new Error('Failed to send password reset email');
    }
  }
}