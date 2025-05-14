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

import { ENVIRONMENT } from '@/common/config/environment';
import IORedis from 'ioredis';
import { logger } from './logger';

const redis = new IORedis(ENVIRONMENT.CACHE_REDIS.URL!);

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

redis.on('error', (err) => {
  logger.error('Redis error', err);
});

export const addToCache = async (
  key: string,
  value: string | number | object | Buffer,
  expiry?: number
) => {
  if (!key) throw new Error('Invalid key provided');

  if (!value) throw new Error('Invalid value provided');

  if (typeof value === 'object' && !(value instanceof Buffer)) {
    value = JSON.stringify(value);
  }

  return redis.set(
    key.toString(),
    value,
    'EX',
    expiry || ENVIRONMENT.CACHE_REDIS.DEFAULT_EXPIRY!
  );
};

export const getFromCache = async <T = string>(key: string) => {
  if (!key) throw new Error('Invalid key provided');

  const data = await redis.get(key.toString());
  if (!data) return null;

  let parseData;
  try {
    parseData = JSON.parse(data);
  } catch (error) {
    parseData = data;
  }

  return parseData as T;
};

export const removeFromCache = async (key: string) => {
  if (!key) throw new Error('Invalid key provided');

  const data = await redis.del(key.toString());

  if (!data) {
    return null;
  }
  return data;
};
