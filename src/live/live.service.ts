import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getLivePullUrl, getLivePushUrl } from 'src/common';
import { Repository } from 'typeorm';
import { BarrageDetail } from './database/barrage-detail.entity';
import { Barrage } from './database/barrage.entity';
import { LiveDetail } from './database/live-detail.entity';
import { CreateBarrageRequest, LIVE_STATUS } from './dto/live.dto';
import md5 from 'md5';

interface CurrentBarrage extends Barrage {
  barrageContent: BarrageDetail;
}
@Injectable()
export class LiveService {
  constructor(
    @InjectRepository(LiveDetail)
    private readonly liveDetailRepository: Repository<LiveDetail>,
    @InjectRepository(Barrage)
    private readonly barrageRepository: Repository<Barrage>,
    @InjectRepository(BarrageDetail)
    private readonly barrageDetailRepository: Repository<BarrageDetail>,
  ) {}

  async getLiveDetail(liveId: string) {
    try {
      const result = await this.liveDetailRepository.findOne(
        {
          liveId,
        },
        {
          select: [
            'cover',
            'startTime',
            'endTime',
            'updateTime',
            'title',
            'liveId',
            'openId',
          ],
        },
      );
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

  async delLive(liveId: string) {
    try {
      const result = await this.liveDetailRepository.delete({
        liveId,
      });
      // 检测该直播是否存在
      if (result) {
        return result;
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
        where: {
          status: LIVE_STATUS.LIVE,
        },
        select: ['cover', 'title', 'liveId', 'openId'],
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
    status: LIVE_STATUS | LIVE_STATUS[],
    openId: string,
  ): Promise<LiveDetail[]> {
    try {
      const where = Array.isArray(status)
        ? status.map((s) => ({
            openId,
            status: s,
          }))
        : {
            status,
            openId,
          };
      const result = await this.liveDetailRepository.find({
        where,
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
          updateTime: new Date(),
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

  async getLivePushUrl(liveId: string) {
    try {
      const isLiveIdExist = await this.liveDetailRepository.findOne({
        liveId,
      });
      if (isLiveIdExist) {
        const { endTime } = isLiveIdExist;
        const result = getLivePushUrl(liveId, endTime);
        return result;
      }
      return null;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async createBarrage(
    openId: string,
    barrage: CreateBarrageRequest,
  ): Promise<boolean> {
    try {
      const { liveId, barrage: currentBarrage } = barrage;
      const { content, type } = currentBarrage;
      const barrageId = md5(`${openId}${new Date().getTime()}${liveId}`);
      const barrageDetail = new BarrageDetail();
      Object.assign(barrageDetail, {
        barrageId,
        content,
        type,
      });
      await this.barrageDetailRepository.save(barrageDetail);
      const barrageEntity = new Barrage();
      Object.assign(barrageEntity, {
        barrageId,
        liveId,
        openId,
        sendTime: new Date(),
      });
      await this.barrageRepository.save(barrageEntity);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getBarrageListByTime(
    liveId: string,
    startTime: string | number,
  ): Promise<CurrentBarrage[]> {
    try {
      const barrageList = await this.barrageRepository.find({
        where: {
          liveId,
          sendTime: startTime,
        },
      });
      const barrageDetail = await this.barrageDetailRepository.find({
        where: barrageList.map((v) => ({
          barrageId: v.barrageId,
        })),
      });
      const result = barrageList.map((barrage) => ({
        ...barrage,
        barrageContent: barrageDetail.find(
          (v) => v.barrageId === barrage.barrageId,
        ),
      }));
      return result;
    } catch (error) {
      console.error(error);
      return [];
    }
  }
}
