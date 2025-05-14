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

import { logger } from '@/common';

export const graceFullShutdown = (server: any) => {
  process.on('SIGTERM', () => {
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGILL', () => {
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      process.exit(0);
    });
  });

  process.on('unhandledRejection', async (error: Error) => {
    logger.error(
      'UNHANDLED REJECTION! 💥 Server Shutting down... ' +
        new Date(Date.now()) +
        error
    );
    // STOP ALL QUEUES AND WORKERS
    server.close(() => {
      process.exit(1);
    });
  });

  /**
   *  uncaughtException handler
   */
  process.on('uncaughtException', async (error: Error) => {
    logger.error(
      'UNCAUGHT EXCEPTION!! 💥 Server Shutting down... ' +
        new Date(Date.now()) +
        error
    );

    process.exit(1);
  });
};
