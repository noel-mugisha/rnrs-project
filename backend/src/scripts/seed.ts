import { PrismaClient, JobStatus } from '@prisma/client';
import { hashPassword } from '@/utils/auth';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = await hashPassword('Admin123!');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@jobportal.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@jobportal.com',
        passwordHash: adminPassword,
        role: 'ADMIN',
        emailVerified: true,
      },
    });

    console.log('✅ Admin user created');

    // Create job seeker
    const jobSeekerPassword = await hashPassword('JobSeeker123!');
    const jobSeeker = await prisma.user.upsert({
      where: { email: 'jobseeker@example.com' },
      update: {},
      create: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'jobseeker@example.com',
        passwordHash: jobSeekerPassword,
        role: 'JOBSEEKER',
        emailVerified: true,
        phone: '+1234567890',
        jobSeekerProfile: {
          create: {
            desiredTitle: 'Software Engineer',
            about: 'Passionate software engineer with 3+ years of experience in full-stack development.',
            skills: [
              { id: '1', name: 'JavaScript', confidence: 5 },
              { id: '2', name: 'React', confidence: 4 },
              { id: '3', name: 'Node.js', confidence: 4 },
              { id: '4', name: 'TypeScript', confidence: 4 },
            ],
            privacy: { hideContact: false },
          },
        },
      },
    });

    console.log('✅ Job seeker created');

    // Create job provider
    const jobProviderPassword = await hashPassword('JobProvider123!');
    const jobProvider = await prisma.user.upsert({
      where: { email: 'employer@example.com' },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'employer@example.com',
        passwordHash: jobProviderPassword,
        role: 'JOBPROVIDER',
        emailVerified: true,
        phone: '+1234567891',
        employerProfile: {
          create: {
            name: 'TechCorp Inc.',
            website: 'https://techcorp.com',
            industry: 'Technology',
            location: 'San Francisco, CA',
          },
        },
      },
    });

    console.log('✅ Job provider created');

    // Create sample jobs
    const employer = await prisma.employer.findUnique({
      where: { ownerId: jobProvider.id },
    });

    if (employer) {
      const jobs = [
        {
          title: 'Senior Full Stack Developer',
          slug: 'senior-full-stack-developer-' + Date.now(),
          description: 'We are looking for a senior full stack developer to join our growing team.',
          responsibilities: [
            'Develop and maintain web applications',
            'Collaborate with cross-functional teams',
            'Write clean, maintainable code',
            'Mentor junior developers',
          ],
          requirements: [
            '5+ years of experience in full stack development',
            'Proficiency in JavaScript, React, and Node.js',
            'Experience with databases (PostgreSQL, MongoDB)',
            'Strong problem-solving skills',
          ],
          location: 'San Francisco, CA',
          remote: true,
          jobType: 'FULL_TIME',
          experienceLevel: 'SENIOR',
          salaryRange: {
            min: 120000,
            max: 180000,
            currency: 'USD',
          },
          status: JobStatus.PUBLISHED,
          postedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        {
          title: 'Frontend Developer',
          slug: 'frontend-developer-' + Date.now(),
          description: 'Join our team as a frontend developer and help build amazing user experiences.',
          responsibilities: [
            'Build responsive web applications',
            'Implement UI/UX designs',
            'Optimize application performance',
            'Write unit and integration tests',
          ],
          requirements: [
            '3+ years of experience in frontend development',
            'Proficiency in React, TypeScript, and CSS',
            'Experience with modern build tools',
            'Knowledge of web accessibility standards',
          ],
          location: 'Remote',
          remote: true,
          jobType: 'FULL_TIME',
          experienceLevel: 'MID',
          salaryRange: {
            min: 80000,
            max: 120000,
            currency: 'USD',
          },
          status: JobStatus.PUBLISHED,
          postedAt: new Date(),
          expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days
        },
      ];

      for (const jobData of jobs) {
        await prisma.job.create({
          data: {
            ...jobData,
            employerId: employer.id,
          },
        });
      }

      console.log('✅ Sample jobs created');
    }

    console.log('🎉 Database seeded successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('Admin: admin@jobportal.com / Admin123!');
    console.log('Job Seeker: jobseeker@example.com / JobSeeker123!');
    console.log('Job Provider: employer@example.com / JobProvider123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});