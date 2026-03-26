const axios = require("axios")
const Transaction = require("../models/transaction")
const User = require("../models/user")

//  HELPER: Get Interswitch Access Token
const getAccessToken = async () => {
  // Base64 encode clientId:secretKey
  const credentials = Buffer.from(
    `${process.env.INTERSWITCH_CLIENT_ID}:${process.env.INTERSWITCH_SECRET_KEY}`
  ).toString("base64")

  const response = await axios.post(
    process.env.INTERSWITCH_AUTH_URL,
    "grant_type=client_credentials",
    {
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }
  )

  return response.data.access_token
}

// HELPER: Generate Unique Transaction Reference 
const generateTxnRef = () => {
  return `splitsafe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// INITIATE PAYMENT 
exports.initiatePayment = async (req, res) => {
  try {
    const { transactionId } = req.body
    //transactionId = the Transaction document _id created when settlement was confirmed

    if (!transactionId) {
      return res.status(400).json({ message: "transactionId is required" })
    }

    // Find the pending transaction
    const transaction = await Transaction.findById(transactionId)
      .populate("from", "name email")
      .populate("to", "name email")

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Only the debtor can initiate payment
    if (transaction.from._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        message: "Only the person who owes can initiate payment" 
      })
    }

    if (transaction.status === "paid") {
      return res.status(400).json({ message: "Transaction already paid" })
    }

    // Generate unique reference for this payment
    const txnRef = generateTxnRef()

    // Save reference to transaction for verification later
    transaction.interswitchReference = txnRef
    await transaction.save()

    // Amount in kobo (minor units)
    // ₦26,000 → 2,600,000
    const amountInKobo = transaction.amount * 100

    // Return checkout parameters to frontend to open Interswitch checkout
    const checkoutParams = {
      merchant_code: process.env.INTERSWITCH_MERCHANT_CODE,
      pay_item_id: process.env.INTERSWITCH_PAY_ITEM_ID,
      txn_ref: txnRef,
      amount: amountInKobo,
      currency: process.env.INTERSWITCH_CURRENCY,  // 566 = NGN
      cust_email: transaction.from.email,
      cust_name: transaction.from.name,
      site_redirect_url: process.env.INTERSWITCH_REDIRECT_URL,
      pay_item_name: `SplitSafe Payment to ${transaction.to.name}`,
      // Inline checkout specific
      mode: "TEST",
      // Which Interswitch URL to use
      checkout_url: process.env.INTERSWITCH_WEB_REDIRECT_URL
    }

    res.status(200).json({
      message: "Payment initiated",
      txnRef,
      checkoutParams,
      transactionId: transaction._id
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// VERIFY PAYMENT 
// Called after Interswitch redirects back to the app
// This is the SOURCE OF TRUTH — not the redirect params
exports.verifyPayment = async (req, res) => {
  try {
    const { txnRef } = req.params

    // Find transaction by our stored reference
    const transaction = await Transaction.findOne({ 
      interswitchReference: txnRef 
    })

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" })
    }

    // Get access token for Interswitch API
    const accessToken = await getAccessToken()

    // Amount in kobo for verification
    const amountInKobo = transaction.amount * 100

    // Requery Interswitch for real payment status
    // This is the authoritative source — never trust redirect params
    const verifyResponse = await axios.get(
      `${process.env.INTERSWITCH_REQUERY_BASE_URL}/collections/api/v1/gettransaction.json`,
      {
        params: {
          merchantcode: process.env.INTERSWITCH_MERCHANT_CODE,
          transactionreference: txnRef,
          amount: amountInKobo
        },
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      }
    )

    const paymentData = verifyResponse.data

    // ResponseCode "00" = success
    if (paymentData.ResponseCode === "00") {

      // Double check amount matches
      // Prevents someone paying ₦1 to settle ₦26,000
      if (Number(paymentData.Amount) !== amountInKobo) {
        return res.status(400).json({ 
          message: "Amount mismatch — payment verification failed" 
        })
      }

      // Mark transaction as paid! ✅
      transaction.status = "paid"
      transaction.paidAt = new Date()
      await transaction.save()

      return res.status(200).json({
        message: "Payment verified successfully! ✅",
        status: "paid",
        amount: transaction.amount,
        paidAt: transaction.paidAt,
        reference: txnRef
      })

    } else {
      // Payment failed or pending
      return res.status(400).json({
        message: "Payment not successful",
        responseCode: paymentData.ResponseCode,
        responseDescription: paymentData.ResponseDescription
      })
    }

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}

// WEBHOOK HANDLER 
// Interswitch calls this automatically after payment
// Register this URL in Quickteller Business dashboard
exports.handleWebhook = async (req, res) => {
  try {
    const { event, data } = req.body

    console.log("Interswitch webhook received:", event)

    // Only process completed transactions
    if (event === "TRANSACTION.COMPLETED") {
      const { merchantReference, responseCode, amount } = data

      if (responseCode === "00") {
        // Find and update transaction
        const transaction = await Transaction.findOne({ 
          interswitchReference: merchantReference 
        })

        if (transaction && transaction.status !== "paid") {
          transaction.status = "paid"
          transaction.paidAt = new Date()
          await transaction.save()
          console.log(`Transaction ${merchantReference} marked as paid ✅`)
        }
      }
    }

    // Always return 200 to Interswitch
    // Otherwise they'll keep retrying the webhook
    res.status(200).json({ received: true })

  } catch (error) {
    console.error("Webhook error:", error)
    res.status(200).json({ received: true }) 
  }
}

// GET PAYMENT HISTORY 
exports.getPaymentHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      $or: [
        { from: req.user.id },   // payments you made
        { to: req.user.id }      // payments you received
      ]
    })
      .populate("from", "name email")
      .populate("to", "name email")
      .populate("group", "name")
      .sort({ createdAt: -1 })

    res.status(200).json({
      count: transactions.length,
      transactions
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
}