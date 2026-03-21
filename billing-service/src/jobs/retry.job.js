const BillingService = require('../services/billing.service');

async function retryFailedPayments() {
  const invoices = await BillingService.fetchFailedInvoices();

  for (const invoice of invoices) {
    try {
      // simulate retry
      console.log('Retrying invoice:', invoice.id);

      await BillingService.updateStatus(invoice.id, 'PAID');
    } catch (err) {
      await BillingService.incrementRetry(invoice.id);
    }
  }
}

// run every 1 minute
setInterval(retryFailedPayments, 60000);

module.exports = retryFailedPayments;
