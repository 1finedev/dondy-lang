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
import mongoose from 'mongoose';

export const messageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    event: {
      type: String,
      enum: ['bot_response', 'user_prompt'],
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const Message = mongoose.model('Message', messageSchema);
