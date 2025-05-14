/*
 * ############################################################################### *
 * Created Date: Mon May 2025                                                   *
 * Author: Emmanuel Bayode O.                                                  *
 * -----                                                                       *
 * Last Modified: Tue May 13 2025                                              *
 * Modified By: Emmanuel Bayode O.                                             *
 * -----                                                                       *
 * HISTORY:                                                                    *
 * Date      	By	Comments                                                   *
 * ############################################################################### *
 */

export const ENVIRONMENT = {
  APP: {
    NAME: Bun.env.APP_NAME,
    PORT: parseInt(Bun.env.PORT || Bun.env.APP_PORT || '6000'),
    ENV: Bun.env.NODE_ENV
  },
  DB: {
    URL: Bun.env.DB_URL
  },
  QUEUE_REDIS_URL: Bun.env.QUEUE_REDIS_URL,
  CACHE_REDIS: {
    URL: Bun.env.CACHE_REDIS_URL,
    DEFAULT_EXPIRY: Bun.env.CACHE_REDIS_DEFAULT_EXPIRY
  },
  OPENAI: {
    URL: Bun.env.OPENAI_URL,
    API_KEY: Bun.env.OPENAI_API_KEY
  }
};

(() => {
  // recursively Check if all required environment variables are set
  for (const key in ENVIRONMENT) {
    if (typeof ENVIRONMENT[key as keyof typeof ENVIRONMENT] === 'object') {
      checkObject(ENVIRONMENT[key as keyof typeof ENVIRONMENT]);
    } else {
      if (ENVIRONMENT[key as keyof typeof ENVIRONMENT] === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
      }
    }
  }

  function checkObject(obj: any, parentKey = '') {
    for (const key in obj) {
      const fullKey = parentKey ? `${parentKey} > ${key}` : key;

      if (typeof obj[key] === 'object' && obj[key] == null) {
        checkObject(obj[key], fullKey);
      } else if (obj[key] === undefined) {
        throw new Error(`Environment variable '${fullKey}' is not set`);
      }
    }
  }
})();
