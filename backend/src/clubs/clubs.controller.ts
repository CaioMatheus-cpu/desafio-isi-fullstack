import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { API_PREFIX } from '../common/api-prefix';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ClubDetailResponse, ClubResponse } from './club.mapper';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { ListClubsQueryPipe } from './query/list-clubs-query.pipe';
import type { ListClubsQuery } from './query/list-clubs.query';

@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @Post()
  async create(
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.clubsService.create(dto);
    response.setHeader('Location', `/${API_PREFIX}/clubs/${club.id}`);
    return club;
  }

  @Get()
  list(
    @Query(ListClubsQueryPipe) query: ListClubsQuery,
  ): Promise<ClubResponse[]> {
    return this.clubsService.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailResponse> {
    return this.clubsService.findOne(id);
  }
}
