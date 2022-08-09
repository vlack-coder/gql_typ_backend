import {
  Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn
} from "typeorm";
// import Database from "../utils/database";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Index({ unique: true })
  @Column({ type: "uuid", unique: true, nullable: false })
  ukey: string;

  @Index({ unique: true })
  @Column({ length: 50, unique: true, nullable: false })
  email: string;

  @Column({ length: 100, nullable: false })
  password: string;

  @Column({ default: false, nullable: false })
  confirmed: boolean;

  @Column({ name: "refresh_index", default: 0, nullable: false })
  refreshIndex: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

}