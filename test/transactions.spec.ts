import { afterAll, beforeAll, describe, expect, test, it, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import { app } from '../src/app'
import request from 'supertest'

describe('Transaction Routes',  () => {

    beforeAll(async () => {
        await app.ready()
    })
    
    afterAll(async () => {
        await app.close()
    })

    beforeEach(() => {
        execSync('npm run knex migrate:latest')
    })
    
    it('Should be able for a user to can create a transaction', async () => {
        await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })
            .expect(201)
    })

    it('Should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })
            

        const cookies = createTransactionResponse.get('Set-Cookie')
        
        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000,
            })
        ])
    })

    it('Should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 5000,
                type: 'credit'
            })
            

        const cookies = createTransactionResponse.get('Set-Cookie')
        
        const listTransactionsResponse = await request(app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionResponse = await request(app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New Transaction',
                amount: 5000,
            })
        )
    })

    it('Should be able to list all transactions', async () => {
        const createTransactionResponse = await request(app.server)
            .post('/transactions')
            .send({
                title: 'Credit Transaction',
                amount: 5000,
                type: 'credit'
            })
            

        const cookies = createTransactionResponse.get('Set-Cookie')

        await request(app.server)
        .post('/transactions')
        .send({
            title: 'Debit Transaction',
            amount: 2000,
            type: 'debit'
        })


        const summaryResponse = await request(app.server)
            .get(`/transactions/summary`)
            .set('Cookie', cookies)
            .expect(200)

        expect(summaryResponse.body.summary.amount).toEqual(5000)
    })

})