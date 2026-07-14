const express = require('express');
const axios = require('axios');
const { requireAuth } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Initialize a Paystack transaction
router.post('/initialize', requireAuth, async (req, res) => {
  try {
    const { email, id } = req.user;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email,
        amount: 500 * 100, // $5 or NGN 500 depending on Paystack currency setup. Multiply by 100 for kobo/cents.
        metadata: {
          user_id: id,
          purpose: 'subscription'
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.status) {
      res.json({
        authorization_url: response.data.data.authorization_url,
        reference: response.data.data.reference
      });
    } else {
      res.status(400).json({ error: 'Failed to initialize Paystack transaction' });
    }
  } catch (error) {
    console.error('Paystack init error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Internal server error initializing payment' });
  }
});

// Paystack Webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(req.rawBody || JSON.stringify(req.body))
      .digest('hex');

    if (hash == req.headers['x-paystack-signature']) {
      const event = req.body;

      if (event.event === 'charge.success') {
        const userId = event.data.metadata.user_id;
        
        const { supabase } = require('../middleware/auth');
        
        const { error } = await supabase
          .from('profiles')
          .update({ subscription_status: 'active' })
          .eq('id', userId);

        if (error) {
          console.error('Failed to update subscription status:', error);
        }
      }
    }
    
    res.sendStatus(200);
  } catch (error) {
    console.error('Webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;
