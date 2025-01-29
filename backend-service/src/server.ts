import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import jwt from '@fastify/jwt';

import prismaPlugin from './plugins/prisma';
import booksRoutes from './routes/books';
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/category';
import lendingsRoutes from './routes/lending';
import membersRoutes from './routes/members';
import response from './plugins/response';
import analyticsRoutes from './routes/analytics';

async function buildServer() {
  const server = Fastify();

  server.register(swagger, {
    prefix: '/swagger',
    // openapi: {
    //   info: {
    //     title: 'Library API',
    //     description: 'API documentation for the Digital Library',
    //     version: '1.0.0',
    //   },
    // },
    // exposeHeadRoutes: true,
  });

  server.register(jwt, {
    secret: 'S3cr3t',
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
  try {
    const address = await server.listen({ port: 3000 });
    console.log(`Server listening at ${address}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
