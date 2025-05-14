/*
 * ############################################################################### *
 * Created Date: Tu May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Tue May 13 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

import { sendSocketResponse, validateRequestPayload } from '@/common';
import { Lead } from '@/models';
import { type Socket } from 'socket.io';
import { z } from 'zod';

const fetchLeadValidationSchema = z.object({
  limit: z.number(),
  page: z.number()
});

export const fetchLeads = async (
  socket: Socket,
  payload: z.infer<typeof fetchLeadValidationSchema>
) => {
  const { page = 1, limit = 10 } = await validateRequestPayload(
    payload,
    fetchLeadValidationSchema,
    socket.id
  );

  const skip = (page - 1) * limit;

  const leads = await Lead.find({}).skip(skip).limit(limit);

  const totalLeads = await Lead.countDocuments();
  const totalPages = Math.ceil(totalLeads / limit);

  sendSocketResponse(socket, 'fetch-leads', 'Leads fetched successfully', {
    leads,
    pagination: {
      currentPage: page,
      totalPages,
      totalLeads,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  });
};
