import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getLivePullUrl } from 'src/common';
import { Repository } from 'typeorm';
import { LiveDetail } from './database/live-detail.entity';
import { LIVE_STATUS } from './dto/live.dto';

@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveDetail)
    private readonly liveDetailRepository: Repository<LiveDetail>,
  ) {}

  async getLiveDetail(liveId: string) {
    try {
      const result = await this.liveDetailRepository.findOne({
        liveId,
      });
      // 检测该直播是否存在
      if (result) {
        const liveUrl = getLivePullUrl(liveId);
        return {
          detail: result,
          liveUrl,
        };
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  /**
   * 获取所有正在进行的直播
   * @returns {LiveDetail[]}
   */
  async getLiveList(): Promise<LiveDetail[]> {
    try {
      const result = await this.liveDetailRepository.find({
        status: LIVE_STATUS.LIVE,
      });
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  /**
   * 获取本人未进行或者已结束的直播
   * @param {string} status
   * @param {string} openId
   * @returns {LiveDetail[]}
   */
  async getSecretLiveList(
    status: LIVE_STATUS.PLAN | LIVE_STATUS.END,
    openId: string,
  ): Promise<LiveDetail[]> {
    try {
      const result = await this.liveDetailRepository.find({
        openId,
        status,
      });
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async updateLive(currentCreateLive) {
    try {
      const currentDto = new LiveDetail();
      Object.assign(currentDto, currentCreateLive);
      const result = await this.liveDetailRepository.save(currentDto);
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async changeLiveStatus(
    liveId: string,
    status: LIVE_STATUS,
  ): Promise<boolean> {
    try {
      await this.liveDetailRepository.update(
        {
          liveId,
        },
        {
          status,
        },
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getUserLiveHistory(openId: string) {
    try {
      const result = await this.liveDetailRepository.find({
        where: {
          openId,
        },
      });
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
