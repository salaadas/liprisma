import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { MyContext } from '../types';
import { Post } from '@generated/type-graphql';

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { prisma }: MyContext): Promise<Post[]> {
    return await prisma.post.findMany();
  }

  @Query(() => Post, { nullable: true })
  async post(
    @Arg('id') id: number,
    @Ctx() { prisma }: MyContext
  ): Promise<Post | null> {
    return await prisma.post.findUnique({
      where: {
        id,
      },
    });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg('title') title: string,
    @Ctx() { prisma }: MyContext
  ): Promise<Post> {
    const post = await prisma.post.create({
      data: {
        title,
      },
    });

    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg('id') id: number,
    @Arg('title') title: string,
    @Ctx() { prisma }: MyContext
  ): Promise<Post | null> {
    try {
      const post = await prisma.post.update({
        where: {
          id,
        },
        data: {
          title,
        },
      });

      return post;
    } catch {
      return null;
    }
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg('id') id: number,
    @Ctx() { prisma }: MyContext
  ): Promise<boolean> {
    try {
      await prisma.post.delete({
        where: {
          id,
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}
