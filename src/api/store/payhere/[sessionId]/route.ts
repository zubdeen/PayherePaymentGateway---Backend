import {
    MedusaRequest,
    MedusaResponse,
    CartService,
    PaymentSessionStatus
  } from "@medusajs/medusa"
  import { MedusaError } from "@medusajs/utils"
import PayherePaymentService from "src/services/payhere-payment"

  export const POST = async (
    req: MedusaRequest,
    res: MedusaResponse
  ) => {
    const {
        order_id,
        payment_id,
        payhere_amount,
        payhere_currency,
        md5sig,
        status_code } = req.body;

      if (!order_id || !status_code || !payment_id) {
        throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            "Invalid Order"
          )
      }

    const sesssionId = req.params.sessionId
    const payhereService : PayherePaymentService = req.scope.resolve(
        "payherePaymentService"
    )
    const cartService : CartService = req.scope.resolve("cartService")
    try{
      console.log( "payhere authorize request - " +Date.now().toLocaleString())
        if(!payhereService.validateIncomingHash(sesssionId, status_code, md5sig)){
            throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized request");
        }
        let status: PaymentSessionStatus = PaymentSessionStatus.ERROR;
        switch (Number(status_code)) {
          case 2:
            status = PaymentSessionStatus.AUTHORIZED;
            break;
          case 0:
            status = PaymentSessionStatus.PENDING;
            break;
          case -1:
            status = PaymentSessionStatus.CANCELED;
            break;
          case -2:
            status = PaymentSessionStatus.ERROR;
            break;
          case -3:
            status = PaymentSessionStatus.PENDING;
            break;
          default:
            throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized request");
        }
        await cartService.updatePaymentSession(order_id,{
          payment_id,
          status
        })
        console.log("payhere updated payment session")
        res.sendStatus(200);
    }catch(e){
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Server Error")
    }
}
