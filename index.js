const express = require('express');
const mongoose = require('mongoose');
const app = express();
const database = require('./config/database');
const bodyParser = require('body-parser');
const path = require('path');

const exphbs = require('express-handlebars');
const hbs = exphbs.create({ extname: '.hbs' });


app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

mongoose.connect(database.url);

var Sales = require('./models/sales');

// Render all invoices using Handlebars
app.get('/api/invoices', async (req, res) => {
    try {
      const allInvoices = await Sales.find().lean();
      res.render('invoices',{allInvoices} );
      //console.log(allInvoices); 
    } catch (err) {
      res.status(500).send('failed to retrieve data');
    }
  });
  

// Render a specific invoice by ID 
app.get('/api/invoices/:invoice_id', async (req, res) => {
    try {
      const invoiceId = req.params.invoice_id;
      const invoice = await Sales.findOne({ "Invoice ID": invoiceId }).lean();
      res.render('invoiceDetails', { invoice });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to retrieve invoice details');
    }
  });


  
  //to insert new record to the database
  app.get('/api/sales/new', (req, res) => {
    //console.log('Reached /api/sales/new route');
    res.render('new'); 
});


app.post('/api/sales/new', async (req, res) => {
    try {
        
        const {
            invoiceId,
            branch,
            city,
            customerType,
            productLine,
            name,
            image,
            unitPrice,
            quantity,
            tax,
            total,
            date,
            time,
            payment,
            cogs,
            grossIncome,
            rating
        } = req.body;

        // Validate required fields
        if (!invoiceId || !branch || !name || !unitPrice || !quantity || !tax || !total || !date || !time || !payment || !cogs || !grossIncome || !rating) {
            return res.status(400).send('All fields are required');
            
        }

        
        const newSale = new Sales({
            "Invoice ID": invoiceId,
            "Branch": branch,
            "City": city,
            "Customer type": customerType,
            "Product line": productLine,
            "name": name,
            "image": image,
            "Unit price": unitPrice,
            "Quantity": quantity,
            "Tax 5%": tax,
            "Total": total,
            "Date": date,
            "Time": time,
            "Payment": payment,
            "cogs": cogs,
            "gross income": grossIncome,
            "Rating": rating
        });

        // Save the new invoice to the database
        await newSale.save();

        res.redirect('/api/invoices'); 
    } catch (err) {
        console.error(err); 
        res.status(500).send('Error adding a new invoice');
    }
});


// Delete an existing invoice by ID

app.delete('/api/invoices/:invoice_id', async (req, res) => {
    try {
      const invoiceId = req.params.invoice_id;
      const deletedInvoice = await Sales.deleteOne({ "Invoice ID": invoiceId }).lean();
  
      if (deletedInvoice.deletedCount === 0) {
        
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      res.json({ message: 'deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to delete ');
    }
  });
  


// Update "Customer type" & "unit price" of an existing invoice by ID
app.put('/api/invoices/:invoice_id', async (req, res) => {
    try {
      const invoiceId = req.params.invoice_id;
  
      const updatedInvoice = await Sales.findOneAndUpdate(
        { "Invoice ID": invoiceId },
        {
          $set: {
            "Customer type": req.body["Customer type"],
            "Unit price": req.body["Unit price"],
          },
        },
        { new: true }
      ).lean();
  
      if (!updatedInvoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }
  
      res.send('Invoice updated successfully');
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
  



app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
