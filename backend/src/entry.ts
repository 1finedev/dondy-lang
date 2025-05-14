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

import { errorHandler } from '@/middlewares';
import {
  initializeAllServers,
  initializeMiddlewares,
  initializeRouters
} from '@/serverInitializer';
import express, { type Express } from 'express';

// Create a new express application instance
const app: Express = express();

/**
 * Express configuration & middlewares
 */
initializeMiddlewares(app);

/**
 * Bootstrap All server
 */
initializeAllServers(app);

/**
 * Initialize routes this is intentionally registered after the
 * server initialization to ensure that all middlewares are set up
 * and socket io is initialized and attached before the routes are
 * registered to the app.
 */
initializeRouters(app);

/**
 * Error handlers
 */
app.use(errorHandler);
