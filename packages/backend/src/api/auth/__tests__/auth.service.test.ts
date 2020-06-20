import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/user.entity';
import { LivestreamsService } from '../../livestreams/livestreams.service';
import { LivestreamsRepository } from '../../livestreams/livestreams.repository';
import { HashingService } from '../services/hashing.service';

import { UserRepository } from '../../users/user.repository';
import { UserService } from '../../users/user.service';
import { AuthService } from '../services/auth.service';

jest.mock('@nestjs/jwt');

describe('Auth Service', () => {
  let authService: AuthService;
  let hashingService: HashingService;
  let userService: UserService;
  let jwtService: JwtService;
  let findByEmailSpy: jest.SpyInstance;
  let signSpy: jest.SpyInstance;
  let matchingPasswordSpy: jest.SpyInstance;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService, HashingService],
    }).compile();
    jwtService = module.get<JwtService>(JwtService);
    hashingService = module.get<HashingService>(HashingService);
    userService = new UserService(
      new UserRepository(),
      hashingService,
      new LivestreamsService(new LivestreamsRepository()),
    );
    authService = new AuthService(userService, hashingService, jwtService);
  });

  beforeEach(async () => {
    signSpy = jest.spyOn(jwtService, 'sign');
    findByEmailSpy = jest.spyOn(userService, 'findByEmail');
    matchingPasswordSpy = jest.spyOn(hashingService, 'matchingPassword');

    findByEmailSpy.mockImplementation((email: string) => {
      if (email === 'duplicate@gmail.com') {
        const user = new User();
        user.id = 1;
        user.firstName = 'Karim';
        user.lastName = 'Elsayed';
        user.email = 'karim@skillfuze.com';
        user.password = '123456789';
        return user;
      }
      return undefined;
    });

    matchingPasswordSpy.mockImplementation((payload: any) => {
      return payload;
    });

    signSpy.mockImplementation((payload: any) => {
      return payload;
    });
  });

  describe('generateToken', () => {
    const user = {
      id: 1,
      firstName: 'Karim',
      lastName: 'Elsayed',
      email: 'karim@skillfuze.com',
      password: '123456789',
      username: 'user-1',
      avatarURL: '',
      bio: '',
    };

    it('should generate token successfully', async () => {
      const res = authService.generateToken(user as User);
      expect(res).toMatchObject({
        id: 1,
        firstName: 'Karim',
        lastName: 'Elsayed',
        email: 'karim@skillfuze.com',
        username: 'user-1',
        avatarURL: '',
        bio: '',
      });
    });
    it('should call jwt.sign', async () => {
      await authService.generateToken(user as User);
      expect(signSpy).toBeCalled();
      expect(signSpy).toBeCalledWith({
        id: 1,
        firstName: 'Karim',
        lastName: 'Elsayed',
        email: 'karim@skillfuze.com',
        username: 'user-1',
        avatarURL: '',
        bio: '',
      });
    });
  });

  describe('validateUser', () => {
    const payload = {
      email: 'karim@skillfuze.com',
      password: '123456789',
    };

    it('should call hashingService.matchingPassword', async () => {
      await authService.validateUser('duplicate@gmail.com', payload.password);
      expect(matchingPasswordSpy).toBeCalled();
    });

    it('should return user on valid email', async () => {
      const res = await authService.validateUser('duplicate@gmail.com', payload.password);
      expect(res).toBeInstanceOf(User);
    });
    it('should return null on invalid email', async () => {
      const res = await authService.validateUser(payload.email, payload.password);
      expect(res).toBeNull();
    });
    it('should call userService.findByEmail', async () => {
      await authService.validateUser(payload.email, payload.password);
      expect(findByEmailSpy).toBeCalled();
    });
  });
});
