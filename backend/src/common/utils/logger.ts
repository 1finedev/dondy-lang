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

import * as winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp }) => {
      const logEntry = `${timestamp} ${level}: ${message}`;
      return logEntry.replace(/\u001b\[0m/g, '');
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' })
  ]
});

export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};
