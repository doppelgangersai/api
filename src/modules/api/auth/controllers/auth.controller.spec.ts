import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../main/app.module';

describe('AuthController (e2e) - mock-login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // Initialize the testing module with the real application module
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    // Close the application after tests
    await app.close();
  });

  it('/api/auth/mock-login (GET) должен возвращать токен и пользователя', async () => {
    // Send a GET request to the mock-login endpoint and check the response
    const response = await request(app.getHttpServer())
      .get('/api/auth/mock-login?id=1')
      .expect(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.user).toBeDefined();
  });
});
