import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '@generated/type-graphql';
import { MyContext } from '../types';
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { prisma, req }: MyContext): Promise<User | null> {
    if (!req.session.userId) {
      return null;
    }
    return await prisma.user.findUnique({ where: { id: req.session.userId } });
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { prisma, req }: MyContext
  ): Promise<UserResponse | null> {
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

    const hashedPassword = await argon2.hash(options.password);

    try {
      const user = await prisma.user.create({
        data: {
          username: options.username,
          password: hashedPassword,
        },
      });

      req.session.userId = user.id;

      return { user };
    } catch (err) {
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

  @Mutation(() => UserResponse, { nullable: true })
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { prisma, req }: MyContext
  ): Promise<UserResponse> {
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

    const isValid = await argon2.verify(user.password, options.password);
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
}
