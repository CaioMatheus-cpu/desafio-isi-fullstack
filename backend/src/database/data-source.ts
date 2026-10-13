import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [`${__dirname}/entities/*.entity.{ts,js}`],
  migrations: [`${__dirname}/migrations/*.{ts,js}`],
  synchronize: false,
});
