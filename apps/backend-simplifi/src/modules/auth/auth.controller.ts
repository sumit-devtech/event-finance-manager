import { Controller, Post, Body, Get, UseGuards, Request } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { LoginDto } from "./dto/login.dto";
import { AuthResponseDto } from "./dto/auth-response.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("api/v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  async signup(@Body() dto: SignupDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto);
  }

  @Post("login")
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req: any) {
    return this.authService.validateUser(req.user.id);
  }
}

