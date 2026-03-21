import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private aiService: AiService) {}

  @Get('test')
  test() {
    return { reply: 'AI backend is working! Type a question to chat.' };
  }

  @Post('chat')
  async chat(@Body() body: { message: string }) {
    if (!body.message || typeof body.message !== 'string') {
      return { reply: 'Please type a question.' };
    }

    return this.aiService.chat(body.message);
  }
}
