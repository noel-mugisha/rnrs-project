import { JobService } from './src/services/jobService';

const jobService = new JobService();

async function testGetMyJobs() {
  const userId = 'd55b3f43-7047-4ec8-8e70-6960c41e1f61';
  
  console.log('=== TESTING getMyJobs API ===\n');
  console.log(`User ID: ${userId}\n`);
  
  try {
    const filters = {
      page: 1,
      limit: 10
    };
    
    console.log('Calling jobService.getMyJobs...');
    const result = await jobService.getMyJobs(userId, filters);
    
    console.log('\n=== RESULT ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error: any) {
    console.error('ERROR:', error.message);
    console.error(error);
  }
}

testGetMyJobs();
