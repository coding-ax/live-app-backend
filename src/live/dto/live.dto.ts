export class BaseLiveRequest {
  readonly liveId?: string;
}

export enum LIVE_STATUS {
  // 未直播
  PLAN = 0,
  // 直播中
  LIVE = 1,
  // 直播结束
  END = 2,
}

export class ChangeStatusRequest extends BaseLiveRequest {
  readonly status: LIVE_STATUS;
}

export class CreateLiveRequest extends BaseLiveRequest {
  readonly title: string;
  readonly cover: string;
  readonly startTime: number;
  readonly endTime: number;
}

export class GetSecretLiveListRequest {
  readonly status?: LIVE_STATUS | LIVE_STATUS[];
}
