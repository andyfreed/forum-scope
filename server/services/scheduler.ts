import * as cron from 'node-cron';
import { socialMediaIntegrator } from './social-media';
import { forumScraper } from './scraper';

export class SchedulerService {
  private scheduledTasks: Map<string, cron.ScheduledTask> = new Map();

  startAllScheduledTasks() {
    console.log('Starting all scheduled tasks...');
    
    // Social media aggregation every 2 hours
    const socialMediaTask = cron.schedule('0 */2 * * *', async () => {
      console.log('Running scheduled social media aggregation...');
      try {
        await socialMediaIntegrator.aggregateAllSources();
        console.log('Scheduled social media aggregation completed');
      } catch (error) {
        console.error('Scheduled social media aggregation failed:', error);
      }
    }, {
      scheduled: false
    });

    // Forum scraping every 3 hours
    const forumScrapingTask = cron.schedule('0 */3 * * *', async () => {
      console.log('Running scheduled forum scraping...');
      try {
        await forumScraper.scrapeAndAnalyze();
        console.log('Scheduled forum scraping completed');
      } catch (error) {
        console.error('Scheduled forum scraping failed:', error);
      }
    }, {
      scheduled: false
    });

    // Store tasks for management
    this.scheduledTasks.set('socialMedia', socialMediaTask);
    this.scheduledTasks.set('forumScraping', forumScrapingTask);

    // Start all tasks
    socialMediaTask.start();
    forumScrapingTask.start();

    console.log('All scheduled tasks started successfully');
  }

  stopAllScheduledTasks() {
    console.log('Stopping all scheduled tasks...');
    this.scheduledTasks.forEach((task, name) => {
      task.stop();
      console.log(`Stopped task: ${name}`);
    });
  }

  getTaskStatus() {
    const status: Record<string, boolean> = {};
    this.scheduledTasks.forEach((task, name) => {
      status[name] = task.running;
    });
    return status;
  }

  // Run social media aggregation immediately
  async runSocialMediaAggregation() {
    console.log('Running immediate social media aggregation...');
    try {
      await socialMediaIntegrator.aggregateAllSources();
      console.log('Immediate social media aggregation completed');
      return { success: true, message: 'Social media aggregation completed' };
    } catch (error) {
      console.error('Immediate social media aggregation failed:', error);
      return { success: false, message: error.message };
    }
  }

  // Run forum scraping immediately
  async runForumScraping() {
    console.log('Running immediate forum scraping...');
    try {
      await forumScraper.scrapeAndAnalyze();
      console.log('Immediate forum scraping completed');
      return { success: true, message: 'Forum scraping completed' };
    } catch (error) {
      console.error('Immediate forum scraping failed:', error);
      return { success: false, message: error.message };
    }
  }
}

export const schedulerService = new SchedulerService();