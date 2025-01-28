import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';

const response: FastifyPluginAsync = async (fastify) => {
    fastify.addHook('onSend', (request, reply, payload, done) => {
        if (!payload) {
            return done(null, payload);
        }

        let parsedPayload: unknown;
        if (typeof payload === 'object') {
            parsedPayload = payload;
        } else {
            try {
                parsedPayload = JSON.parse(payload as string);
            } catch {
                parsedPayload = payload;
            }
        }

        if (reply.statusCode >= 200 && reply.statusCode < 300) {
            const wrappedSuccess = {
                success: true,
                error: null,
                data: parsedPayload,
            };
            done(null, JSON.stringify(wrappedSuccess));
        } else {
            const wrappedError = {
                success: false,
                error: parsedPayload,
                data: null
            };
            done(null, JSON.stringify(wrappedError));
        }
    });
};

export default fp(response);
