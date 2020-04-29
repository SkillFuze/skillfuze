import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { LivestreamsService } from './livestreams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateLivestreamDTO } from './dtos/create-livestream.dto';
import { Livestream } from './livestream.entity';

@Controller('livestreams')
export class LivestreamsController {
  public constructor(private readonly service: LivestreamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  public async createOne(@Request() req, @Body() payload: CreateLivestreamDTO): Promise<Livestream> {
    return this.service.create(req.user.id, payload);
  }
}