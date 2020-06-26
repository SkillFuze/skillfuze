import { Injectable, NotFoundException } from '@nestjs/common';

import { VideosRepository } from './videos.repository';
import { CreateVideoDTO } from './dtos/create-video.dto';
import { Video } from './video.entity';
import { User } from '../users/user.entity';

@Injectable()
export class VideosService {
  public constructor(private readonly repository: VideosRepository) {}

  public async create(userId: number, payload: CreateVideoDTO): Promise<Video> {
    const uploader = new User();
    uploader.id = userId;
    const video = this.repository.create({ ...payload, uploader });
    return this.repository.save(video);
  }

  public async getOne(id: string): Promise<Video> {
    const video = await this.repository.findOne(id, { relations: ['uploader'] });
    if (!video) {
      throw new NotFoundException();
    }

    return video;
  }

  public async getUserVideos(username: string): Promise<Video[]> {
    return this.repository.find({ uploader: { username } });
  }
}
