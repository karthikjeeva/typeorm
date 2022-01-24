import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from "typeorm";
import {Project} from "./Project"; 


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column()
    std!: number;


    @OneToMany(type => Project, project => project.user,{cascade:true}) projects!: Project[];  


}