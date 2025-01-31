import { FastifyPluginAsync } from 'fastify';
import { format, startOfMonth, subMonths } from 'date-fns';

const analyticsRoutes: FastifyPluginAsync = async (fastify) => {
   // get most borrowed books
  fastify.get('/analytics/most-borrowed', async (request, reply) => {
    const groupData = await fastify.prisma.lending.groupBy({
      by: ['bookId'],
      _count: { bookId: true },
      orderBy: { _count: { bookId: 'desc' } },
      take: 3,
    });

    const bookIds = groupData.map((item) => item.bookId);
    const books = await fastify.prisma.book.findMany({
      where: { id: { in: bookIds } },
    });

    const result = groupData.map((item) => {
      const book = books.find((b) => b.id === item.bookId);
      return {
        bookId: item.bookId,
        borrowCount: item._count.bookId,
        bookTitle: book?.title,
        bookAuthor: book?.author,
      };
    });

    return result;
  });

   // book lending trends per 6 months
  fastify.get('/analytics/monthly-trends', async (request, reply) => {
    const currentMonthStart = startOfMonth(new Date());
    const sixMonthsAgo = subMonths(currentMonthStart, 5);

    const lendings = await fastify.prisma.lending.findMany({
      where: {
        borrowedDate: {
          gte: sixMonthsAgo,
        },
      },
    });

    type MonthlyCount = { [month: string]: number };
    const monthlyCounts: MonthlyCount = {};

    for (const lending of lendings) {
      const monthKey = format(lending.borrowedDate, 'MMM yyyy');
      monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
    }

    const result = Object.entries(monthlyCounts).map(([month, count]) => ({
      month,
      count,
    }));

    return result;
  });

   // shows how many books exist in each category
  fastify.get('/analytics/category-distribution', async (request, reply) => {
    const groupData = await fastify.prisma.book.groupBy({
      by: ['categoryId'],
      _count: { categoryId: true },
    });

    const categoryIds = groupData.map((item) => item.categoryId);
    const categories = await fastify.prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const result = groupData.map((item) => {
      const category = categories.find((c) => c.id === item.categoryId);
      return {
        categoryId: item.categoryId,
        categoryName: category?.name,
        bookCount: item._count.categoryId,
      };
    });

    return result;
  });
};

export default analyticsRoutes;
