export class BaseLiveRequest {
  readonly liveId?: string;
}

export class ChangeStatusRequest extends BaseLiveRequest {
  readonly status: number;
}

export class CreateLiveRequest extends BaseLiveRequest {
  readonly title: string;
  readonly cover: string;
  readonly startTime: number;
  readonly endTime: number;
}
