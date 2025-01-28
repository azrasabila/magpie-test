import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

interface CreateLendingBody {
  bookId: number;
  memberId: number;
  dueDate: string;
}

const lendingsRoutes: FastifyPluginAsync = async (fastify) => {

    // Create a new lending record (borrow a book)
  fastify.post<{ Body: CreateLendingBody }>(
    '/lendings',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { bookId, memberId, dueDate } = request.body;

      const userId = (request.user as any).id;

      const book = await fastify.prisma.book.findUnique({
        where: { id: Number(bookId) }
      });

      if (!book) {
        return reply.status(404).send({ error: 'Book not found' });
      }

      let bookStatus = await fastify.prisma.bookStatus.findUnique({
        where: { bookId },
      });

      if (!bookStatus) {
        bookStatus = await fastify.prisma.bookStatus.upsert({
            where: { bookId: book.id },
            update: {
              availableQty: book.quantity,
            },
            create: {
              bookId: book.id,
              availableQty: book.quantity,
              borrowedQty: 0,
            },
          });
      }

      // If no available book
      if (bookStatus.availableQty < 1) {
        return reply
          .status(400)
          .send({ error: 'No copies available for this book' });
      }

      const lending = await fastify.prisma.lending.create({
        data: {
          bookId,
          memberId,
          borrowedDate: new Date(),
          dueDate: new Date(dueDate),
          status: 'BORROWED',
          createdBy: userId,
        },
      });

      await fastify.prisma.bookStatus.update({
        where: { bookId },
        data: {
          availableQty: { decrement: 1 },
          borrowedQty: { increment: 1 },
        },
      });

      return lending;
    }
  );
  
  

   // Mark a lending record as returned
  fastify.put<{ Params: { id: string } }>(
    '/lendings/:id/return',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;

      // Optional: Fetch the lending first to confirm status or existence
      const existing = await fastify.prisma.lending.findUnique({
        where: { id: Number(id) },
      });
      if (!existing) {
        return reply.status(404).send({ error: 'Lending record not found' });
      }

      if (existing.status === 'RETURNED') {
        return reply.status(400).send({ error: 'Lending already returned' });
      }

      // Mark as returned
      const updatedLending = await fastify.prisma.lending.update({
        where: { id: Number(id) },
        data: {
          returnDate: new Date(),
          status: 'RETURNED',
        },
      });

      const book = await fastify.prisma.book.findUnique({
        where: { id: Number(updatedLending.bookId) },
        select: {
          id: true,
          quantity: true,
        },
      });

      if (!book) {
        return reply.status(404).send({ error: 'Book not found' });
      }

      await fastify.prisma.bookStatus.update({
        where: { bookId: book.id },
        data: {
          availableQty: { increment: 1 },
          borrowedQty: { decrement: 1 },
        },
      });

      return updatedLending;
    }
  );

   // Fetch all lending records
  fastify.get(
    '/lendings',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const lendings = await fastify.prisma.lending.findMany({
        // Include related data if needed, e.g. book, member:
        include: {
          book: true,
          member: true,
        },
      });
      return lendings;
    }
  );

   // Get a single lending record by ID
  fastify.get<{ Params: { id: string } }>(
    '/lendings/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const lending = await fastify.prisma.lending.findUnique({
        where: { id: Number(id) },
        include: {
          book: true,
          member: true,
        },
      });

      if (!lending) {
        return reply.status(404).send({ error: 'Lending record not found' });
      }

      return lending;
    }
  );
};

export default lendingsRoutes;
