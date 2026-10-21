import { Body, Controller, HttpCode, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { BuyPlayerDto } from './dto/buy-player.dto';
import { MarketService, PurchaseResponse } from './market.service';
import { SaleResponse, SalesService } from './sales.service';

@ApiTags('Compra e venda')
@Controller('players')
export class MarketController {
  constructor(
    private readonly marketService: MarketService,
    private readonly salesService: SalesService,
  ) {}

  // Responde 200 (e não 201): a compra cria contrato e transação, mas o
  // recurso devolvido é o resultado da operação, como o enunciado define.
  @ApiOperation({
    summary:
      'Compra um jogador livre para um clube, com contrato de fidelidade',
  })
  @Post(':id/buy')
  @HttpCode(200)
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: BuyPlayerDto,
  ): Promise<PurchaseResponse> {
    return this.marketService.buy(id, dto);
  }

  // A venda não tem corpo: o clube vendedor é sempre o atual do jogador.
  @ApiOperation({
    summary: 'Vende o jogador pelo valor de mercado, com multa e comissão',
  })
  @Post(':id/sell')
  @HttpCode(200)
  sell(@Param('id', ParseIdPipe) id: number): Promise<SaleResponse> {
    return this.salesService.sell(id);
  }
}
