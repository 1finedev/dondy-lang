/*
 * ############################################################################### *
 * Created Date: Tu Apr 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Tue May 13 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { ENVIRONMENT } from '@/common';
import type { I_JOB_DATA } from '@/common/interface/queues';
import { logger } from '@/common/utils';
import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000; // 3 seconds

// create a connection to Redis
const connection = new IORedis(ENVIRONMENT.QUEUE_REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  offlineQueue: false,
  retryStrategy: (times) => {
    if (times >= MAX_RETRIES) {
      // Give up after MAX_RETRIES
      console.error('Unable to connect to Redis after maximum retries');
      return null;
    }
    // Retry after RETRY_DELAY_MS milliseconds
    return RETRY_DELAY_MS;
  }
});

if (connection) {
  logger.info('Connected to QUEUE redis');
}

// Create a new connection in every node instance
const mainQueue = new Queue<I_JOB_DATA>('mainQueue', {
  connection
});

// EVENT LISTENERS
// create a queue event listener
const mainQueueEvent = new QueueEvents('mainQueue', { connection });

mainQueueEvent.on('failed', ({ jobId, failedReason }) => {
  logger.error(`Job ${jobId} failed with error ${failedReason}`);
});

mainQueueEvent.on('waiting', (job) => {
  logger.info(`A job with ID ${job.jobId} is waiting`);
});

mainQueueEvent.on('completed', ({ jobId, returnvalue }) => {
  logger.info(`Job ${jobId} completed`, returnvalue);
  // Called every time a job is completed in any worker
});

export { connection, mainQueue, mainQueueEvent };
