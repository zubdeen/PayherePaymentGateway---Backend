// const generateHash = (
//     merchant_id,
//     order_id,
//     amount,
//     currency,
//     merchant_secret
//   ) => {
//     const md5 = require("crypto-js/md5");
//     let hashedSecret = md5(merchant_secret).toString().toUpperCase();
//     let amountFormated = parseFloat(amount).toLocaleString("en-us", {
//       minimumFractionDigits: 2,
//     }).replaceAll(",", "");
//     return md5(
//       merchant_id +
//         order_id +
//         amountFormated +
//         currency +
//         hashedSecret
//     ).toString()
//       .toUpperCase();
//   };
