import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

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

interface BookQueryParams {
  search?: string;
  categoryId?: string;
  page?: string;
  pageSize?: string;
}

const booksRoutes: FastifyPluginAsync = async (fastify, opts) => {
  // CREATE Book
  fastify.post<{ Body: CreateBookBody }>(
    '/books',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { title, author, isbn, quantity, categoryId } = request.body;

      if (!title || !author || !isbn || !quantity) {
        return reply.status(400).send({ message: 'Title, Author, ISBN, and Quantity are required' });
      }

      const userId = (request.user as any).id;

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

      // Create or Update BookStatus for this new book
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
  fastify.get<{
    Querystring: BookQueryParams;
  }>(
    '/books',
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { search, categoryId, page = '1', pageSize = '10' } = request.query;

      const pageNumber = parseInt(page, 10) || 1;
      const pageSizeNumber = parseInt(pageSize, 10) || 10;

      const whereClause: any = {};

      // Search logic
      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Filter by category
      if (categoryId) {
        const catIdNumber = parseInt(categoryId, 10);
        whereClause.categoryId = catIdNumber;
      }

      const totalCount = await fastify.prisma.book.count({
        where: whereClause,
      });

      const books = await fastify.prisma.book.findMany({
        where: whereClause,
        skip: (pageNumber - 1) * pageSizeNumber,
        take: pageSizeNumber,
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
          bookStatus: {
            select: {
              availableQty: true,
              borrowedQty: true,
            },
          },
        },
        orderBy: { id: 'desc' },
      });

      const totalPages = Math.ceil(totalCount / pageSizeNumber);

      return {
        pagination: {
          currentPage: pageNumber,
          pageSize: pageSizeNumber,
          totalCount,
          totalPages,
        },
        data: books,
      };
    }
  );

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
        bookStatus: {
          select: {
            availableQty: true,
            borrowedQty: true,
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

      if (!title || !author || !isbn || !quantity) {
        return reply.status(400).send({ message: 'Title, Author, ISBN, and Quantity are required' });
      }

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
