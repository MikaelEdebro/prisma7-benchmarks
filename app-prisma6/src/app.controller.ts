import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHello(): string {
    return `Hello World!`;
  }

  @Get("posts")
  getPosts() {
    return this.prisma.post.findMany({
      take: 100,
    });
  }

  @Get("posts/:id")
  getPostsById(@Param("id") id: string) {
    return this.prisma.post.findUnique({
      where: { id },
    });
  }

  @Get("posts-with-comments")
  getPostsWithComments() {
    return this.prisma.post.findMany({
      take: 100,
      include: {
        comments: true,
      },
    });
  }

  @Get("posts-with-comments/:id")
  getPostWithCommentsById(@Param("id") id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        comments: true,
      },
    });
  }

  @Post("posts")
  createPost(@Body() body: { title: string; body: string }) {
    return this.prisma.post.create({
      data: {
        title: body.title,
        body: body.body,
      },
    });
  }
}
