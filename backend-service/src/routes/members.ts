import { FastifyPluginAsync } from 'fastify';
import { authenticate } from '../plugins/auth';

interface CreateMemberBody {
    name: string;
    email: string;
    phone?: string;
}

interface UpdateMemberBody {
    name?: string;
    email?: string;
    phone?: string;
    status?: string;
    joinedDate?: string;
}

interface MemberQueryParams {
    search?: string;
    status?: string;
    page?: string;
    pageSize?: string;
}

const membersRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post<{ Body: CreateMemberBody }>(
        '/members',
        { preHandler: [authenticate] }, // protect this route if desired
        async (request, reply) => {
            const { name, email, phone } = request.body;
            const userId = (request.user as any).id;

            if (!userId || !name || !email) {
                return reply
                    .status(400)
                    .send({ error: 'userId, name, and email are required' });
            }

            const user = await fastify.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return reply.status(404).send({ error: 'User not found' });
            }

            const newMember = await fastify.prisma.member.create({
                data: {
                    userId,
                    name,
                    email,
                    phone,
                    status: 'ACTIVE',
                    joinedDate: new Date(),
                },
            });

            return newMember;
        }
    );

    // List all members
    fastify.get<{
        Querystring: MemberQueryParams;
    }>(
        '/members',
        { preHandler: [authenticate] },
        async (request, reply) => {
            const { search, status, page = '1', pageSize = '10' } = request.query;

            const pageNumber = parseInt(page, 10) || 1;
            const pageSizeNumber = parseInt(pageSize, 10) || 10;

            const whereClause: any = {};

            if (status) {
                whereClause.status = status;
            }

            if (search) {
                whereClause.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                ];
            }

            const totalCount = await fastify.prisma.member.count({
                where: whereClause,
            });

            // 4. Fetch paginated members
            const members = await fastify.prisma.member.findMany({
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
                data: members,
            };
        }
    );

    // Get a single member by ID
    fastify.get<{ Params: { id: string } }>(
        '/members/:id',
        { preHandler: [authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const member = await fastify.prisma.member.findUnique({
                where: { id: Number(id) },
                include: {
                    lendings: true,
                },
            });
            if (!member) {
                return reply.status(404).send({ error: 'Member not found' });
            }
            return member;
        }
    );

    // Update an existing member
    fastify.put<{ Params: { id: string }; Body: UpdateMemberBody }>(
        '/members/:id',
        { preHandler: [authenticate] },
        async (request, reply) => {
            const { id } = request.params;
            const { name, email, phone, status, joinedDate } = request.body;

            const existingMember = await fastify.prisma.member.findUnique({
                where: { id: Number(id) },
            });
            if (!existingMember) {
                return reply.status(404).send({ error: 'Member not found' });
            }

            const updatedMember = await fastify.prisma.member.update({
                where: { id: Number(id) },
                data: {
                    name,
                    email,
                    phone,
                    status,
                    joinedDate: joinedDate ? new Date(joinedDate) : undefined,
                },
            });

            return updatedMember;
        }
    );

    // Delete a member
    fastify.delete<{ Params: { id: string } }>(
        '/members/:id',
        { preHandler: [authenticate] },
        async (request, reply) => {
            const { id } = request.params;

            const existingMember = await fastify.prisma.member.findUnique({
                where: { id: Number(id) },
            });
            if (!existingMember) {
                return reply.status(404).send({ error: 'Member not found' });
            }

            await fastify.prisma.member.delete({
                where: { id: Number(id) },
            });

            return { message: 'Member deleted' };
        }
    );
};

export default membersRoutes;
