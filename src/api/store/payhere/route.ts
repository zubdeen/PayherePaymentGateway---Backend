import type {
    MedusaRequest, 
    MedusaResponse,
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
    try{
        if(!payhereService.validateIncomingHash(sesssionId, status_code, md5sig)){
            throw new MedusaError(MedusaError.Types.UNAUTHORIZED, "Unauthorized request");
        }
        await payhereService.updatePaymentData(sesssionId, {
            payment_id
        })
    }catch(e){
        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, "Server Error")
    }   
}