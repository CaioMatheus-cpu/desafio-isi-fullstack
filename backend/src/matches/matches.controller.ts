import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../common/api-prefix';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateMatchDto } from './dto/create-match.dto';
import { MatchResponse, MatchSummaryResponse } from './match.mapper';
import { MatchesService } from './matches.service';
import { ListMatchesQueryPipe } from './query/list-matches-query.pipe';
import type { ListMatchesQuery } from './query/list-matches.query';
import { StandingResponse, StandingsService } from './standings.service';

@ApiTags('Partidas')
@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @ApiOperation({
    summary: 'Joga uma partida entre dois clubes com os 5 titulares escalados',
  })
  @Post()
  async create(
    @Body() dto: CreateMatchDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<MatchResponse> {
    const match = await this.matchesService.create(dto);
    response.setHeader('Location', `/${API_PREFIX}/matches/${match.id}`);
    return match;
  }

  @ApiOperation({
    summary: 'Lista as partidas, da mais recente para a mais antiga',
  })
  @ApiQuery({ name: 'club_id', required: false, type: Number })
  @Get()
  list(
    @Query(ListMatchesQueryPipe) query: ListMatchesQuery,
  ): Promise<MatchSummaryResponse[]> {
    return this.matchesService.list(query);
  }

  @ApiOperation({ summary: 'Consulta uma partida com os 6 duelos' })
  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<MatchResponse> {
    return this.matchesService.findOne(id);
  }
}

@ApiTags('Classificação')
@Controller('standings')
export class StandingsController {
  constructor(private readonly standingsService: StandingsService) {}

  @ApiOperation({
    summary: 'Classificação de todos os clubes, calculada a cada consulta',
  })
  @Get()
  list(): Promise<StandingResponse[]> {
    return this.standingsService.list();
  }
}
