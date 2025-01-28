import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

interface CreateCategoryBody {
    name: string;
}

interface UpdateCategoryBody {
    name?: string;
}

interface CategoryQueryParams {
    search?: string;
    page?: string;
    pageSize?: string;
}

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post<{ Body: CreateCategoryBody }>(
        '/categories',
        {
            preHandler: [authenticate],
        },
        async (request, reply) => {
            const { name } = request.body;
            const category = await fastify.prisma.category.create({
                data: { name },
            });
            return category;
        }
    );

    // Get all Categories (Public)
    fastify.get<{
        Querystring: CategoryQueryParams;
    }>('/categories', async (request, reply) => {
        const { search, page = '1', pageSize = '10' } = request.query;

        const pageNumber = parseInt(page, 10) || 1;
        const pageSizeNumber = parseInt(pageSize, 10) || 10;

        const whereClause: any = {};

        if (search) {
            whereClause.name = {
                contains: search,
                mode: 'insensitive',
            };
        }

        const totalCount = await fastify.prisma.category.count({
            where: whereClause,
        });

        const categories = await fastify.prisma.category.findMany({
            where: whereClause,
            skip: (pageNumber - 1) * pageSizeNumber,
            take: pageSizeNumber,
        });

        const totalPages = Math.ceil(totalCount / pageSizeNumber);

        return {
            pagination: {
                currentPage: pageNumber,
                pageSize: pageSizeNumber,
                totalCount,
                totalPages,
            },
            data: categories,
        };
    });

    fastify.get<{ Params: { id: string } }>(
        '/categories/:id',
        async (request, reply) => {
            const { id } = request.params;
            const category = await fastify.prisma.category.findUnique({
                where: { id: Number(id) },
            });
            if (!category) {
                return reply.status(404).send({ error: 'Category not found' });
            }
            return category;
        }
    );

    fastify.get<{ Params: { id: string } }>(
        '/categories/:id/books',
        async (request, reply) => {
            const { id } = request.params;
            const categoryWithBooks = await fastify.prisma.category.findUnique({
                where: { id: Number(id) },
                include: {
                    books: true,
                },
            });
            if (!categoryWithBooks) {
                return reply.status(404).send({ error: 'Category not found' });
            }
            return categoryWithBooks;
        }
    );

    fastify.put<{ Params: { id: string }; Body: UpdateCategoryBody }>(
        '/categories/:id',
        {
            preHandler: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;
            const { name } = request.body;

            // Optional: Check if category exists before updating
            const existingCategory = await fastify.prisma.category.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCategory) {
                return reply.status(404).send({ error: 'Category not found' });
            }

            const updatedCategory = await fastify.prisma.category.update({
                where: { id: Number(id) },
                data: { name },
            });
            return updatedCategory;
        }
    );

    fastify.delete<{ Params: { id: string } }>(
        '/categories/:id',
        {
            preHandler: [authenticate],
        },
        async (request, reply) => {
            const { id } = request.params;

            const existingCategory = await fastify.prisma.category.findUnique({
                where: { id: Number(id) },
            });
            if (!existingCategory) {
                return reply.status(404).send({ error: 'Category not found' });
            }

            await fastify.prisma.category.delete({
                where: { id: Number(id) },
            });
            return { message: 'Category deleted' };
        }
    );
};

export default categoriesRoutes;
