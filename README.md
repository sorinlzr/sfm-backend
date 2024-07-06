#  Sports and friends Meetup!
## Backend server for the Mobile App Development project at FH Campus Wien


### Install dependencies

Make sure that you have [node v20.5.0 and npm 10.2.4](https://nodejs.org/en/download) installed. 
If you do, then run the command below to install the required dependencies:
```
npm install
```

### Scripts overview

- `npm run dev` - Starts the application in development using [tsx](https://github.com/privatenumber/tsx) and automatically rerun on changes
- `npm run start` - Starts the app in production by first building the project with `npm run build`, and then executing the compiled JavaScript in `./build/index.js`
- `npm run build` - Compiles the TypeScript files to vanilla JS and adds them in the `./build` folder, cleaning them first.


### Docker
The project uses docker containers, so you should have the [docker](https://www.docker.com/) engine installed on your machine.<br>

There are three docker compose files available:
* docker-compose.yml - contains only the backend service
* docker-compose-db.yml - contains only the mongo and mongo-express services
* docker-compose-all.yml - contains all three services

Before starting the containers you need to add some necessary environment variables mentioned below.

### Environment variables
Set the following environment variables in a `.env` file in the root project folder:
```
SFM_BACKEND_PORT            - the backend application server port. If not set it defaults to 5000
SFM_FRONTEND_PORT           - the frontent application server port
JWT_SECRET                  - the secret used to generate the JWT token
JWT_MAX_AGE                 - the expiration time of the token. Also used for the cookie maxAge

MONGO_ROOT_USER             - the db user
MONGO_ROOT_PASSWORD         - the db password
MONGO_HOST                  - the host where the db is running, if using mongo in a docker container it should be set to 'localhost'
MONGO_PORT                  - the port where the mongoDB can service can be reached if running locally. If running in the Mongo DB Atlas Cloud it's not needed
MONGO_DB_NAME               - the database name
MONGO_DB_COLLECTION         - the initial collection inside the database specified above

MONGOEXPRESS_LOGIN          - the user for the UI interface login
MONGOEXPRESS_PASSWORD       - the password for the UI interface login
MONGOEXPRESS_PORT           - the port where to access the web UI interface

```
### Spinning up the app locally using Docker
Open a terminal in the repository root directory and run:
```
docker compose up
``` 
to use the default docker compose file. If it is the first time you run the command, docker will build the image based on the Dockerfile. 

The command will always start the same container. but if you want to rebuild the it, then run the command:
```
docker compose up --build
```

### Spinning up the database locally using docker with Mongo

Open a terminal in the repository root directory and run 
```
docker compose -f <filename> up
``` 
to use any of the other docker compose files containing the mongoDB service. 

### Swagger API

You can access the Swagger API at the `/api-docs` endpoint

<br>
Once you start the application, the `mongoose.connect()` function is called from the `dbconnection.ts` file. This will create the database connection that will be used when the application will save documents to the database. More info in the [Mongoose documentation](https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.connect())
