const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'STRIPE_SECRET_KEY_REMOVED');

module.exports = stripe;
