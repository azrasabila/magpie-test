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

const membersRoutes: FastifyPluginAsync = async (fastify) => {
   // Create a new member
  fastify.post<{ Body: CreateMemberBody }>(
    '/members',
    { preHandler: [authenticate] }, // protect this route if desired
    async (request, reply) => {
      const { name, email, phone } = request.body;
      const userId = (request.user as any).id;

      // Optionally validate required fields
      if (!userId || !name || !email) {
        return reply
          .status(400)
          .send({ error: 'userId, name, and email are required' });
      }

      // Check if user exists
      const user = await fastify.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      // Create the Member
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
  fastify.get(
    '/members',
    { preHandler: [authenticate] }, // or make it public if desired
    async (request, reply) => {
      const members = await fastify.prisma.member.findMany();
      return members;
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
