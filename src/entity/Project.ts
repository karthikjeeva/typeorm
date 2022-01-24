import {Entity, Column, PrimaryGeneratedColumn, ManyToOne} from "typeorm";
import {User} from "./User"; 

@Entity()
export class Project {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @ManyToOne(type => User, user => user.projects,  {onDelete: "CASCADE"}) user!: User; 

}