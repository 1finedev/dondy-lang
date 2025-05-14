/*
 * ############################################################################### *
 * Created Date: Mo May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Wed May 14 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { JOB_TYPES, SocketError, validateRequestPayload } from '@/common';
import { Message } from '@/models';
import { addJobToQueue } from '@/queues';
import { Socket } from 'socket.io';
import { z } from 'zod';

const messageValidationSchema = z.object({
  content: z
    .string()
    .min(1, {
      message: 'Message content cannot be empty'
    })
    .max(255, {
      message: 'Message content cannot exceed 255 characters'
    }),
  resumedSession: z.boolean().optional()
});

export const handleMessageReceived = async (
  socket: Socket,
  payload: z.infer<typeof messageValidationSchema>
) => {
  const { content, resumedSession } = await validateRequestPayload(
    payload,
    messageValidationSchema,
    socket.id
  );

  const sessionId = socket.handshake.auth.sessionId as string;

  console.log(socket.handshake.auth);

  if (!sessionId)
    throw new SocketError('An unexpected error occurred', { restart: true });

  const message = await Message.create({
    sessionId,
    content,
    event: 'user_prompt'
  });

  if (!message) throw new SocketError('Failed to create message');

  addJobToQueue({
    type: JOB_TYPES.PROCESS_MESSAGE,
    socketId: socket.id,
    message: content,
    sessionId,
    resumedSession: resumedSession || false
  });
};
