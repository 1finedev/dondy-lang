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

import { logger } from '@/common';
import { JOB_TYPES, type I_JOB_DATA } from '@/common/interface/queues';
import { Job, Worker, type WorkerOptions } from 'bullmq';
import { handleMessageNLP } from './handlers';
import { connection } from './queue';

// define worker options
interface MainWorkerOptions extends WorkerOptions {}

const mainWorkerOptions: MainWorkerOptions = {
  connection
};

// create a worker to process jobs from the job queue
export const mainWorker = new Worker<I_JOB_DATA>(
  'mainQueue',
  async (job: Job) => {
    switch (job.data.type as JOB_TYPES) {
      case JOB_TYPES.PROCESS_MESSAGE:
        return handleMessageNLP(job.data);
        break;
      default:
        logger.error('Unknown job type');
        break;
    }
  },
  mainWorkerOptions
);

mainWorker.on('error', (err) => {
  // log the error
  console.error(`Error processing job: ${err}`);
});
