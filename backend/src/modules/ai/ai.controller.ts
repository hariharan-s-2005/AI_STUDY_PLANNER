import { Controller, Post, Get, Body, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AiService } from "./ai.service";

@Controller("ai")
@UseGuards(AuthGuard("jwt"))
export class AiController {
  constructor(private aiService: AiService) {}

  @Get("test")
  test() {
    return { reply: "AI backend is working! Type a question to chat." };
  }

  @Post("chat")
  async chat(@Body() body: { message: string; history?: { role: string; content: string }[] }) {
    if (!body.message || typeof body.message !== "string") {
      return { reply: "Please type a question." };
    }

    let message = body.message
      .replace(/image\.png/gi, "")
      .replace(/image\.jpg/gi, "")
      .replace(/\.png/gi, "")
      .replace(/\.jpg/gi, "")
      .replace(/\.jpeg/gi, "")
      .replace(/\.gif/gi, "")
      .replace(/data:image/gi, "")
      .trim();

    if (!message || message.length < 2) {
      message = "Hello";
    }

    return this.aiService.chat(message, body.history || []);
  }
}
