import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../common/api-prefix';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ClubDetailResponse, ClubResponse } from './club.mapper';
import { ClubsService } from './clubs.service';
import { CreateClubDto } from './dto/create-club.dto';
import { ListClubsQueryPipe } from './query/list-clubs-query.pipe';
import type { ListClubsQuery } from './query/list-clubs.query';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubsService: ClubsService) {}

  @ApiOperation({
    summary: 'Cria um clube com 300,00 de caixa e sem jogadores',
  })
  @Post()
  async create(
    @Body() dto: CreateClubDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<ClubResponse> {
    const club = await this.clubsService.create(dto);
    response.setHeader('Location', `/${API_PREFIX}/clubs/${club.id}`);
    return club;
  }

  @ApiOperation({
    summary: 'Lista os clubes com caixa, valor do elenco e patrimônio',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'name, net_worth_desc ou net_worth_asc',
  })
  @Get()
  list(
    @Query(ListClubsQueryPipe) query: ListClubsQuery,
  ): Promise<ClubResponse[]> {
    return this.clubsService.list(query);
  }

  @ApiOperation({
    summary: 'Consulta um clube com o elenco e o contrato de cada jogador',
  })
  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<ClubDetailResponse> {
    return this.clubsService.findOne(id);
  }
}
