import { randomUUID } from "crypto";
import { FastifyInstance } from "fastify";
import { knex } from '../database';
import { z } from "zod";
import { checkSessionIdExists } from "../middleware/check-session-id-exists";

// Unitários: Testa uma unidade da aplicação
// Integração: comunicação entre unidades
// E2E: simula um usuário operando na aplicação

// Pirâmide de testes: E2E (primário)

export async function transactionsRoutes(app:FastifyInstance) {
    app.get(
        '/', 
        {
            preHandler: [ checkSessionIdExists ]
        }, 
    async (req, reply) => {
        const sessionId = req.cookies.sessionId

        const transactions = await knex('transactions')
            .where('session_id', sessionId)
            .select('*')
        return { transactions }
    })

    app.get('/:id',
    {
        preHandler: [ checkSessionIdExists ]
    }, async (req) => {
        const getTransactionsParamsSchema = z.object({
            id: z.string().uuid()
        })
        const { id } = getTransactionsParamsSchema.parse(req.params)
        const sessionId = req.cookies.sessionId

        const transaction = await knex('transactions').where({
            session_id: sessionId,
            id
        }).first()
        return { transaction }
    })

    app.get('/summary', {
        preHandler: [ checkSessionIdExists ]
    }, async (req, reply) => {
        const sessionId = req.cookies.sessionId
        const summary = await knex('transactions')
            .sum('amount', {as: 'amount'})
            .where('session_id', sessionId)
            .first()
        return { summary } 
    })

    app.post("/", async (req, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type } = createTransactionBodySchema.parse(req.body)

        let sessionId = req.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()
            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            })
        }


        await knex('transactions')
            .insert({
                id: randomUUID(),
                title,
                amount: type === 'credit' ? amount : -1 * amount,
                session_id: sessionId
            })

        return reply.status(201).send()
    });
}