import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class UserLoginHistory {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    open_id: string;

    @Column()
    login_time: string;
}