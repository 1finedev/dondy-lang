/*
 * ############################################################################### *
 * Created Date: Tu May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Wed May 14 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { sendSocketResponse, validateRequestPayload } from '@/common';
import { Message } from '@/models';
import { type Socket } from 'socket.io';
import { z } from 'zod';

const fetchMessageValidationSchema = z.object({
  sessionId: z.string()
});

export const fetchMessages = async (
  socket: Socket,
  payload: z.infer<typeof fetchMessageValidationSchema>
) => {
  const { sessionId } = await validateRequestPayload(
    payload,
    fetchMessageValidationSchema,
    socket.id
  );

  const messages = await Message.find({ sessionId }).sort('-createdAt');

  sendSocketResponse(
    socket,
    'fetched_messages',
    'Messages fetched successfully',
    messages
  );
};
