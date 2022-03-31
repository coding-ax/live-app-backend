import md5 from 'md5';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { BASE_RESPONSE, CLIENT_PARAMS_ERROR, STATUS_CODE } from 'src/common';
import { GetHeader } from 'src/user-decoration/user.decoration';
import {
  BaseLiveRequest,
  ChangeStatusRequest,
  CreateLiveRequest,
} from './dto/live.dto';
import { LiveService } from './live.service';

@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}
  @Get()
  async getLiveList(): Promise<BASE_RESPONSE> {
    const result = await this.liveService.getLiveList();
    return {
      message: '',
      code: STATUS_CODE.SUCCESS,
      data: result,
    };
  }

  @Post('edit')
  async createLive(
    @Body() { title, cover, startTime, endTime, liveId }: CreateLiveRequest,
    @GetHeader('open_id') openId: string,
  ): Promise<BASE_RESPONSE> {
    if (!title || !cover || !startTime || !endTime) {
      return CLIENT_PARAMS_ERROR;
    }
    // liveId 由 openId + 当前时间生成
    const currentLiveId = liveId ? liveId : md5(`${openId}${Date.now()}`);
    const currentCreateLiveDto = {
      liveId: currentLiveId,
      title,
      cover,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      openId,
      // 可创建可直播就是未直播状态
      status: 0,
    };
    // 如果有 liveId 则为编辑
    const result = await this.liveService.updateLive(currentCreateLiveDto);
    return result
      ? {
          message: '',
          code: STATUS_CODE.SUCCESS,
          data: result,
        }
      : {
          message: '创建直播失败，请重试',
          code: STATUS_CODE.ERROR,
        };
  }

  @Post('status')
  async changeLiveStatus(@Body() { liveId, status }: ChangeStatusRequest) {
    try {
      if (!liveId || !status) {
        return CLIENT_PARAMS_ERROR;
      }
      const result = await this.liveService.changeLiveStatus(liveId, status);
      return {
        message: '',
        code: STATUS_CODE.SUCCESS,
        data: result,
      };
    } catch (error) {
      return {
        message: '状态切换失败',
        code: STATUS_CODE.ERROR,
      };
    }
  }

  @Get('live-detail')
  async getLiveDetail(
    @Body() { liveId }: BaseLiveRequest,
  ): Promise<BASE_RESPONSE> {
    try {
      const result = await this.liveService.getLiveDetail(liveId);
      if (!result) {
        return {
          message: '该直播不存在',
          code: STATUS_CODE.ERROR,
        };
      }
      return {
        message: '',
        code: STATUS_CODE.SUCCESS,
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        message: '获取直播详情失败',
        code: STATUS_CODE.ERROR,
      };
    }
  }

  @Get('history')
  async getUserLiveHistory(
    @GetHeader('open_id') openId: string,
  ): Promise<BASE_RESPONSE> {
    const result = await this.liveService.getUserLiveHistory(openId);
    return {
      message: '',
      code: STATUS_CODE.SUCCESS,
      data: result,
    };
  }
}
