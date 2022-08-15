import dotenv from "dotenv";
import express from "express";
import { graphqlHTTP } from "express-graphql"; /* A middleware to handle GraphQl request */
dotenv.config();
// import * as dotenv from 'dotenv'
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
import "reflect-metadata";
import { root, schema } from "./api/schema";
import accessController from "./Controllers/access.controller";
import { AppDataSource } from "./data-source";

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
    await accessController.load();
    const app = express();
    const corOptions: CorsOptions = { 
      origin: process.env.CORS_ORIGIN,
      credentials: true,
      optionsSuccessStatus: 200, // for legacy browsers bcus some browsers choke on 204
    };

    // app.use(cors());
    app.use(cors(corOptions));
    app.use(express.json());
    app.use(cookieParser());

    app.use(
      process.env.GRAPHQL_PATH!,
      graphqlHTTP((req, res) => ({
        schema: schema,
        rootValue: root,
        graphiql: true,
        context: {
          req: req,
          res: res,
        },
      }))
      //   graphqlHTTP((request, response, getGraphQLParams) => ({
      //     schema: schema,
      //     rootVaIue: root,
      //     graphiql: true,
      //     context: {
      //       req: request,
      //       res: response,
      //     },
      //   }))
    );

    app.listen(parseInt(process.env.APP_PORT!));
    const link = `http://localhost:${process.env.APP_PORT!}${
      process.env.GRAPHQL_PATH
    }`;
    console.log(`server started at url : ${link}`);
  })
  .catch((error) => console.log(error));
