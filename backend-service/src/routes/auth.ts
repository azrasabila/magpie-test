import { FastifyPluginAsync } from 'fastify';
import { compare } from 'bcrypt';

export interface LoginRequestBody {
    email: string;
    password: string;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
    fastify.post('/login', async (request, reply) => {
        const { email, password } = request.body as LoginRequestBody;

        if (!email || !password) {
            return reply.code(400).send({ message: 'Email and password are required' });
        }
        const user = await fastify.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return reply.code(401).send({ message: 'Invalid email or password' });
        }

        const isValid = await compare(password, user.password);
        if (!isValid) {
            return reply.code(401).send({ message: 'Invalid email or password' });
        }

        const token = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });
        return { token };
    });
};

export default authRoutes;
