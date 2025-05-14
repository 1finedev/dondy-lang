/*
 * ############################################################################### *
 * Created Date: Mon May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Tue May 13 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { AppError, ENVIRONMENT, logger } from '@/common';
import { type NextFunction, type Request, type Response } from 'express';
import { Error as MongooseError, type CastError } from 'mongoose';

// Error handling functions
const handleMongooseCastError = (err: CastError): AppError => {
  const message = `Invalid ${err.path} value "${err.value}".`;
  return new AppError(message, 400);
};

const handleMongooseValidationError = (
  err: MongooseError.ValidationError
): AppError => {
  const errors = Object.values(err.errors).map((el) => (el as any).message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleMongooseDuplicateFieldsError = (
  err: { code: number; keyValue: { [key: string]: any } },
  next: NextFunction
): AppError | void => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0]
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(/(?=[A-Z])/)
      .map((word, index) =>
        index === 0
          ? word.charAt(0).toUpperCase() + word.slice(1)
          : word.toLowerCase()
      )
      .join('');

    const value = err.keyValue[field.toLowerCase()];
    const message = `${field} "${value}" has already been used!.`;
    return new AppError(message, 409);
  } else {
    next(err);
  }
};

const handleJWTError = (): AppError => {
  return new AppError('Invalid token. Please log in again!', 401);
};

const handleJWTExpiredError = (): AppError => {
  return new AppError('Your token has expired!', 401);
};

const handleTimeoutError = (): AppError => {
  return new AppError('Request timeout', 408);
};

const handleMongooseGenericError = (err: MongooseError): AppError => {
  logger.error(`err_mongoose ${JSON.stringify(err)}`);
  return new AppError('MSE: An error occurred, please contact support', 500);
};

const sendErrorDev = (err: AppError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err.data,
    responseCode: err.statusCode
  });
};

const sendErrorProd = (err: AppError, res: Response): void => {
  if (err?.isOperational) {
    logger.error('Error: ', err);
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err.data,
      responseCode: err.statusCode
    });
  } else {
    console.error('Error: ', err);
    // monitoringAlert(`500 Error: ${err.message}`, 'fe');
    res.status(500).json({
      responseCode: 500,
      status: 'ISR: Error',
      error: 'An Error occurred, we are looking into it',
      message: `😔 You didn't break it, we did!, Our team is on it!`
    });
  }
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (ENVIRONMENT.APP.ENV === 'development') {
    err.statusCode === 500 && logger.error(err);

    logger.error(
      `${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    sendErrorDev(err, res);
  } else {
    let error = err;
    const errorHandler = (): AppError => {
      if (err instanceof MongooseError) {
        switch (true) {
          case err instanceof MongooseError.CastError:
            return handleMongooseCastError(err as MongooseError.CastError);
          case err instanceof MongooseError.ValidationError:
            return handleMongooseValidationError(
              err as MongooseError.ValidationError
            );
          default:
            return handleMongooseGenericError(err);
        }
      }

      switch (true) {
        case 'timeout' in err && err.timeout:
          return handleTimeoutError();
        case err.name === 'JsonWebTokenError':
          return handleJWTError();
        case err.name === 'TokenExpiredError':
          return handleJWTExpiredError();
        case (err as MongooseError & { code: number }).code === 11000:
          return handleMongooseDuplicateFieldsError(err, next) || error;
        default:
          return error;
      }
    };

    error = errorHandler();

    sendErrorProd(error, res);
  }
};
