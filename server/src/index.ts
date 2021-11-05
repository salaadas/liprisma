import { PrismaClient } from '@prisma/client';
import { ApolloServer } from 'apollo-server-express';
import connectRedis from 'connect-redis';
import express from 'express';
import session from 'express-session';
import redis from 'redis';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

const prisma = new PrismaClient();

const main = async () => {
  // this is express
  const app = express();

  let RedisStore = connectRedis(session);
  let redisClient = redis.createClient();

  app.use(
    session({
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      name: 'qid',
      saveUninitialized: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
      secret: 'ksdjfklsfdafewoovnwzzco',
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => {
      return {
        prisma,
        res,
        req,
      };
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.listen(4000, () => {
    console.log('server started on localhost:4000');
  });
};

main()
  .catch((err) => {
    console.error(err);
  })
  .finally(async () => {
    await prisma.$disconnect;
  });
