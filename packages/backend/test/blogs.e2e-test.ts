import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Blog } from '../src/api/blog/blog.entity';
import { AuthService } from '../src/api/auth/auth.service';
import { UserRepository } from '../src/api/users/user.repository';
import { BlogService } from '../src/api/blog/blog.service';
import { ormConfig } from './config';
import { BlogModule } from '../src/api/blog/blog.module';
import { AuthModule } from '../src/api/auth/auth.module';
import { BlogRepository } from '../src/api/blog/blog.repository';
import { UserService } from '../src/api/users/user.service';
import { User } from '../src/api/users/user.entity';

describe('Blogs (e2e)', () => {
  let app: INestApplication;
  let blogService: BlogService;
  let module: TestingModule;
  let userService: UserService;
  let userRepo: UserRepository;
  let token: string;
  let user: User;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(ormConfig), AuthModule, BlogModule],
    }).compile();

    const payload = {
      firstName: 'Khaled',
      lastName: 'Mohamed',
      email: 'khaled123@skillfuze.com',
      password: '123456789',
      confirmPassword: '123456789',
    };
    userService = module.get<UserService>(UserService);
    userRepo = module.get<UserRepository>(UserRepository);

    user = await userService.register(payload);
    const authService = module.get<AuthService>(AuthService);
    token = `Bearer ${authService.generateToken(user)}`;

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix('api/v1');
    await app.init();
    blogService = module.get<BlogService>(BlogService);
  });

  describe('POST /api/v1/blogs', () => {
    const url = '/api/v1/blogs';
    const payload = {
      title: 'Test Title',
      content: 'Blog Content',
      tags: ['tag1', 'tag2'],
    };

    it('should create a blog successfully', async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send(payload)
        .set('Authorization', token)
        .expect(201);

      const blog = await blogService.findOne({ id: res.body.id });
      expect(blog).not.toBe(undefined);
      expect(blog.id).toBe(res.body.id);
    });

    it('should return 401 on unauthorized request', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send(payload)
        .expect(401);
    });

    it('should return 400 on empty title', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ ...payload, title: undefined })
        .set('Authorization', token)
        .expect(400);
    });
  });

  describe('GET /api/v1/blogs', () => {
    const url = '/api/v1/blogs';

    it('should get all blogs successfully', async () => {
      await request(app.getHttpServer())
        .post(url)
        .send({ title: 'Test Blog', content: 'test content.' })
        .set('Authorization', token);

      const res = await request(app.getHttpServer())
        .get(url)
        .query({ limit: 0 })
        .expect(200);

      expect(res.body.data.length).toBe(1);
    });
  });

  describe('PATCH /api/v1/blogs/:id', () => {
    const url = '/api/v1/blogs';
    let blog: Blog;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post(url)
        .send({ title: 'Test Blog', content: 'test content.' })
        .set('Authorization', token);

      blog = res.body;
    });

    it('should update the blog successfully', async () => {
      const newContent = 'test content changed.';

      await request(app.getHttpServer())
        .patch(`${url}/${blog.id}`)
        .send({ content: newContent })
        .set('Authorization', token)
        .expect(200);

      const newBlog = await blogService.findOne({ id: blog.id });
      expect(newBlog.content).toMatch(newContent);
    });

    it('should return 401 on unauthorized access', async () => {
      const newContent = 'test content changed.';

      await request(app.getHttpServer())
        .patch(`${url}/${blog.id}`)
        .send({ content: newContent })
        .expect(401);
    });

    it('should return 404 on invalid blog id', async () => {
      const newContent = 'test content changed.';
      const invalidId = 4;

      await request(app.getHttpServer())
        .patch(`${url}/${invalidId}`)
        .send({ content: newContent })
        .set('Authorization', token)
        .expect(404);
    });

    it('should return 403 on trying to edit another user blog', () => {});
  });

  afterEach(async () => {
    const blogRepo = module.get<BlogRepository>(BlogRepository);
    await blogRepo.delete({});
  });

  afterAll(async () => {
    await userRepo.delete({});
    await app.close();
  });
});
