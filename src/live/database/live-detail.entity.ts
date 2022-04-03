import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class LiveDetail {
  @PrimaryColumn({
    name: 'live_id',
  })
  liveId: string;

  @Column()
  openId: string;

  @Column()
  title: string;

  @Column()
  cover: string;

  @Column({
    name: 'start_time',
  })
  startTime: Date;

  @Column({
    name: 'end_time',
  })
  endTime: Date;

  @Column({
    name: 'update_time',
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updateTime: Date;

  @Column()
  status: number;
}
