import { FastifyPluginAsync } from 'fastify';
import { compare, hash } from 'bcrypt';

interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  role?: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  // ---------------------
  //       Register
  // ---------------------
  fastify.post('/register', async (request, reply) => {
    const { email, password, name, role } = request.body as RegisterRequestBody;

    if (!email || !password || !name) {
      return reply.status(400).send({ message: 'Email, password, and name are required' });
    }

    const existingUser = await fastify.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return reply.status(400).send({ message: 'Email is already taken' });
    }

    const hashedPassword = await hash(password, 10);

    const newUser = await fastify.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'member', // Default to "member" if role not specified
      },
    });

    // const token = fastify.jwt.sign({ id: newUser.id, email: newUser.email }, { expiresIn: '1h' });

    return {
      message: 'User registered successfully',
      // token, // if you choose to sign a token here
    };
  });

  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body as LoginRequestBody;

    if (!email || !password) {
      return reply.status(400).send({ message: 'Email and password are required' });
    }

    const user = await fastify.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
      return reply.status(401).send({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = fastify.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });
    return { token };
  });
};

export default authRoutes;