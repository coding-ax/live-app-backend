import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class BarrageDetail {
  @PrimaryColumn({
    name: 'barrage_id',
  })
  barrageId: string;

  @Column({
    name: 'type',
  })
  type: string;

  @Column({
    name: 'content',
  })
  content: string;
}
