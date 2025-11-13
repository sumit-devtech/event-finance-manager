import { Controller, Post, Body, UseGuards, Get, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(@Body() loginDto: { email: string; password: string }) {
    // TODO: Implement login logic
    // const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    // return this.authService.login(user);
    return { message: "Login endpoint - to be implemented" };
  }

  @Post("register")
  async register(@Body() registerDto: { email: string; password: string; name?: string }) {
    // TODO: Implement registration logic
    return { message: "Register endpoint - to be implemented" };
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  getProfile(@Request() req) {
    return req.user;
  }
}

