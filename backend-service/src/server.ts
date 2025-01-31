import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';

import prismaPlugin from './plugins/prisma';
import booksRoutes from './routes/books';
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/category';
import lendingsRoutes from './routes/lending';
import membersRoutes from './routes/members';
import response from './plugins/response';
import analyticsRoutes from './routes/analytics';
import cors from "@fastify/cors";

export async function buildServer() {
  const server = Fastify();

  server.register(cors, {
    origin: "*",
    credentials: true,
  });

  await server.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Test swagger',
        description: 'Testing the Fastify swagger API',
        version: '0.1.0'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Development server'
        }
      ],
      tags: [
        { name: 'user', description: 'User related end-points' },
        { name: 'code', description: 'Code related end-points' }
      ],
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'apiKey',
            in: 'header'
          }
        }
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      }
    }
  });

  server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'none',
      deepLinking: false,
    },
    staticCSP: true,
    transformSpecificationClone: true,
  });

  server.register(jwt, {
    secret: process.env.JWT_SECRET ?? '',
  });

  server.register(prismaPlugin);
  server.register(response);

  server.register(booksRoutes);
  server.register(authRoutes);
  server.register(categoriesRoutes);
  server.register(lendingsRoutes);
  server.register(membersRoutes);
  server.register(analyticsRoutes);

  return server;
}

async function start() {
  const server = await buildServer();
  await server.ready();
  server.swagger();
  try {
    const address = await server.listen({ port: 3000 });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
