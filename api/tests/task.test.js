// tests/task.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;
let connectDB;
let authToken;
let projectId;
let taskId;

beforeAll(async () => {
    // Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();

    // Set required env vars
    process.env.MONGODB_URI = mongoServer.getUri();
    process.env.JWT_SECRET = 'testsecret';
    process.env.ACCESS_EXP = '15m';
    process.env.REFRESH_SECRET = 'refreshsecret';
    process.env.REFRESH_EXP = '7d';

    // Require & connect
    connectDB = require('../src/config/db');
    app = require('../src/app');
    await connectDB();

    // Register + login user
    await request(app)
        .post('/api/auth/register')
        .send({ name: 'TaskUser', email: 'task@example.com', password: 'Password123!' });
    const authRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'task@example.com', password: 'Password123!' });
    authToken = authRes.body.accessToken;

    // Create a project to attach tasks to
    const projRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Tasks Project' });
    projectId = projRes.body._id;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Task Endpoints', () => {
    it('rejects unauthenticated access', async () => {
        const res = await request(app).get('/api/tasks');
        expect(res.statusCode).toBe(401);
    });

    it('creates a new task', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                title: 'My First Task',
                projectId,
                dueDate: '2025-06-01T00:00:00.000Z',
                priority: 'high',       // lowercase priority
                labels: ['backend', 'urgent']
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('title', 'My First Task');
        expect(res.body).toHaveProperty('projectId', projectId);
        taskId = res.body._id;
    });

    it('returns 400 when missing required fields', async () => {
        const res = await request(app)
            .post('/api/tasks')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ projectId }); // missing title

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('lists all tasks for the user', async () => {
        const res = await request(app)
            .get('/api/tasks')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('fetches a single task by ID', async () => {
        const res = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', taskId);
        expect(res.body).toHaveProperty('title', 'My First Task');
    });

    it('updates a task', async () => {
        const res = await request(app)
            .patch(`/api/tasks/${taskId}`)         // use PATCH for updates
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Updated Task Title', priority: 'low' });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('title', 'Updated Task Title');
        expect(res.body).toHaveProperty('priority', 'low');
    });

    it('returns 404 when updating non-existent task', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .patch(`/api/tasks/${fakeId}`)         // use PATCH here too
            .set('Authorization', `Bearer ${authToken}`)
            .send({ title: 'Does Not Exist' });

        expect(res.statusCode).toBe(404);
    });

    it('deletes a task', async () => {
        const res = await request(app)
            .delete(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("message", "Task removed");
    });

    it('returns 404 when fetching a deleted task', async () => {
        const res = await request(app)
            .get(`/api/tasks/${taskId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
    });
});
