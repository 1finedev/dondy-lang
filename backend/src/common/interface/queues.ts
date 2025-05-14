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

export enum JOB_TYPES {
  PROCESS_MESSAGE = 'PROCESS_MESSAGE'
}

interface BASE_JOB_DATA {
  type: JOB_TYPES;
  priority?: number;
  delay?: number;
}

export interface PROCESS_MESSAGE_JOB_DATA extends BASE_JOB_DATA {
  message: string;
  socketId: string;
  sessionId: string;
  resumedSession?: boolean;
}

export type I_JOB_DATA = PROCESS_MESSAGE_JOB_DATA;
