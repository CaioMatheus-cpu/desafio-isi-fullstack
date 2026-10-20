import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { SetLineupDto } from './dto/set-lineup.dto';
import { LineupResponse, LineupsService } from './lineups.service';

@Controller('clubs')
export class LineupsController {
  constructor(private readonly lineupsService: LineupsService) {}

  @Put(':id/lineup')
  set(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: SetLineupDto,
  ): Promise<LineupResponse> {
    return this.lineupsService.set(id, dto);
  }

  @Get(':id/lineup')
  get(@Param('id', ParseIdPipe) id: number): Promise<LineupResponse> {
    return this.lineupsService.get(id);
  }
}
