import { AbstractPaymentProcessor, PaymentProcessorContext, PaymentProcessorError, PaymentProcessorSessionResponse, PaymentProviderService, PaymentSession, PaymentSessionStatus, isPaymentProcessorError } from "@medusajs/medusa";
import { EOL } from "os";
import md5 from 'crypto-js/md5';
import { MedusaError } from "medusa-core-utils";

class PayherePaymentService extends AbstractPaymentProcessor {
    static identifier = "Online Payment"
    static merchantSecret  = process.env.PAYHERE_MERCHANT_SECRET;
    static merchantId      = process.env.PAYHERE_MERCHANT_ID;
    static appId  = process.env.PAYHERE_APP_SECRET;
    static appSecret      = process.env.PAYHERE_APP_ID;

    protected paymentProviderService: PaymentProviderService
    // ...
    constructor(container, options) {
        super(container)
        this.paymentProviderService = container.paymentProviderService
        // ...
    }
    /**
     * Returns the currently held status.
     * @param {object} paymentData - payment method data from cart
     * @returns {string} the status of the payment
     */
    async getPaymentStatus(
        paymentSessionData: Record<string, unknown>
      ): Promise<PaymentSessionStatus> {
        console.log("getPaymentStatus")
        console.log(paymentSessionData)
        return await paymentSessionData?.status as PaymentSessionStatus
      }

    /**
     * Retrieves payment
     * @param {object} data - the data of the payment to retrieve
     * @returns {Promise<object>} returns data
     */
    async retrievePayment(
        paymentSessionData: Record<string, unknown>
      ): Promise<Record<string, unknown> | PaymentProcessorError> {
        return paymentSessionData
      }

    /**
     * Updates the payment status to authorized
     * @returns {Promise<{ status: string, data: object }>} result with data and status
     */
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
        if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret){
            return {
                status: PaymentSessionStatus.ERROR,
                data: {}
              }
        }
        try {
          if("payment_id" in paymentSessionData &&
          "status" in paymentSessionData &&
          paymentSessionData.status === PaymentSessionStatus.AUTHORIZED){
            console.log( "authorizePayment")
            console.log(paymentSessionData)
            return {
              status: PaymentSessionStatus.AUTHORIZED,
              data: {
                id: paymentSessionData.id,
                ...paymentSessionData
              }
            }
          }
          return {
            status: PaymentSessionStatus.REQUIRES_MORE,
            data: {
              id: paymentSessionData.id,
              ...paymentSessionData
            }
          }
        } catch (e) {
          return {
            error: e.message
          }
        }
      }

    /**
     * Noop, simply returns existing data.
     * @param {object} sessionData - payment session data.
     * @returns {object} same data
     */
    async updatePayment(
        context: PaymentProcessorContext
      ): Promise<
        void |
        PaymentProcessorError |
        PaymentProcessorSessionResponse
      > {
        try {
            if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret){
                throw new Error("Unauthorized")
            }
            return {
                session_data: context.paymentSessionData
            }
        } catch (error) {
            return this.buildError(
                "An error occurred in updatePayment",
                error
              )
        }
      }

    /**
     * @param {object} sessionData - payment session data.
     * @param {object} update - payment session update data.
     * @returns {object} existing data merged with update data
     */
    async updatePaymentData(
        sessionId: string,
        data: Record<string, unknown>
      ): Promise<
        Record<string, unknown> |
        PaymentProcessorError
      > {
        try {
            if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret){
                throw new Error("Unauthorized")
            }
            const paymentSession = await this.paymentProviderService.retrieveSession(sessionId)
            const hash = this.generateHash(paymentSession, paymentSession.cart_id);
            return {
              id: "payhere_"+paymentSession.cart_id,
              hash,
              ...paymentSession.data,
              ...data
            }
        } catch (error) {
            return this.buildError(
                "An error occurred in initiatePayment",
                error
              )
        }
      }

    async deletePayment(
        paymentSessionData: Record<string, unknown>
      ): Promise<Record<string, unknown> | PaymentProcessorError> {
        try {
            if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret){
                throw new Error("Unauthorized")
            }
            throw new Error("Method not implemented.")
        } catch (error) {
            return this.buildError(
                "An error occurred",
                error
              )
        }
      }

    /**
     * Updates the payment status to captured
     * @param {object} paymentData - payment method data from cart
     * @returns {object} object with updated status
     */
    async capturePayment() {
      return { status: "captured" }
    }

    /**
     * Noop, resolves to allow manual refunds.
     * @param {object} payment - payment method data from cart
     * @returns {string} same data
     */
    async refundPayment(
        paymentSessionData: Record<string, unknown>,
        refundAmount: number
      ): Promise<Record<string, unknown> | PaymentProcessorError> {

        try {
            if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret ||
                !PayherePaymentService.appId || !PayherePaymentService.appSecret ||
                !("payment_id" in paymentSessionData)){
                throw new Error("Unauthorized")
            }
            throw new Error("Method not implemented.")
            const paymentId = paymentSessionData?.payment_id
            return {
              id: paymentId
            }
        } catch (error) {
            return this.buildError(
                "An error occurred in refundPayment",
                error
              )
        }
      }

    /**
     * Updates the payment status to cancled
     * @returns {object} object with canceled status
     */
    async cancelPayment(
        paymentSessionData: Record<string, unknown>
      ): Promise<Record<string, unknown> | PaymentProcessorError> {
        try {
            if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret ||
                !("payment_id" in paymentSessionData)){
                throw new Error("Unauthorized")
            }
            throw new Error("Method not implemented.")
            const paymentId = paymentSessionData?.payment_id;
            return {
                id: paymentId
              }
        } catch (error) {
            return this.buildError(
                "An error occurred in cancelPayment",
                error
              )
        }
      }

    convertToDecimal(amount: number): number{
      return Math.floor(amount) / 100
    }

    async initiatePayment(
    context: PaymentProcessorContext
    ): Promise<
    PaymentProcessorError | PaymentProcessorSessionResponse
    > {
        try {
            if(!PayherePaymentService.merchantId || !PayherePaymentService.merchantSecret){
                throw new Error("Unauthorized")
            }
            const hash = this.generateHash(context, context.resource_id)

            return {
                session_data: {
                    id: "payhere_"+context.resource_id,
                    hash,
                    amount: this.convertToDecimal(context.amount)
                },
            }
        } catch (error) {
            return this.buildError(
                "An error occurred in initiatePayment",
                error
              )
        }
    }

    protected buildError(
        message: string,
        e: PaymentProcessorError | Error
      ): PaymentProcessorError {
        return {
          error: message,
          code: "code" in e ? e.code : "",
          detail: isPaymentProcessorError(e)
            ? `${e.error}${EOL}${e.detail ?? ""}`
            : "detail" in e
            ? e.detail
            : e.message ?? "",
        }
    }

    generateHash(paymentSession: PaymentSession | PaymentProcessorContext, orderId: String): String{
        const amount = this.convertToDecimal(paymentSession.amount);
        const hashedSecret    = md5(PayherePaymentService.merchantSecret).toString().toUpperCase();
        const amountFormated  = parseFloat( amount.toString() )
                                .toLocaleString( 'en-us', { minimumFractionDigits : 2 } ).replace(',', '');
        const currency        = 'LKR';
        const hash            = md5(PayherePaymentService.merchantId + orderId + amountFormated + currency + hashedSecret)
                                .toString().toUpperCase();
        return hash;
    }

    async validateIncomingHash(sessionId: string, statusCode: string, mdfSig: String){
        const paymentSession = await this.paymentProviderService.retrieveSession(sessionId);
        if(!paymentSession){
            throw new MedusaError(MedusaError.Types.PAYMENT_AUTHORIZATION_ERROR, "Invalid payment request");
        }
        const amountFormated  = parseFloat( paymentSession.data.amount.toString() )
                                .toLocaleString( 'en-us', { minimumFractionDigits : 2 } ).replace(',', '');

        const hashedSecret = (md5(PayherePaymentService.merchantSecret)).toString().toUpperCase();
        const hash = md5(
            PayherePaymentService.merchantId +
            paymentSession.cart_id +
            amountFormated +
            "LKR" +
            statusCode +
            hashedSecret).toString().toUpperCase();

        return hash === mdfSig;
    }
}
export default PayherePaymentService
