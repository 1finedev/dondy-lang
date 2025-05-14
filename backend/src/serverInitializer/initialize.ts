/*
 * ############################################################################### *
 * Created Date: Mon May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Wed May 14 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { ENVIRONMENT, connectDb, logger } from '@/common';
import { instrument } from '@socket.io/admin-ui';

import { initializeEventListeners } from '@/controllers';
import { startQueues } from '@/queues/initialize';
import type { Express } from 'express';
import { Server } from 'socket.io';
import { graceFullShutdown } from './gracefulShutdown';

// extend the socket io interface to include additional types
declare module 'socket.io' {
  interface Socket {}
}
// extend the express interface to include additional types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      io?: Server;
    }
  }
  var io: Server;
}

export const initializeAllServers = async (app: Express) => {
  /**
   * Bootstrap Socket server
   */

  // Start server, all queues and workers

  const PORT = ENVIRONMENT.APP.PORT;
  const APP_NAME = ENVIRONMENT.APP.NAME;

  // start the express server to reuse with socket on the same port
  const appServer = await app.listen(PORT, async () => {
    // START ALL QUEUES AND WORKERS HERE
    // start the email worker and queues
    await connectDb();
    await startQueues();
    // await seedDb();
    logger.info(`=> ${APP_NAME} HTTP server listening on port ${PORT}`);
    logger.info(`=> ${APP_NAME} Socket server listening on port ${PORT}`);
  });

  // ensure all the express middlewares are set up before starting the socket server
  // including security headers and other middlewares
  const io = new Server(appServer, {
    perMessageDeflate: {
      threshold: 32768
    },
    cors: {
      origin: ['http://localhost:3000', 'https://dondy.vercel.app'],
      credentials: true
    }
  });

  global.io = io as Server;

  instrument(io, {
    auth: false
  });

  io.on('connection', async (socket) => {
    initializeEventListeners(io, socket);
  });

  // graceFullShutdown
  graceFullShutdown(appServer);
};
