// tests/project.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let connectDB;
let authToken;
let projectId;

beforeAll(async () => {
    // 1) Spin up in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'testsecret';
    process.env.ACCESS_EXP = '15m';
    process.env.REFRESH_SECRET = 'refreshsecret';
    process.env.REFRESH_EXP = '7d';

    // 2) Require & connect your app
    connectDB = require('../src/config/db');
    app = require('../src/app');
    await connectDB();

    // 3) Register & login a user for auth
    await request(app)
        .post('/api/auth/register')
        .send({ name: 'ProjUser', email: 'proj@example.com', password: 'Password123!' });

    const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'proj@example.com', password: 'Password123!' });

    authToken = res.body.accessToken;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Project Endpoints', () => {
    it('should reject unauthenticated requests', async () => {
        const res = await request(app)
            .get('/api/projects');
        expect(res.statusCode).toBe(401);
    });

    it('should create a new project', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'My First Project' });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('name', 'My First Project');
        projectId = res.body._id;
    });

    it('should not create without required fields', async () => {
        const res = await request(app)
            .post('/api/projects')
            .set('Authorization', `Bearer ${authToken}`)
            .send({});  // missing name

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('should fetch all projects for the user', async () => {
        const res = await request(app)
            .get('/api/projects')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should fetch a single project by ID', async () => {
        const res = await request(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', projectId);
    });

    it('should update a project', async () => {
        const res = await request(app)
            .patch(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Updated Project Name' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Updated Project Name');
    });

    it('should return 404 for updating non-existent project', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .patch(`/api/projects/${fakeId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Nope' });

        expect(res.statusCode).toBe(404);
    });

    it('should delete a project', async () => {
        const res = await request(app)
            .delete(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Project removed');

    });

    it('should return 404 for fetching a deleted project', async () => {
        const res = await request(app)
            .get(`/api/projects/${projectId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
    });
});
