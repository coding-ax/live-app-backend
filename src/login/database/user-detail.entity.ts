import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class UserDetail {
  @PrimaryColumn({
    name: 'open_id',
  })
  openId: string;

  @Column({
    name: 'nick_name',
  })
  nickName: string;

  @Column()
  signature: string;

  @Column({
    name: 'avatar_url',
  })
  avatarUrl: string;
}
