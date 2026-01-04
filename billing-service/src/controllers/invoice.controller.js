const BillingService = require('../services/billing.service');
const { checkIdempotency } = require('../utils/idempotency');
const PaymentSimulatorClient = require('../utils/paymentSimulatorClient')

exports.generateInvoice = async (req, res) => {
  try {
    const { subscriptionId, amount, userId } = req.body;
    const idempotencyKey = req.headers['idempotency-key'];

    if (!idempotencyKey) {
      return res.status(400).json({ message: 'Idempotency key required' });
    }

    const existing = await checkIdempotency(idempotencyKey);
    if (existing) {
      return res.status(200).json(existing);
    }

    const invoice = await BillingService.createInvoice({
      userId: userId,
      subscriptionId,
      amount,
      idempotencyKey
    });

    // Call Payment-Simulator Service 
    PaymentSimulatorClient.simulatePayment(
      {
        orderId: invoice.id,
        userId,
        amount: invoice.amount,
        scenario:'failure'
      },
      req.headers.authorization,
    );

    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
