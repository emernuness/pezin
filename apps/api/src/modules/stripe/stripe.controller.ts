import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
} from '@nestjs/common';
import { StripeService } from './stripe.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PrismaService } from '@/prisma/prisma.service';

@Controller('stripe')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StripeController {
  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService
  ) {}

  @Post('checkout')
  async createCheckout(
    @Body() body: { packId: string },
    @CurrentUser() user: any
  ) {
    const session = await this.stripeService.createCheckoutSession(
      body.packId,
      user.id
    );

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  @Post('connect/onboard')
  @Roles('creator')
  async startOnboarding(@CurrentUser() user: any) {
    let stripeAccountId = user.stripeAccountId;

    // Create account if doesn't exist
    if (!stripeAccountId) {
      stripeAccountId = await this.stripeService.createConnectAccount(
        user.id,
        user.email
      );
    }

    // Create account link for onboarding
    const accountLink =
      await this.stripeService.createAccountLink(stripeAccountId);

    return {
      url: accountLink.url,
    };
  }

  @Get('connect/status')
  @Roles('creator')
  async getConnectStatus(@CurrentUser() user: any) {
    if (!user.stripeAccountId) {
      return {
        connected: false,
        onboardingComplete: false,
      };
    }

    const account = await this.stripeService.getAccount(user.stripeAccountId);

    const onboardingComplete =
      account.details_submitted && account.charges_enabled;

    // Update user if onboarding is complete
    if (onboardingComplete && !user.stripeConnected) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { stripeConnected: true },
      });
    }

    return {
      connected: user.stripeConnected || onboardingComplete,
      onboardingComplete,
      chargesEnabled: account.charges_enabled,
      detailsSubmitted: account.details_submitted,
    };
  }
}
