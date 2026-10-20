import { Module } from '@nestjs/common';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';
import { SalesService } from './sales.service';

@Module({
  controllers: [MarketController],
  providers: [MarketService, SalesService],
})
export class MarketModule {}
