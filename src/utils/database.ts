import { Repository, ObjectType, getManager } from "typeorm";
import { AppDataSource } from "../data-source";

export default class Database<T> {
  repo: Repository<T>;
  constructor(entityClass: ObjectType<T>) {
    // this.repo = getManager().getRepository(entityClass);
    this.repo = AppDataSource.getRepository(entityClass);
    // const UserRepository = AppDataSource.getRepository(entityClass);
    // this.repo = getManager().getRepository(entityClass);
  }
  async save(entity: T) {
    try {
      await this.repo.save(entity);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async get(filter: object) {
    try {
      // this.repo.
      return await this.repo.findOne(filter);
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }
}
