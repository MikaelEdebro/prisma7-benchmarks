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
