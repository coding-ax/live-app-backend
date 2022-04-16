import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Barrage {
  @PrimaryGeneratedColumn({
    name: 'id',
  })
  id: number;

  @Column({
    name: 'live_id',
  })
  liveId: string;

  @Column()
  openId: string;

  @PrimaryColumn({
    name: 'barrage_id',
  })
  barrageId: string;

  @Column({
    name: 'send_time',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sendTime: Date;
}
