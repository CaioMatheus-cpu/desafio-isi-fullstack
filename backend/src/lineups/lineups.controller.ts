import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { SetLineupDto } from './dto/set-lineup.dto';
import { LineupResponse, LineupsService } from './lineups.service';

@ApiTags('Escalação')
@Controller('clubs')
export class LineupsController {
  constructor(private readonly lineupsService: LineupsService) {}

  @ApiOperation({
    summary: 'Substitui a escalação do clube (formação e 5 titulares)',
  })
  @Put(':id/lineup')
  set(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: SetLineupDto,
  ): Promise<LineupResponse> {
    return this.lineupsService.set(id, dto);
  }

  @ApiOperation({ summary: 'Consulta a escalação do clube' })
  @Get(':id/lineup')
  get(@Param('id', ParseIdPipe) id: number): Promise<LineupResponse> {
    return this.lineupsService.get(id);
  }
}
