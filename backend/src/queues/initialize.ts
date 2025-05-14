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
import { mainQueue, mainQueueEvent } from './queue';
import { mainWorker } from './workers';

export const startQueues = async () => {
  await mainQueue.waitUntilReady();
  await mainWorker.waitUntilReady();
  await mainQueueEvent.waitUntilReady();
  logger.info('Queues and workers started successfully!');
};

export const stopQueues = async () => {
  await mainWorker.close();
  await mainQueue.close();
  logger.info('Queues and workers closed!');
};
