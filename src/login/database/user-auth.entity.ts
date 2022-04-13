import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class UserAuth {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn({
    name: 'open_id',
  })
  openId: string;

  @Column()
  email: string;

  @Column()
  password: string;
}
