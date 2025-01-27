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
  fastify.post('/books', { preHandler: [authenticate] }, async (request, reply) => {
    const userId = (request.user as any).id;

    const { title, author, isbn, quantity, categoryId } = request.body as CreateBookBody;

    const book = await fastify.prisma.book.create({
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
    return book;
  });
  
  

  // READ (List all books)
  fastify.get('/books', { preHandler: [authenticate] }, async (request, reply) => {
    const books = await fastify.prisma.book.findMany();
    return books;
  });

  // READ (Single book by ID)
  fastify.get<{ Params: { id: string } }>('/books/:id', async (request, reply) => {
    const { id } = request.params;
    const book = await fastify.prisma.book.findUnique({
      where: { id: Number(id) },
    });
    return book;
  });

  // UPDATE Book
  fastify.put<{ Params: { id: string }; Body: UpdateBookBody }>(
    '/books/:id',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params;
      const { title, author, isbn, quantity, categoryId } = request.body; // note 'categoryId'
      
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
      return updatedBook;
    }
  );
  

  // DELETE Book
  fastify.delete<{ Params: { id: string } }>('/books/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const { id } = request.params;
    await fastify.prisma.book.delete({ where: { id: Number(id) } });
    return { message: 'Book deleted' };
  });
};

export default booksRoutes;
