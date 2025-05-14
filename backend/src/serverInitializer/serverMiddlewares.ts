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

import { ENVIRONMENT, logger, stream } from '@/common';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response
} from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import helmet, { type HelmetOptions } from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

export const initializeMiddlewares = (app: Express) => {
  /**
   * Express configuration
   */
  app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']); // Enable trust proxy
  app.use(cookieParser());
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  /**
   * Compression Middleware
   */
  app.use(compression());

  // Rate limiter middleware
  // Function to handle rate limit exceeded
  function rateLimitExceeded(
    req: Request,
    res: Response,
    next: NextFunction,
    options: any
  ) {
    return res.status(429).json({
      status: 'error',
      message: 'Too many requests from this IP, please try again later.'
    });
  }

  // Rate limiter middleware
  const limiter = rateLimit({
    windowMs: 1000, // 1 second
    max: 2, // Limit each IP to 2 requests per second
    message: 'Too many requests, please try again later.',
    handler: rateLimitExceeded
  });

  app.use(limiter);

  //Middleware to allow CORS from frontend
  app.use(
    cors({
      origin: ['http://localhost:3000', 'https://dondy.vercel.app'],
      credentials: true
    })
  );

  //Configure Content Security Policy (CSP)
  //prevent Cross-Site Scripting (XSS) attacks by not allowing the loading of content from other domains.
  const contentSecurityPolicy = {
    directives: {
      defaultSrc: ["'self'", 'http://localhost:3000'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      frameAncestors: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  };

  // Use Helmet middleware for security headers
  app.use(
    helmet({
      contentSecurityPolicy: false // Disable the default CSP middleware
    })
  );

  // Use helmet-csp middleware for Content Security Policy
  app.use(helmet.contentSecurityPolicy(contentSecurityPolicy));

  const helmetConfig: HelmetOptions = {
    // X-Frame-Options header to prevent clickjacking
    frameguard: { action: 'deny' },
    // X-XSS-Protection header to enable browser's built-in XSS protection
    xssFilter: true,
    // Referrer-Policy header
    referrerPolicy: { policy: 'strict-origin' },
    // Strict-Transport-Security (HSTS) header for HTTPS enforcement
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
  };

  app.use(helmet(helmetConfig));

  //Secure cookies and other helmet-related configurations
  app.use(helmet.hidePoweredBy());
  app.use(helmet.noSniff());
  app.use(helmet.ieNoOpen());
  app.use(helmet.dnsPrefetchControl());
  app.use(helmet.permittedCrossDomainPolicies());

  // Prevent browser from caching sensitive information
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });

  // Data sanitization against NoSQL query injection
  app.use(
    mongoSanitize({
      onSanitize: ({ req, key }) => {
        logger.warn(`This request[${key}] is sanitized`, req);
      }
    })
  );

  // Prevent parameter pollution
  app.use(
    hpp({
      whitelist: ['date', 'createdAt'] // whitelist some parameters
    })
  );

  /**
   * Logger Middleware
   */
  app.use(
    morgan(ENVIRONMENT.APP.ENV !== 'development' ? 'combined' : 'dev', {
      stream
    })
  );
};
