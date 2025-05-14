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

import { logger } from '@/common';
import { catchSocketAsync } from '@/middlewares';
import { Message } from '@/models';
import { Server, Socket } from 'socket.io';
import { fetchLeads, fetchMessages, handleMessageReceived } from './handlers';

export const SOCKET_EVENTS = {
  message: handleMessageReceived,
  fetch_leads: fetchLeads,
  fetch_messages: fetchMessages
};

export const initializeEventListeners = async (io: Server, socket: Socket) => {
  logger.info(`Socket connection established: ${socket.id}`);

  const sessionId = socket.handshake.auth.sessionId as string;
  if (sessionId) {
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(20);

    socket.emit('initialize', { messageHistory: messages });
  }

  Object.entries(SOCKET_EVENTS).forEach(([event, handler]) => {
    socket.on(event, (payload) =>
      catchSocketAsync(async (socket) => await handler(socket, payload))(socket)
    );
  });
};
