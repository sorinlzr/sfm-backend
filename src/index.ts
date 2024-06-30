import express from "express";
import 'dotenv/config'
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { connectToDatabase, initializeEnums } from './config/dbconnection';
import userRouter from './routers/UserRouter';
import activityRouter from './routers/ActivityRouter';
import teamRouter from "./routers/TeamRouter";
import passport from "./config/passport";
import authRouter from "./routers/AuthRouter";

const port = process.env.SFM_BACKEND_PORT || 5000;

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Sport and Friends Meetup API',
        version: '1.0.0',
        description: 'API documentation using Swagger',
      },
      servers: [
        {
          url: `http://localhost:${process.env.SFM_BACKEND_PORT}`,
        },
      ],
    },
    apis: ['./src/routers/*.ts'],
};

const swaggerSpecs = swaggerJsDoc(swaggerOptions);

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(passport.initialize());


app.get("/", function (request: any, response: any) {
    response.send("Hello World!")
})

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/activity", activityRouter);
app.use("/api/team", teamRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

async function main() {
    connectToDatabase();
    initializeEnums();
}

main();