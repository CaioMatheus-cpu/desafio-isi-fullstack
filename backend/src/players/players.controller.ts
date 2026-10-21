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
  Query,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { API_PREFIX } from '../common/api-prefix';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdateConditionDto } from './dto/update-condition.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { PlayerResponse, PlayersPage } from './player.mapper';
import { PlayersService } from './players.service';
import type { ListPlayersQuery } from './query/list-players.query';
import { ListPlayersQueryPipe } from './query/list-players-query.pipe';

@ApiTags('Jogadores')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @ApiOperation({
    summary:
      'Cadastra um jogador (nasce livre e Apto; valor base e overall são calculados)',
  })
  @Post()
  async create(
    @Body() dto: CreatePlayerDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<PlayerResponse> {
    const player = await this.playersService.create(dto);
    response.setHeader('Location', `/${API_PREFIX}/players/${player.id}`);
    return player;
  }

  @ApiOperation({
    summary:
      'Lista jogadores com busca, filtros combináveis, ordenação e paginação',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Trecho do nome, sem diferenciar maiúsculas nem acentos',
  })
  @ApiQuery({
    name: 'position',
    required: false,
    enum: ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'],
  })
  @ApiQuery({
    name: 'condition',
    required: false,
    enum: ['APTO', 'MAL_CONDICIONADO', 'DOENTE'],
  })
  @ApiQuery({
    name: 'free',
    required: false,
    type: Boolean,
    description: 'true: só livres; false: só com clube',
  })
  @ApiQuery({ name: 'club_id', required: false, type: Number })
  @ApiQuery({ name: 'min_age', required: false, type: Number })
  @ApiQuery({ name: 'max_age', required: false, type: Number })
  @ApiQuery({
    name: 'min_value',
    required: false,
    description: 'Valor de mercado mínimo, com ponto decimal',
  })
  @ApiQuery({
    name: 'max_value',
    required: false,
    description: 'Valor de mercado máximo, com ponto decimal',
  })
  @ApiQuery({
    name: 'sort',
    required: false,
    description: 'name, value_asc, value_desc, age_asc, age_desc ou position',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  list(
    @Query(ListPlayersQueryPipe) query: ListPlayersQuery,
  ): Promise<PlayersPage> {
    return this.playersService.list(query);
  }

  @ApiOperation({ summary: 'Consulta um jogador' })
  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<PlayerResponse> {
    return this.playersService.findOne(id);
  }

  @ApiOperation({ summary: 'Edita nome, posição, agilidade e idade' })
  @Put(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdatePlayerDto,
  ): Promise<PlayerResponse> {
    return this.playersService.update(id, dto);
  }

  @ApiOperation({
    summary: 'Troca a condição física e recalcula o valor de mercado',
  })
  @Patch(':id/condition')
  updateCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateConditionDto,
  ): Promise<PlayerResponse> {
    return this.playersService.updateCondition(id, dto);
  }

  @ApiOperation({ summary: 'Exclui um jogador livre (exclusão lógica)' })
  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.playersService.remove(id);
  }
}
