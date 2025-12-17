const Stripe = require('stripe');
const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

const stripe = process.env.STRIPE_SECRET ? Stripe(process.env.STRIPE_SECRET) : null;

exports.createPaymentIntent = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) return res.status(400).json({ msg: 'Cart empty' });
    let total = 0;
    const items = cart.items.map(i => {
      const price = i.product.priceSale || i.product.price || 0;
      total += price * i.qty;
      return { product: i.product._id, qty: i.qty, price };
    });
    // convert to cents
    const amount = Math.round(total * 100);
    // create local order in pending state with payment.transactionId set to intent id after creation
    // create payment intent
    if (!stripe) {
      // fallback: create order with mock transaction id
      const order = await Order.create({ user: req.user.id, items, total, address: req.body.address || '', payment: { method: 'mock', status: 'pending', transactionId: 'MOCK-' + Date.now() } });
      // clear cart
      await Cart.findOneAndDelete({ user: req.user.id });
      return res.json({ msg: 'Stripe not configured', order });
    }
    const paymentIntent = await stripe.paymentIntents.create({ amount, currency: 'usd', metadata: { userId: req.user.id } });
    // create order storing paymentIntent id as transactionId
    const order = await Order.create({ user: req.user.id, items, total, address: req.body.address || '', payment: { method: 'stripe', status: 'pending', transactionId: paymentIntent.id } });
    // Note: do not decrement stock yet; will decrement on webhook success
    // respond with client secret and order id
    res.json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id, orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// webhook endpoint to listen to stripe events and update orders
exports.webhook = async (req, res) => {
  try {
    if (!stripe) return res.status(400).json({ msg: 'Stripe not configured' });
    const sig = req.headers['stripe-signature'];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
    if (secret) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, secret);
    } else {
      event = req.body; // fallback for testing without signature
    }
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object;
      // find order by transaction id
      const order = await Order.findOne({ 'payment.transactionId': pi.id });
      if (order) {
        // Idempotency check - prevent double processing
        const existingEvent = order.paymentEvents?.find(
          e => e.provider === 'stripe' && e.transactionId === pi.id
        );
        if (existingEvent) {
          console.log('[Stripe Webhook] Duplicate event ignored:', pi.id);
          return res.json({ received: true });
        }

        // Log payment event for idempotency
        order.paymentEvents = order.paymentEvents || [];
        order.paymentEvents.push({
          eventType: 'webhook',
          provider: 'stripe',
          transactionId: pi.id,
          resultCode: 'succeeded',
          receivedAt: new Date(),
          rawData: { paymentIntentId: pi.id, amount: pi.amount, status: pi.status }
        });

        if (!order.stockAdjusted) {
          // decrement stock
          for (const it of order.items) {
            await Product.findByIdAndUpdate(it.product, { $inc: { stock: -it.qty } });
          }
          order.stockAdjusted = true;
          console.log('[Stripe Webhook] Stock adjusted for order:', order._id);
        }
        order.payment.status = 'paid';
        order.payment.paidAt = new Date();
        order.status = 'paid';
        await order.save();
        console.log('[Stripe Webhook] Order updated successfully:', order._id);
        // clear cart of user as safety
        await Cart.findOneAndDelete({ user: order.user });
      }
    }
    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
