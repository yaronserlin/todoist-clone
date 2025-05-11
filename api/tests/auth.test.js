// tests/auth.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let connectDB;

beforeAll(async () => {
    // 1) start in-memory Mongo
    mongoServer = await MongoMemoryServer.create();

    // 2) set env vars before requiring anything that uses them
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'testsecret';
    process.env.ACCESS_EXP = '15m';
    process.env.REFRESH_SECRET = 'refreshsecret';
    process.env.REFRESH_EXP = '7d';

    // 3) now require and connect
    connectDB = require('../src/config/db');
    app = require('../src/app');
    await connectDB();
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Auth Endpoints', () => {
    describe('Registration', () => {
        it('should register a new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test',
                    email: 'test@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body).toHaveProperty('user._id');
            expect(res.body).toHaveProperty('user.email', 'test@example.com');
        });

        it('should not register with missing fields', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'no-name@example.com' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should not allow duplicate email registration', async () => {
            // first registration
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Dup',
                    email: 'dup@example.com',
                    password: 'Password123!'
                });

            // attempt again with same email
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Dup2',
                    email: 'dup@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(409);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('Login', () => {
        beforeAll(async () => {
            // ensure one user exists
            await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Bob',
                    email: 'bob@example.com',
                    password: 'Password123!'
                });
        });

        it('should log in an existing user and return tokens', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'bob@example.com',
                    password: 'Password123!'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
            expect(res.body).toHaveProperty('user._id');
        });

        it('should not log in with missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'bob@example.com' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('message');
        });

        it('should not log in with wrong credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'bob@example.com',
                    password: 'WrongPassword!'
                });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });
    });

    describe('Refresh Token', () => {
        let validRefresh;

        beforeAll(async () => {
            // login to get a refresh token
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'bob@example.com',
                    password: 'Password123!'
                });
            validRefresh = res.body.refreshToken;
        });

        it('should issue new tokens with a valid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: validRefresh });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('accessToken');
            expect(res.body).toHaveProperty('refreshToken');
        });

        it('should reject an invalid refresh token', async () => {
            const res = await request(app)
                .post('/api/auth/refresh')
                .send({ refreshToken: 'not-a-real-token' });

            expect(res.statusCode).toBe(401);
            expect(res.body).toHaveProperty('message');
        });
    });
});
