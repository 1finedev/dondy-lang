/*
 * ############################################################################### *
 * Created Date: Mon May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Mon May 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { ENVIRONMENT } from '@/common';
import mongoose, { type ConnectOptions } from 'mongoose';
import { logger } from '../utils';

export interface CustomConnectOptions extends ConnectOptions {
  maxPoolSize?: number;
  minPoolSize?: number;
}

export const connectDb = async (): Promise<void> => {
  try {
    if (!ENVIRONMENT.DB.URL) {
      logger.error('DB_URL is not provided in the environment variables');
      throw new Error('DB_URL is not provided in the environment variables');
    }
    const conn = await mongoose.connect(ENVIRONMENT.DB.URL, {
      ...(Bun.env.NODE_ENV === 'production' && {
        minPoolSize: 100,
        maxPoolSize: 200
      }),
      autoIndex: true
    } as CustomConnectOptions);

    logger.info(`Mongo DB Connected to ${conn.connection.name} DB`);
  } catch (error) {
    logger.error('Error: ' + (error as Error).message);
    process.exit(1);
  }
};
