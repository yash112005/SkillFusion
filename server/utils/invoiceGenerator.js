const Invoice = require('../models/Invoice');

const generateInvoice = async (payment) => {
  try {
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[1]);
      nextNumber = lastNumber + 1;
    }

    const invoiceNumber = `INV-${String(nextNumber).padStart(5, '0')}`;

    const invoice = await Invoice.create({
      userId: payment.userId,
      paymentId: payment._id,
      invoiceNumber,
      amount: payment.amount,
      currency: payment.currency,
      date: new Date(),
      status: 'paid'
    });

    return invoice;
  } catch (error) {
    console.error('Invoice Generation Error:', error);
    return null;
  }
};

module.exports = { generateInvoice };
