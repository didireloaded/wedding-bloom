export interface SMSNotificationProvider {
  sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string }>;
}

export interface EmailNotificationProvider {
  sendEmail(to: string, subject: string, htmlBody: string): Promise<{ success: boolean; messageId?: string }>;
}

export interface PaymentGatewayProvider {
  createCheckoutSession(weddingId: string, amountCents: number, currency: string, description: string): Promise<{ checkoutUrl: string; sessionId: string }>;
}

export interface WalletPassProvider {
  generateAppleWalletPass(weddingId: string, guestName: string, accessCode: string): Promise<Blob | null>;
  generateGoogleWalletPass(weddingId: string, guestName: string, accessCode: string): Promise<string | null>;
}

class DefaultMockIntegrationAdapter implements SMSNotificationProvider, EmailNotificationProvider, PaymentGatewayProvider, WalletPassProvider {
  async sendSMS(phoneNumber: string, message: string): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[IntegrationGateway] Dispatching SMS to ${phoneNumber}: ${message}`);
    return { success: true, messageId: `sms_${Date.now()}` };
  }

  async sendEmail(to: string, subject: string): Promise<{ success: boolean; messageId?: string }> {
    console.log(`[IntegrationGateway] Dispatching Email to ${to} [Subject: ${subject}]`);
    return { success: true, messageId: `email_${Date.now()}` };
  }

  async createCheckoutSession(weddingId: string, amountCents: number, currency: string, description: string): Promise<{ checkoutUrl: string; sessionId: string }> {
    return {
      checkoutUrl: `${window.location.origin}/checkout/mock?w=${weddingId}&amt=${amountCents}&cur=${currency}`,
      sessionId: `cs_test_${Date.now()}`
    };
  }

  async generateAppleWalletPass(): Promise<Blob | null> {
    return null;
  }

  async generateGoogleWalletPass(weddingId: string, guestName: string): Promise<string | null> {
    return `https://wallet.google.com/pass/mock_${weddingId}_${encodeURIComponent(guestName)}`;
  }
}

class IntegrationGatewayService {
  private smsProvider: SMSNotificationProvider = new DefaultMockIntegrationAdapter();
  private emailProvider: EmailNotificationProvider = new DefaultMockIntegrationAdapter();
  private paymentProvider: PaymentGatewayProvider = new DefaultMockIntegrationAdapter();
  private walletProvider: WalletPassProvider = new DefaultMockIntegrationAdapter();

  registerSMSProvider(provider: SMSNotificationProvider) { this.smsProvider = provider; }
  registerEmailProvider(provider: EmailNotificationProvider) { this.emailProvider = provider; }
  registerPaymentProvider(provider: PaymentGatewayProvider) { this.paymentProvider = provider; }
  registerWalletProvider(provider: WalletPassProvider) { this.walletProvider = provider; }

  get sms() { return this.smsProvider; }
  get email() { return this.emailProvider; }
  get payments() { return this.paymentProvider; }
  get wallet() { return this.walletProvider; }
}

export const IntegrationGateway = new IntegrationGatewayService();
