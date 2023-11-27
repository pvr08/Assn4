const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Invoice = require('./models/invoice');

const app = express();
const port = process.env.PORT || 8000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect(database.url);

// Show all invoice-info
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Show a specific invoice based on the _id or invoiceID
app.get('/api/invoices/:invoice_id', async (req, res) => {
  try {
    const id = req.params.invoice_id;
    const invoice = await Invoice.findOne({ $or: [{ _id: id }, { invoiceID: id }] });
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Insert a new invoice
app.post('/api/invoices', async (req, res) => {
  try {
    const newInvoice = await Invoice.create(req.body);
    res.json(newInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete an existing invoice based on the _id or invoiceID
app.delete('/api/invoices/:invoice_id', async (req, res) => {
  try {
    const id = req.params.invoice_id;
    await Invoice.deleteOne({ $or: [{ _id: id }, { invoiceID: id }] });
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update "Customer type" & "unit price" of an existing invoice
app.put('/api/invoices/:invoice_id', async (req, res) => {
  try {
    const id = req.params.invoice_id;
    const updatedInvoice = await Invoice.findOneAndUpdate(
      { $or: [{ _id: id }, { invoiceID: id }] },
      { customerType: req.body.customerType, unitPrice: req.body.unitPrice },
      { new: true }
    );
    res.json(updatedInvoice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
