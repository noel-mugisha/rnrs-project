import { prisma } from './src/config/database';

async function checkJobs() {
  try {
    console.log('=== DATABASE DIAGNOSTIC ===\n');
    
    // Count total jobs
    const totalJobs = await prisma.job.count();
    console.log(`Total jobs in database: ${totalJobs}\n`);
    
    // Get all employers
    const employers = await prisma.employer.findMany({
      include: {
        _count: {
          select: { jobs: true }
        }
      }
    });
    
    console.log('Employers in database:');
    employers.forEach(emp => {
      console.log(`- ${emp.name} (ID: ${emp.id})`);
      console.log(`  Owner ID: ${emp.ownerId}`);
      console.log(`  Jobs: ${emp._count.jobs}\n`);
    });
    
    // Get all jobs with employer info
    const jobs = await prisma.job.findMany({
      include: {
        employer: {
          select: {
            id: true,
            name: true,
            ownerId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\nRecent jobs:');
    if (jobs.length === 0) {
      console.log('No jobs found in database\n');
    } else {
      jobs.forEach(job => {
        console.log(`\nJob: ${job.title}`);
        console.log(`  ID: ${job.id}`);
        console.log(`  Status: ${job.status}`);
        console.log(`  Employer: ${job.employer.name} (${job.employer.id})`);
        console.log(`  Employer Owner: ${job.employer.ownerId}`);
        console.log(`  Created: ${job.createdAt}`);
      });
    }
    
    // Check specific employer
    const targetEmployerId = '39205408-5dd5-403c-a153-82c5d7dba238';
    console.log(`\n\n=== CHECKING TARGET EMPLOYER ===`);
    console.log(`Employer ID: ${targetEmployerId}\n`);
    
    const targetEmployer = await prisma.employer.findUnique({
      where: { id: targetEmployerId },
      include: {
        jobs: true,
        _count: {
          select: { jobs: true }
        }
      }
    });
    
    if (targetEmployer) {
      console.log(`Employer found: ${targetEmployer.name}`);
      console.log(`Owner ID: ${targetEmployer.ownerId}`);
      console.log(`Total jobs: ${targetEmployer._count.jobs}`);
      
      if (targetEmployer.jobs.length > 0) {
        console.log('\nJobs for this employer:');
        targetEmployer.jobs.forEach(job => {
          console.log(`  - ${job.title} (${job.status})`);
        });
      } else {
        console.log('\nNo jobs found for this employer');
      }
    } else {
      console.log('Employer not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJobs();
