import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import jwt from '@fastify/jwt';

import prismaPlugin from './plugins/prisma';
import booksRoutes from './routes/books';
import authRoutes from './routes/auth';

async function buildServer() {
  const server = Fastify({ logger: true });

  server.register(swagger, {
    prefix: '/swagger',
    openapi: {
      info: {
        title: 'Library API',
        description: 'API documentation for the Digital Library',
        version: '1.0.0',
      },
    },
    exposeHeadRoutes: true,
  });

  server.register(jwt, {
    secret: 'S3cr3t',
  });

  // Register plugins and routes
  server.register(prismaPlugin);
  server.register(booksRoutes);
  server.register(authRoutes);

  return server;
}

async function start() {
  const server = await buildServer();
  try {
    const address = await server.listen({ port: 3000 });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
