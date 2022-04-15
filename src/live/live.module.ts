import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from 'src/login/login.module';
import { BarrageDetail } from './database/barrage-detail.entity';
import { Barrage } from './database/barrage.entity';
import { LiveDetail } from './database/live-detail.entity';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

const typeOrmFeatureEntities = [LiveDetail, Barrage, BarrageDetail];
@Module({
  imports: [TypeOrmModule.forFeature(typeOrmFeatureEntities), LoginModule],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
