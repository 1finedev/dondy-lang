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
import { type Express } from 'express';

export const initializeRouters = (app: Express) => {
  app.use('/api/v1/alive', (req, res) =>
    res
      .status(200)
      .json({ status: 'success', message: 'Server is up and running' })
  );

  // fallback route
  app.all('/*', async (req, res) => {
    logger.error(
      'route not found ' + new Date(Date.now()) + ' ' + req.originalUrl
    );
    res.status(404).json({
      status: 'error',
      message: `OOPs!! No handler defined for ${req.method.toUpperCase()}: ${
        req.url
      } route. Check the API documentation for more details.`
    });
  });
};
