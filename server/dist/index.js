"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const apollo_server_express_1 = require("apollo-server-express");
const connect_redis_1 = __importDefault(require("connect-redis"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const redis_1 = __importDefault(require("redis"));
require("reflect-metadata");
const type_graphql_1 = require("type-graphql");
const hello_1 = require("./resolvers/hello");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const prisma = new client_1.PrismaClient();
const main = async () => {
    const app = (0, express_1.default)();
    let RedisStore = (0, connect_redis_1.default)(express_session_1.default);
    let redisClient = redis_1.default.createClient();
    app.use((0, express_session_1.default)({
        store: new RedisStore({ client: redisClient, disableTouch: true }),
        name: 'qid',
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
        },
        secret: 'ksdjfklsfdafewoovnwzzco',
        resave: false,
    }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [hello_1.HelloResolver, post_1.PostResolver, user_1.UserResolver],
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
//# sourceMappingURL=index.js.map