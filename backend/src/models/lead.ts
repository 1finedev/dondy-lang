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

const leadSchema = new mongoose.Schema(
  {
    sessionId: { type: String, unique: true, sparse: true },
    email: { type: String, unique: true, sparse: true },
    companyName: { type: String },
    companyInfo: { type: String },
    relevanceTag: {
      type: String,
      enum: [
        'Not relevant',
        'Weak lead',
        'Hot lead',
        'Very big potential customer'
      ]
    }
  },
  {
    timestamps: true
  }
);

export const Lead = mongoose.model('Lead', leadSchema);
