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

import { CustomError } from 'ts-custom-error';

export default class AppError extends CustomError {
  statusCode: number;
  status: string;
  isOperational: boolean;
  data?: unknown;

  constructor(message: string, statusCode: number = 400, data?: unknown) {
    super(message);
    // Object.setPrototypeOf(this, AppError.prototype);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('5') ? 'Failed' : 'Error';
    this.isOperational = true;
    this.data = data;

    Error.captureStackTrace(this, this.constructor);
  }
}
