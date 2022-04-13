import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserLoginHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'open_id',
  })
  openId: string;

  @Column({
    name: 'login_time',
  })
  loginTime: string;
}
