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

import { type Response } from 'express';

export async function sendResponse(
  res: Response,
  statusCode: number = 200,
  data: Record<string, any> | string | null,
  message: string
) {
  res.status(statusCode).json({
    status: true,
    data: data,
    responseCode: statusCode,
    message: message ?? 'Success'
  });
}
