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
import { logger, SocketError } from '@/common';
import type { ExtendedError } from 'node_modules/socket.io/dist/namespace';
import type { Socket } from 'socket.io';

type CatchSocketAsyncFunction = (
  socket: Socket,
  next?: (err?: ExtendedError | undefined) => void
) => Promise<boolean | void>;

export const catchSocketAsync = (fn: CatchSocketAsyncFunction) => {
  return (socket: Socket, next?: () => void) => {
    fn(socket, next).catch((err) => {
      const sessionId = socket.handshake.auth.sessionId;

      if (err instanceof SocketError) {
        logger.error(err);
        // If it's a SocketError, emit the error back to the client

        socket.emit('error', {
          message: err.message,
          data: err.data,
          restart: err.restart,
          disconnected: err.disconnect,
          sessionId: sessionId || null
        });

        if (err.disconnect) {
          socket.disconnect();
        }
        return;
      } else {
        logger.error(err);
        // If it's not a SocketError, emit a generic error message
        socket.emit('error', {
          message:
            "I apologize, but I'm experiencing a technical difficulty processing your request. Please try again or contact support if the issue persists.",
          data: {},
          restart: false,
          disconnected: false,
          sessionId: sessionId || null
        });
        return;
      }
      // Do not call next here
    });
  };
};
