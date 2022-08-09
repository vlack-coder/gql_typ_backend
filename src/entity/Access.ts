import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("access")
export class Access {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  name: string;

  @Column({ nullable: false })
  duration: number;

  @Column({ name: "duration_unit", nullable: false })
  durationUnit: string;

  @Column({ unique: true, nullable: false })
  signature: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // @UpdateDateColumn({ name: "updated_at" })
  // updatedAt: Date;
}
