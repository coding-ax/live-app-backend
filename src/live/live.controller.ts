import md5 from 'md5';
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { BASE_RESPONSE, CLIENT_PARAMS_ERROR, STATUS_CODE } from 'src/common';
import { GetHeader } from 'src/user-decoration/user.decoration';
import {
  BaseLiveRequest,
  ChangeStatusRequest,
  CreateBarrageRequest,
  CreateLiveRequest,
  GetBarrageListRequest,
  GetSecretLiveListRequest,
  LIVE_STATUS,
} from './dto/live.dto';
import { LiveService } from './live.service';
import { LoginService } from 'src/login/login.service';

@Controller('live')
export class LiveController {
  constructor(
    private readonly liveService: LiveService,
    private readonly loginService: LoginService,
  ) {}
  @Get()
  async getLiveList(): Promise<BASE_RESPONSE> {
    const liveList = await this.liveService.getLiveList();
    const userInfoPromiseList = liveList.map((v) =>
      this.loginService.getUserDetail(v.openId),
    );
    const userDetailList = await Promise.all(userInfoPromiseList);
    const result = liveList.map((v) => ({
      ...v,
      userDetail: userDetailList.find((u) => u.openId === v.openId),
    }));
    return {
      message: '',
      code: STATUS_CODE.SUCCESS,
      data: result,
    };
  }

  @Post()
  async getSecretLiveList(
    @GetHeader('open_id') openId,
    @Body() { status }: GetSecretLiveListRequest,
  ): Promise<BASE_RESPONSE> {
    const liveList = await this.liveService.getSecretLiveList(status, openId);
    const userInfoPromiseList = liveList.map((v) =>
      this.loginService.getUserDetail(v.openId),
    );
    const userDetailList = await Promise.all(userInfoPromiseList);
    const result = liveList.map((v) => ({
      ...v,
      userDetail: userDetailList.find((u) => u.openId === v.openId),
    }));
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
      status: LIVE_STATUS.PLAN,
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
      if (!liveId || typeof status === 'undefined') {
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
    @Query() { liveId }: BaseLiveRequest,
    @GetHeader('open_id') openId: string,
  ): Promise<BASE_RESPONSE> {
    try {
      const liveDetail = await this.liveService.getLiveDetail(liveId);
      if (!liveDetail) {
        return {
          message: '该直播不存在',
          code: STATUS_CODE.ERROR,
        };
      }
      let result = {
        ...liveDetail,
        pushUrl: null,
      };
      if (liveDetail.detail.openId === openId) {
        const pushUrl = await this.liveService.getLivePushUrl(liveId);
        result = {
          ...result,
          pushUrl,
        };
      } else {
        // 如果不是主播，则清除 openId 信息
        delete result.detail.openId;
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

  @Delete('del')
  async delLiveDetail(
    @Query() { liveId }: BaseLiveRequest,
  ): Promise<BASE_RESPONSE> {
    try {
      const result = await this.liveService.delLive(liveId);
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
        message: '删除失败',
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

  @Post('create_barrage')
  async createBarrage(
    @Body() currentBarrage: CreateBarrageRequest,
    @GetHeader('open_id') openId: string,
  ) {
    try {
      if (!currentBarrage.liveId || !currentBarrage.barrage) {
        return CLIENT_PARAMS_ERROR;
      }
      const result = await this.liveService.createBarrage(
        openId,
        currentBarrage,
      );
      return {
        message: '',
        code: STATUS_CODE.SUCCESS,
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        message: '发送弹幕失败',
        code: STATUS_CODE.ERROR,
      };
    }
  }

  @Post('barrage')
  async getBarrageList(@Body() query: GetBarrageListRequest) {
    try {
      if (!query.liveId || !query.startTime) {
        return CLIENT_PARAMS_ERROR;
      }
      const { liveId, startTime } = query;
      const barrageList = await this.liveService.getBarrageListByTime(
        liveId,
        startTime,
      );
      const userQueryPromiseList = barrageList.map(
        async (v) => await this.loginService.getUserDetail(v.openId),
      );
      const userQueryList = await Promise.all(userQueryPromiseList);
      const result = barrageList.map((v, i) => ({
        ...v,
        user: userQueryList[i],
      }));

      return {
        message: '',
        code: STATUS_CODE.SUCCESS,
        data: result,
      };
    } catch (error) {
      console.error(error);
      return {
        message: '获取弹幕失败',
        code: STATUS_CODE.ERROR,
      };
    }
  }
}
