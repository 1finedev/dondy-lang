/*
 * ############################################################################### *
 * Created Date: Mo May 2025                                                   *
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
import type { I_JOB_DATA } from '@/common/interface/queues';
import { mainQueue } from '../queue';

export const addJobToQueue = async (payload: I_JOB_DATA) => {
  const { type, priority, delay } = payload;

  try {
    return await mainQueue.add(type, payload, {
      priority: priority ?? 2,
      ...(delay && { delay })
    });
  } catch (error) {
    logger.error(`error enqueueing job, ${error}`);
    return false;
  }
};

export const removeJobFromQueue = async (jobId: string) => {
  try {
    const job = await mainQueue.getJob(jobId);
    if (job) {
      await job.remove();
      return true;
    }
    return false;
  } catch (error) {
    logger.error(`error removing job: ${error}`);
    return false;
  }
};
