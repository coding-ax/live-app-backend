import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginModule } from './login/login.module';
import { TypeOrmModule } from '@nestjs/typeorm';

const TypeOrmInstanceModule = TypeOrmModule.forRoot();
@Module({
  imports: [LoginModule, TypeOrmInstanceModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
