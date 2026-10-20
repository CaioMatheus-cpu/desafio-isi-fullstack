import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { API_PREFIX } from '../common/api-prefix';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchResponse, MatchSummaryResponse } from './match.mapper';
import { MatchesService } from './matches.service';
import { ListMatchesQueryPipe } from './query/list-matches-query.pipe';
import type { ListMatchesQuery } from './query/list-matches.query';
import { StandingResponse, StandingsService } from './standings.service';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Post()
  async create(
    @Body() dto: CreateMatchDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchResponse> {
    const match = await this.matchesService.create(dto);
    response.setHeader('Location', `/${API_PREFIX}/matches/${match.id}`);
    return match;
  }

  @Get()
  list(
    @Query(ListMatchesQueryPipe) query: ListMatchesQuery,
  ): Promise<MatchSummaryResponse[]> {
    return this.matchesService.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<MatchResponse> {
    return this.matchesService.findOne(id);
  }
}

@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @Get()
  list(): Promise<StandingResponse[]> {
    return this.standingsService.list();
  }
}
