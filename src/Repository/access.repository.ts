import { AppDataSource } from "../data-source";
import { Access } from "../entity/Access";

export const AccessRepository = AppDataSource.getRepository(Access).extend({
  findByName(firstName: string, lastName: string) {
    return this.createQueryBuilder("user")
      .where("user.firstName = :firstName", { firstName })
      .andWhere("user.lastName = :lastName", { lastName })
      .getMany();
  },
});
