import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    const secretKey = this.config.get<string>('STRIPE_SECRET_KEY');
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(
    packId: string,
    userId: string
  ): Promise<Stripe.Checkout.Session> {
    // Get pack and creator info
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: { creator: true },
    });

    if (!pack) {
      throw new BadRequestException('Pack não encontrado');
    }

    if (pack.status !== 'published') {
      throw new BadRequestException('Pack não está publicado');
    }

    if (!pack.creator.stripeAccountId) {
      throw new BadRequestException('Criador não conectou Stripe');
    }

    // Calculate fees
    const platformFee = Math.round(pack.price * 0.2); // 20%

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: pack.title,
              description: pack.description || undefined,
            },
            unit_amount: pack.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: pack.creator.stripeAccountId,
        },
      },
      metadata: {
        packId: pack.id,
        userId: userId,
        creatorId: pack.creatorId,
      },
      success_url: `${this.config.get('WEB_URL')}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.config.get('WEB_URL')}/pack/${pack.id}`,
    });

    this.logger.log(
      `Checkout session created: ${session.id} for pack ${packId}`
    );

    return session;
  }

  async createConnectAccount(userId: string, email: string): Promise<string> {
    // Create Stripe Connect account
    const account = await this.stripe.accounts.create({
      type: 'express',
      country: 'BR',
      email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
    });

    // Update user with Stripe account ID
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        stripeAccountId: account.id,
        stripeConnected: false, // Will be true after onboarding
      },
    });

    this.logger.log(
      `Stripe Connect account created: ${account.id} for user ${userId}`
    );

    return account.id;
  }

  async createAccountLink(
    stripeAccountId: string
  ): Promise<Stripe.AccountLink> {
    const webUrl = this.config.get<string>('WEB_URL');

    const accountLink = await this.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${webUrl}/dashboard/stripe/refresh`,
      return_url: `${webUrl}/dashboard/stripe/complete`,
      type: 'account_onboarding',
    });

    return accountLink;
  }

  async getAccount(stripeAccountId: string): Promise<Stripe.Account> {
    return this.stripe.accounts.retrieve(stripeAccountId);
  }

  async constructEvent(
    payload: Buffer,
    signature: string
  ): Promise<Stripe.Event> {
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');

    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }

    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );
    } catch (err) {
      this.logger.error(`Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }
  }

  getStripeClient(): Stripe {
    return this.stripe;
  }
}
