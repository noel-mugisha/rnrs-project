import { prisma } from '@/config/database';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateOTP, 
  hashOTP, 
  generateTokenHash,
  generateSecureToken 
} from '@/utils/auth';
import { sendEmail } from '@/config/email';
import { logger } from '@/config/logger';
import { Role } from '@prisma/client';

export class AuthService {
  async signup(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const passwordHash = await hashPassword(data.password);
    
    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        passwordHash,
        role: data.role,
      },
    });

    if (data.role === 'JOBSEEKER') {
      await prisma.jobSeekerProfile.create({
        data: {
          userId: user.id,
        },
      });
    }

    const otp = generateOTP();

    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || '600000'));

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        otp,
        expiresAt,
      },
    });

    await this.sendVerificationEmail(user.email, user.firstName, otp);

    return { userId: user.id, emailVerificationSent: true };
  }

  async verifyEmail(userId: string, otp: string) {
    const verification = await prisma.emailVerification.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      throw new Error('Invalid or expired OTP');
    }

    if (verification.otp !== otp) {
      throw new Error('Invalid OTP');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerification.deleteMany({
        where: { userId },
      }),
    ]);

    const tokens = await this.generateTokens(verification.user);
    return { verified: true, ...tokens };
  }

  async resendOTP(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.emailVerified) {
      throw new Error('Email already verified');
    }

    await prisma.emailVerification.deleteMany({
      where: { userId },
    });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRES_IN || '600000'));

    await prisma.emailVerification.create({
      data: {
        userId,
        otp,
        expiresAt,
      },
    });

    await this.sendVerificationEmail(user.email, user.firstName, otp);

    return { resent: true };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new Error('Email not verified');
    }

    return this.generateTokens(user);
  }

  async refreshToken(refreshToken: string) {
    const tokenHash = generateTokenHash(refreshToken);
    
    const storedToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    });

    return { accessToken };
  }

  async logout(refreshToken: string) {
    const tokenHash = generateTokenHash(refreshToken);
    
    await prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });

    return { success: true };
  }

  private async generateTokens(user: any) {
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshTokenString = generateSecureToken();
    const refreshTokenHash = generateTokenHash(refreshTokenString);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
    };
  }

  private async sendVerificationEmail(email: string, firstName: string, otp: string) {
    const subject = 'Verify Your Email - Job Portal';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Job Portal, ${firstName}!</h2>
        <p>Thank you for signing up. Please verify your email address using the OTP below:</p>
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #333; font-size: 32px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">Job Portal Team</p>
      </div>
    `;

    try {
      await sendEmail({ to: email, subject, html });
      logger.info(`Verification email sent to ${email}`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${email}:`, error);
      throw new Error('Failed to send verification email');
    }
  }
}