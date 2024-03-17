// const { AbstractPaymentProcessor, PaymentProviderService, PaymentProcessorContext, PaymentProcessorSessionResponse, PaymentSessionStatus } = require("@medusajs/medusa");
// const { Client } = require("@payhere/payhere-mobilesdk-reactnative");

// class PayherePaymentProcessor extends AbstractPaymentProcessor {
//     protected paymentProviderService;
//     client;

//     static identifier = "payhere";
//     static supportedCurrencies = ["LKR"];
//     static transactionFees = {
//         LKR: 0,
//     };

//     constructor(container, options) {
//       super(container);
//       this.client = new Client(options);
//       this.paymentProviderService = container.paymentProviderService;
//     }

//     // Implement the required methods for the custom payment processor
//     // ...
//   }
