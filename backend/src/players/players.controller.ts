import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { API_PREFIX } from '../common/api-prefix';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerResponse } from './player.mapper';
import { PlayersService } from './players.service';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async create(
    @Body() dto: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.playersService.create(dto);
    response.setHeader('Location', `/${API_PREFIX}/players/${player.id}`);
    return player;
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.playersService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ): Promise<PlayerResponse> {
    return this.playersService.update(id, dto);
  }

  @Patch(':id/condition')
  updateCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateConditionDto,
  ): Promise<PlayerResponse> {
    return this.playersService.updateCondition(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
