import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginModule } from 'src/login/login.module';
import { LiveDetail } from './database/live-detail.entity';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';

const typeOrmFeatureEntities = [LiveDetail];
@Module({
  imports: [TypeOrmModule.forFeature(typeOrmFeatureEntities), LoginModule],
  controllers: [LiveController],
  providers: [LiveService],
  exports: [LiveService],
})
export class LiveModule {}
