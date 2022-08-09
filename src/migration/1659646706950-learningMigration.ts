import { MigrationInterface, QueryRunner } from "typeorm";
import dotenv from "dotenv"
dotenv.config()

export class learningMigration1659646706950 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const start = `INSERT INTO access (name, duration, duration_unit, signature) values (`;
    
    await queryRunner.query(`${start}'${process.env.ACCESS_TYPE_USER}',15,'m','${randomString()}')`)
    await queryRunner.query(`${start}'${process.env.ACCESS_TYPE_REFRESH}',5,'d','${randomString()}')`)
    await queryRunner.query(`${start}'${process.env.ACCESS_TYPE_CONFIRM}',10,'m','${randomString()}')`)
    await queryRunner.query(`${start}'${process.env.ACCESS_TYPE_FORGOT_PASSWORD}',10,'m','${randomString()}')`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM access')
    await queryRunner.query('ALTER SEQUENCE access_id_seq RESTART')
    
  }
}
function randomString(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
