"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const type_graphql_2 = require("@generated/type-graphql");
const argon2_1 = __importDefault(require("argon2"));
let UsernamePasswordInput = class UsernamePasswordInput {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "username", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], UsernamePasswordInput.prototype, "password", void 0);
UsernamePasswordInput = __decorate([
    (0, type_graphql_1.InputType)()
], UsernamePasswordInput);
let FieldError = class FieldError {
};
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "field", void 0);
__decorate([
    (0, type_graphql_1.Field)(),
    __metadata("design:type", String)
], FieldError.prototype, "message", void 0);
FieldError = __decorate([
    (0, type_graphql_1.ObjectType)()
], FieldError);
let UserResponse = class UserResponse {
};
__decorate([
    (0, type_graphql_1.Field)(() => [FieldError], { nullable: true }),
    __metadata("design:type", Array)
], UserResponse.prototype, "errors", void 0);
__decorate([
    (0, type_graphql_1.Field)(() => type_graphql_2.User, { nullable: true }),
    __metadata("design:type", type_graphql_2.User)
], UserResponse.prototype, "user", void 0);
UserResponse = __decorate([
    (0, type_graphql_1.ObjectType)()
], UserResponse);
let UserResolver = class UserResolver {
    async me({ prisma, req }) {
        if (!req.session.userId) {
            return null;
        }
        return await prisma.user.findUnique({ where: { id: req.session.userId } });
    }
    async register(options, { prisma, req }) {
        if (options.username.length <= 2) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'must be longer than 2',
                    },
                ],
            };
        }
        if (options.password.length <= 2) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'must be longer than 2',
                    },
                ],
            };
        }
        const hashedPassword = await argon2_1.default.hash(options.password);
        try {
            const user = await prisma.user.create({
                data: {
                    username: options.username,
                    password: hashedPassword,
                },
            });
            req.session.userId = user.id;
            return { user };
        }
        catch (err) {
            if (err.code === 'P2002' && err.meta.target[0] === 'username') {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username already taken',
                        },
                    ],
                };
            }
            return null;
        }
    }
    async login(options, { prisma, req }) {
        const user = await prisma.user.findUnique({
            where: {
                username: options.username,
            },
        });
        if (!user) {
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'username does not exist',
                    },
                ],
            };
        }
        const isValid = await argon2_1.default.verify(user.password, options.password);
        if (!isValid) {
            return {
                errors: [
                    {
                        field: 'password',
                        message: 'password is incorrect',
                    },
                ],
            };
        }
        req.session.userId = user.id;
        return { user };
    }
};
__decorate([
    (0, type_graphql_1.Query)(() => type_graphql_2.User, { nullable: true }),
    __param(0, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "me", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "register", null);
__decorate([
    (0, type_graphql_1.Mutation)(() => UserResponse, { nullable: true }),
    __param(0, (0, type_graphql_1.Arg)('options')),
    __param(1, (0, type_graphql_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UsernamePasswordInput, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "login", null);
UserResolver = __decorate([
    (0, type_graphql_1.Resolver)()
], UserResolver);
exports.UserResolver = UserResolver;
//# sourceMappingURL=user.js.map