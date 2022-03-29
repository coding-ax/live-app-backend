import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveDetail } from './database/live-detail.entity';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

const typeOrmFeatureEntities = [LiveDetail];
@Module({
  imports: [TypeOrmModule.forFeature(typeOrmFeatureEntities)],
  controllers: [LiveController],
  providers: [LiveService],
})
export class LiveModule {}
