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

import { CustomError } from 'ts-custom-error';

export default class SocketError extends CustomError {
  statusCode?: number;
  status: string;
  isOperational: boolean;
  disconnect: boolean;
  restart: boolean;
  data?: unknown;

  constructor(
    message: string,
    data?: unknown,
    restart?: boolean,
    disconnect?: boolean,
    statusCode?: number
  ) {
    super(message);
    // Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode || 400;
    this.status = `${statusCode}`.startsWith('5') ? 'Failed' : 'Error';
    this.isOperational = true;
    this.restart = restart || false;
    this.data = data;
    this.disconnect = disconnect || false;

    Error.captureStackTrace(this, this.constructor);
  }
}
