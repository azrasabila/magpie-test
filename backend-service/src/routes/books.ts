// src/routes/books.ts
import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

// Define the shape of the request body for creating/updating a book
interface CreateBookBody {
  title: string;
  author: string;
  isbn: string;
  quantity: number;
  categoryId: number;
}

interface UpdateBookBody {
  title?: string;
  author?: string;
  isbn?: string;
  quantity?: number;
  categoryId?: number;
}

const booksRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // CREATE Book
  fastify.post<{ Body: CreateBookBody }>(
    '/books',
    { preHandler: [authenticate] }, // If you want to secure it
    async (request, reply) => {
      const { title, author, isbn, quantity, categoryId } = request.body;

      // userId from JWT
      const userId = (request.user as any).id;

      // 1. Create the Book
      const newBook = await fastify.prisma.book.create({
        data: {
          title,
          author,
          isbn,
          quantity,
          category: {
            connect: { id: categoryId },
          },
          user: {
            connect: { id: userId },
          },
        },
      });

      // 2. Create or Update BookStatus for this new book
      //    Because it's a brand new book, we can assume no BookStatus yet.
      //    But we can upsert just in case.
      await fastify.prisma.bookStatus.upsert({
        where: { bookId: newBook.id },
        update: {
          availableQty: quantity,
          borrowedQty: 0,
        },
        create: {
          bookId: newBook.id,
          availableQty: quantity,
          borrowedQty: 0,
        },
      });

      return newBook;
    }
  );



  // READ (List all books)
  fastify.get('/books', { preHandler: [authenticate] }, async (request, reply) => {
    const books = await fastify.prisma.book.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        quantity: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    return books;
  });

  // READ (Single book by ID)
  fastify.get<{ Params: { id: string } }>('/books/:id', async (request, reply) => {
    const { id } = request.params;
    const book = await fastify.prisma.book.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        quantity: true,
        category: {
          select: {
            name: true,
          },
        },
      },
    });
    return book;
  });

  // UPDATE Book
  fastify.put<{ Params: { id: string }; Body: UpdateBookBody }>(
    '/books/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const { title, author, isbn, quantity, categoryId } = request.body;

      const updatedBook = await fastify.prisma.book.update({
        where: { id: Number(id) },
        data: {
          title,
          author,
          isbn,
          quantity,
          category: {
            connect: {
              id: categoryId,
            },
          },
        },
      });

      await fastify.prisma.bookStatus.update({
        where: { bookId: Number(id) },
        data: {
          availableQty: quantity,
        },
      });

      return updatedBook;
    }
  );


  // DELETE Book
  fastify.delete<{ Params: { id: string } }>('/books/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params;
    await fastify.prisma.book.delete({ where: { id: Number(id) } });
    await fastify.prisma.bookStatus.delete({ where: { bookId: Number(id) } });
    return { message: 'Book deleted' };
  });
};

export default booksRoutes;
