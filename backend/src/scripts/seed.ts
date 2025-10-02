import { PrismaClient, JobStatus } from '@prisma/client';
import { hashPassword } from '@/utils/auth';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = await hashPassword('Admin123!');
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rnrs.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@rnrs.com',
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
        phone: '+250791234567',
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
      where: { email: 'jobprovider@example.com' },
      update: {},
      create: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jobprovider@example.com',
        passwordHash: jobProviderPassword,
        role: 'JOBPROVIDER',
        emailVerified: true,
        phone: '+250791234568',
        employerProfile: {
          create: {
            name: 'TechCorp Inc.',
            website: 'https://techcorp.com',
            industry: 'Technology',
            location: 'Kigali, Rwanda',
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
          workCategory: 'Technology',
          workType: 'Software Development',
          title: 'Senior Full Stack Developer',
          slug: 'senior-full-stack-developer-' + Date.now(),
          description: 'We are looking for a senior full stack developer to join our growing team. You will work on exciting projects using modern technologies and collaborate with a talented team.',
          requirements: '5+ years of experience in full stack development. Proficiency in JavaScript, React, and Node.js. Experience with databases (PostgreSQL, MongoDB). Strong problem-solving skills.',
          location: 'Kigali, Rwanda',
          salaryAmount: 5000000,
          remote: true,
          jobType: 'FULLTIME',
          experienceLevel: 'SENIOR',
          status: JobStatus.PUBLISHED,
          postedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        {
          workCategory: 'Technology',
          workType: 'Frontend Development',
          title: 'Frontend Developer',
          slug: 'frontend-developer-' + Date.now(),
          description: 'Join our team as a frontend developer and help build amazing user experiences. Work with modern frameworks and tools to create responsive, performant web applications.',
          requirements: '3+ years of experience in frontend development. Proficiency in React, TypeScript, and CSS. Experience with modern build tools. Knowledge of web accessibility standards.',
          location: 'Kigali, Rwanda',
          salaryAmount: 3500000,
          remote: true,
          jobType: 'FULLTIME',
          experienceLevel: 'MID',
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
    console.log('Admin: admin@rnrs.com / Admin123!');
    console.log('Job Seeker: jobseeker@example.com / JobSeeker123!');
    console.log('Job Provider: jobprovider@example.com / JobProvider123!');

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