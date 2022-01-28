import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class UserAuth {
    @PrimaryGeneratedColumn()
    id: number;

    @PrimaryColumn()
    open_id: string;

    @Column()
    email: string;

    @Column()
    password: string;
}