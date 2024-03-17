import { AbstractPaymentProcessor, PaymentProviderService, PaymentProcessorContext, PaymentProcessorSessionResponse, PaymentSessionStatus } from "@medusajs/medusa";
import { Client } from "@payhere/payhere-mobilesdk-reactnative";

interface PaymentProcessorError {
    error: string
    code?: string
    detail?: any
}

class PayherePaymentProcessor extends AbstractPaymentProcessor {

    protected paymentProviderService: PaymentProviderService
    client: Client;
  static identifier = "payhere";

  constructor(container, options) {
    super(container);
    this.client = new Client(options);
    this.paymentProviderService = container.paymentProviderService
  }

  protected buildError(message: string, e) {
    return {
      error: message,
      code: e.code,
      detail: e.detail,
    };
  }

  async capturePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    const paymentId = paymentSessionData.id

    // assuming client is an initialized client
    // communicating with a third-party service.
    const captureData = this.client.catch(paymentId)

    return {
      id: paymentId,
      ...captureData
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<
    PaymentProcessorError |
    {
      status: PaymentSessionStatus;
      data: Record<string, unknown>;
    }
  > {
    try {
      await this.client.authorize(paymentSessionData.id)

      return {
        status: PaymentSessionStatus.AUTHORIZED,
        data: {
          id: paymentSessionData.id
        }
      }
    } catch (e) {
      return {
        error: e.message
      }
    }
  }

  async cancelPayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    const paymentId = paymentSessionData.id

    // assuming client is an initialized client
    // communicating with a third-party service.
    const cancelData = this.client.cancel(paymentId)

    return {
      id: paymentId,
      ...cancelData
    }
  }

  async initiatePayment(context: PaymentProcessorContext): Promise<PaymentProcessorError | PaymentProcessorSessionResponse> {
    // assuming client is an initialized client
    // communicating with a third-party service.

    try {
        const clientPayment = await this.client.initiate(context)

        return {
        session_data: {
            id: clientPayment.id
        },
        }
    } catch (e) {
        return this.buildError("An error occurred in initiatePayment", e);
    }
  }

  async deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    const paymentId = paymentSessionData.id
    // assuming client is an initialized client
    // communicating with a third-party service.
    this.client.delete(paymentId)

    return {}
  }

  async getPaymentStatus(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentSessionStatus> {
    const paymentId = paymentSessionData.id

    // assuming client is an initialized client
    // communicating with a third-party service.
    return await this.client.getStatus(paymentId) as PaymentSessionStatus
  }

  async refundPayment(
    paymentSessionData: Record<string, unknown>,
    refundAmount: number
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    const paymentId = paymentSessionData.id

    // assuming client is an initialized client
    // communicating with a third-party service.
    const refundData = this.client.refund(paymentId, refundAmount)

    return {
      id: paymentId,
      ...refundData
    }
  }

  async retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<Record<string, unknown> | PaymentProcessorError> {
    const paymentId = paymentSessionData.id

    // assuming client is an initialized client
    // communicating with a third-party service.
    return await this.client.retrieve(paymentId)
  }

  async updatePayment(
    context: PaymentProcessorContext
  ): Promise<
    void |
    PaymentProcessorError |
    PaymentProcessorSessionResponse
  > {
    // assuming client is an initialized client
    // communicating with a third-party service.
    const paymentId = context.paymentSessionData.id

    await this.client.update(paymentId, context)

    return {
      session_data: context.paymentSessionData
    }
  }

  async updatePaymentData(
    sessionId: string,
    data: Record<string, unknown>
  ): Promise<
    Record<string, unknown> |
    PaymentProcessorError
  > {
    const paymentSession = await this.paymentProviderService.retrieveSession(sessionId)
    // assuming client is an initialized client
    // communicating with a third-party service.
    const clientPayment = await this.client.update(paymentSession.data.id, data)

    return {
      id: clientPayment.id
    }
  }

}

export default PayherePaymentProcessor;
