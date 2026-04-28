import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WebhooksService } from '../webhooks/webhooks.service';
import { WebhookPayload } from '../../shared/interfaces/webhook-payload.interface';
import { ConfigService } from '@nestjs/config';

@Processor('alerts')
export class AlertsProcessor {
  constructor(
    private readonly webhooksService: WebhooksService,
    private readonly configService: ConfigService,
  ) {}

  @Process('webhook-delivery')
  async handleWebhookDelivery(job: Job<WebhookPayload>) {
    const payload = job.data;
    const webhooks = await this.webhooksService.getWebhooksForEvent(payload.event);

    const timeout = this.configService.get<number>('WEBHOOK_TIMEOUT', 5000);

    await Promise.all(
      webhooks.map(async (webhook) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Secret': this.configService.get('WEBHOOK_SECRET', ''),
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`Webhook returned ${response.status}`);
          }
        } catch (error) {
          await this.webhooksService.incrementFailure(webhook.id);

          // Disable webhook after 5 consecutive failures
          const updatedWebhook = await this.webhooksService.findAll().then((all) =>
            all.find((w) => w.id === webhook.id),
          );
          if (updatedWebhook && updatedWebhook.failureCount >= 5) {
            await this.webhooksService.disableWebhook(webhook.id);
          }

          throw error;
        }
      }),
    );
  }
}
