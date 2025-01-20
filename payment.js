const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());

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
    const hash = crypto
        .createHmac('sha512', "sk_test_68adfa77e69be650635fa320a35025a9dfb56048")
        .update(JSON.stringify(req.body))
        .digest('hex');
    console.log(hash)

    if (hash !== req.headers['x-paystack-signature']) {
        return res.status(401).json({ message: 'Invalid Webhook Signature' });
    }

    const event = req.body;
    console.log(`Webhook received: ${JSON.stringify(event)}`);

    // Process the webhook event
    if (event.event === 'charge.success') {
        console.log('Payment successful:', event.data.reference);
    }

    res.status(200).json({ status: 'success' });
});

// Landing Page Route
app.get('/', (req, res) => {
    res.send('Hello, I\'m working!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
