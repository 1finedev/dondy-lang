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

import type { CookieOptions, Request, Response } from 'express';
import { customAlphabet } from 'nanoid';
import type { Socket } from 'socket.io';
import { type ZodSchema } from 'zod';
import AppError from './appError';
import SocketError from './socketError';

export function sendSocketResponse(
  socket: Socket,
  event: string,
  message: string,
  data: Record<string, any>
) {
  return socket.emit('bot_response', {
    message,
    event,
    data
  });
}

export const validateRequestPayload = async <T>(
  payload: Record<string, any>,
  schema: ZodSchema<T>,
  socketId?: string
): Promise<T | never> => {
  const { success, error, data } = await schema.safeParseAsync(payload);
  if (!success) {
    const errorDetails = error.formErrors.fieldErrors;
    if (socketId) {
      throw new SocketError(
        Object.values(errorDetails)
          .map(
            (errors) =>
              `${Array.isArray(errors) ? errors[0]?.toLowerCase() : ''}`
          )
          .filter((msg) => msg)
          .join('. '),
        'error',
        errorDetails
      );
    } else {
      throw new AppError('Validation Failed', 422, errorDetails);
    }
  } else {
    return data as T;
  }
};

export const generateRandomString = (
  length: number,
  prefix?: string
): string => {
  const nanoid = customAlphabet(
    '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ',
    length
  );
  return prefix ? `${prefix}-${nanoid()}` : nanoid();
};

export const generateRandomNumber = (length: number): string => {
  const nanoid = customAlphabet('1234567890', length);
  return nanoid();
};

export const setCookie = (
  req: Request,
  res: Response,
  name: string,
  value: string,
  options: CookieOptions = {}
) => {
  const isPostman = req.headers['user-agent']?.includes('Postman');
  res.cookie(name, value, {
    httpOnly: true,
    secure: !isPostman,
    path: '/',
    sameSite: 'none',
    partitioned: true,
    ...options
  });
};
