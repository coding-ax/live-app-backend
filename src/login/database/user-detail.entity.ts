import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class UserDetail {
  @PrimaryColumn()
  open_id: string;

  @Column()
  nick_name: string;

  @Column()
  signature: string;

  @Column()
  avatar_url: string;
}
