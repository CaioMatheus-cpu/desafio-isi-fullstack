import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { BuyPlayerDto } from './dto/buy-player.dto';
import { MarketService, PurchaseResponse } from './market.service';

@Controller('players')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  // Responde 200 (e não 201): a compra cria contrato e transação, mas o
  // recurso devolvido é o resultado da operação, como o enunciado define.
  @Post(':id/buy')
  @HttpCode(200)
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<PurchaseResponse> {
    return this.marketService.buy(id, dto);
  }
}
