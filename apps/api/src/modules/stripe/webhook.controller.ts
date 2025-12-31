import {
  Controller,
  Post,
  Req,
  Headers,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';
import { PrismaService } from '@/prisma/prisma.service';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private stripeService: StripeService,
    private prisma: PrismaService
  ) {}

  @Post()
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    // Get raw body (must be Buffer)
    const rawBody = req.body;

    if (!Buffer.isBuffer(rawBody)) {
      throw new BadRequestException('Request body must be raw buffer');
    }

    // Verify webhook signature
    const event = await this.stripeService.constructEvent(rawBody, signature);

    this.logger.log(`Received webhook: ${event.type} (${event.id})`);

    // Check idempotency - prevent duplicate processing
    const existingEvent = await this.prisma.stripeEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent?.processed) {
      this.logger.warn(
        `Event ${event.id} already processed. Skipping duplicate.`
      );
      return { received: true, status: 'duplicate' };
    }

    // Store event for idempotency
    await this.prisma.stripeEvent.upsert({
      where: { id: event.id },
      create: {
        id: event.id,
        type: event.type,
        payload: JSON.stringify(event),
        processed: false,
      },
      update: {},
    });

    try {
      // Process event
      await this.processEvent(event);

      // Mark as processed
      await this.prisma.stripeEvent.update({
        where: { id: event.id },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });

      this.logger.log(`Event ${event.id} processed successfully`);

      return { received: true, status: 'processed' };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(
          `Failed to process event ${event.id}: ${error.message}`,
          error.stack
        );
      }

      // Don't mark as processed - allow retry
      throw error;
    }
  }

  private async processEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as Stripe.Charge);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const { packId, userId, creatorId } = session.metadata as {
      packId: string;
      userId: string;
      creatorId: string;
    };

    const paymentIntentId = session.payment_intent as string;

    // Check if purchase already exists (idempotency at purchase level)
    const existingPurchase = await this.prisma.purchase.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (existingPurchase) {
      this.logger.warn(
        `Purchase for payment intent ${paymentIntentId} already exists. Skipping.`
      );
      return;
    }

    // Get pack details for fee calculation
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
    });

    if (!pack) {
      throw new Error(`Pack ${packId} not found`);
    }

    const amount = session.amount_total || 0;
    const platformFee = Math.round(amount * 0.2); // 20%
    const creatorEarnings = amount - platformFee; // 80%

    // Create purchase
    const purchase = await this.prisma.purchase.create({
      data: {
        userId,
        packId,
        creatorId,
        amount,
        platformFee,
        creatorEarnings,
        stripePaymentIntentId: paymentIntentId,
        status: 'paid',
        availableAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    this.logger.log(
      `Purchase created: ${purchase.id} for user ${userId}, pack ${packId}`
    );

    // TODO: Send confirmation emails (add in future PR if needed)
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const paymentIntentId = charge.payment_intent as string;

    // Find purchase
    const purchase = await this.prisma.purchase.findUnique({
      where: { stripePaymentIntentId: paymentIntentId },
    });

    if (!purchase) {
      this.logger.warn(
        `Purchase for payment intent ${paymentIntentId} not found. Cannot refund.`
      );
      return;
    }

    // Update purchase status
    await this.prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        status: 'refunded',
        refundedAt: new Date(),
      },
    });

    this.logger.log(`Purchase ${purchase.id} marked as refunded`);

    // TODO: Adjust creator balance if needed (add in future PR)
  }
}
