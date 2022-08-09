import express from "express";
import { graphqlHTTP } from "express-graphql"; /* A middleware to handle GraphQl request */
// import * as dotenv from 'dotenv'
import 'reflect-metadata'
import dotenv from "dotenv";
import { schema, root } from "./api/schema";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
dotenv.config();
console.log(process.env);

AppDataSource.initialize()
  .then(async () => {
    // console.log("Inserting a new user into the database...")
    // const user = new User()
    // user.firstName = "Timber"
    // user.lastName = "Saw"
    // user.age = 25
    // await AppDataSource.manager.save(user)
    // console.log("Saved a new user with id: " + user.id)

    // console.log("Loading users from the database...")
    // const users = await AppDataSource.manager.find(User)
    // console.log("Loaded users: ", users)

    // console.log("Here you can setup and run express / fastify / any other framework.")
    const app = express();
    app.use(express.json());

    app.use(
      process.env.GRAPHQL_PATH!,
      graphqlHTTP((request, response, getGraphQLParams) => ({
        schema: schema,
        rootVaIue: root,
        graphiql: true,
        context: {
          req: request,
          res: response,
        },
      }))
    );

    app.listen(parseInt(process.env.APP_PORT!));
    const link = `http://localhost:${process.env.APP_PORT!}${
      process.env.GRAPHQL_PATH
    }`;
    console.log(`server started at url : ${link}`);
  })
  .catch((error) => console.log(error));
