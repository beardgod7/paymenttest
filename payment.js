const express = require('express');
//const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Environment Variables
const PORT = process.env.PORT || 3000;
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;


// Initialize Payment
app.post('/initialize', async (req, res) => {
    const { email, amount } = req.body;
    const url = 'https://api.paystack.co/transaction/initialize';

    try {
        const response = await axios.post(
            url,
            { email, amount: amount * 100 },
            {
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
                },
            }
        );
        res.status(200).json({ data: response.data });
    } catch (error) {
        res.status(400).json({ message: 'Payment initialization failed', error: error.response.data });
    }
});

// Verify Payment
app.get('/verify/:reference', async (req, res) => {
    const { reference } = req.params;
    const url = `https://api.paystack.co/transaction/verify/${reference}`;

    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            },
        });
        res.status(200).json({ data: response.data });
    } catch (error) {
        res.status(400).json({ message: 'Payment verification failed', error: error.response.data });
    }
});

// Webhook Handler
app.post('/webhook', (req, res) => {

     //validate event
     const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
     console.log("x-payyyyyyyyyyyyyyyyyy",req.headers['x-paystack-signature'])
     console.log("hereeeeeeeeeeeeeeeeeeeeeee",hash)

     if (hash == req.headers['x-paystack-signature']) {
        console.log("x-payyyyyyyyyyyyyyyyyy",req.headers['x-paystack-signature'])
        console.log("hereeeeeeeeeeeeeeeeeeeeeee",hash)
     // Retrieve the request's body
     const event = req.body;
     console.log(event)
     console.log(`Webhook received: ${JSON.stringify(event)}`);
     // Do something with event  
     }
     res.sendStatus(200);
});

// Landing Page Route
app.get('/', (req, res) => {
    res.send('Hello, I\'m working!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
