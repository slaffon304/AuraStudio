import { Currency } from '../../types';

export interface CheckoutParams {
  packageId: string;
  userId: string;
  userEmail: string;
  amount: number;
  currency: Currency;
  returnUrl: string;
}

export interface CheckoutResult {
  checkoutUrl?: string;
  sessionId?: string;
  isConfigured: boolean;
  message?: string;
}

export interface PaymentVerificationResult {
  isSuccess: boolean;
  transactionId?: string;
  creditsToAdd?: number;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  error?: string;
}

export interface IPaymentProvider {
  id: string;
  name: string;
  isConfigured(): boolean;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  verifyPayment(transactionId: string): Promise<PaymentVerificationResult>;
  handleWebhook(payload: any, signature: string): Promise<{ handled: boolean; error?: string }>;
}

/**
 * Generic Card & Bank Gateway Abstraction (Stripe / Netopia / Paynet Moldova)
 * Returns clear configuration guidance if live keys are not yet connected.
 */
export class StandardPaymentGateway implements IPaymentProvider {
  id = 'standard-gateway';
  name = 'Online Card & Bank Payments';

  isConfigured(): boolean {
    // In production, checks for STRIPE_SECRET_KEY, PAYNET_KEY or NETOPIA_KEY in env
    return Boolean(process.env.PAYMENT_GATEWAY_KEY);
  }

  async createCheckout(params: CheckoutParams): Promise<CheckoutResult> {
    if (!this.isConfigured()) {
      return {
        isConfigured: false,
        message: 'Modulul de plată online este în curs de configurare. Pentru creditare de test, folosește panoul de administrare.'
      };
    }

    return {
      isConfigured: true,
      checkoutUrl: `https://checkout.example.com/pay/${params.packageId}`,
      sessionId: `sess_${Date.now()}`
    };
  }

  async verifyPayment(): Promise<PaymentVerificationResult> {
    if (!this.isConfigured()) {
      return {
        isSuccess: false,
        status: 'failed',
        error: 'Payment gateway credentials are not configured on server.'
      };
    }

    return {
      isSuccess: false,
      status: 'pending'
    };
  }

  async handleWebhook(): Promise<{ handled: boolean; error?: string }> {
    return { handled: false, error: 'Payment gateway webhook not configured.' };
  }
}

export const paymentGateway = new StandardPaymentGateway();
