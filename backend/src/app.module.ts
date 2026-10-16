import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClubsModule } from './clubs/clubs.module';
import { ClockModule } from './common/clock';
import { entities } from './database/entities';
import { MarketModule } from './market/market.module';
import { PlayersModule } from './players/players.module';

@Module({
  imports: [
    // Lê o .env uma vez e deixa as variáveis disponíveis em qualquer módulo.
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities,
        // O banco só muda por migration, nunca pela aplicação subindo.
        synchronize: false,
      }),
    }),
    ClockModule,
    PlayersModule,
    ClubsModule,
    MarketModule,
  ],
})
export class AppModule {}
