import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class ChatClientController {
  @Get()
  @Render('index')
  root() {
    return { message: 'Hello world!' };
  }
}
