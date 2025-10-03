const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/payments/create-checkout-session
// @desc    Create Stripe checkout session for Pro plan
// @access  Private
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription
    if (user.subscription.plan === 'pro' && user.subscription.isActive) {
      return res.status(400).json({ message: 'User already has an active Pro subscription' });
    }

    let customerId = user.subscription.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID, // Set this in your .env file
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?canceled=true`,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Create checkout session error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// @route   GET /api/payments/subscription-status
// @desc    Get current subscription status
// @access  Private
router.get('/subscription-status', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let subscriptionData = {
      plan: user.subscription.plan,
      isActive: user.subscription.isActive,
      startDate: user.subscription.startDate,
      endDate: user.subscription.endDate,
      limits: user.subscription.limits
    };

    // If user has Stripe subscription, get latest data
    if (user.subscription.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.subscription.stripeSubscriptionId);
        subscriptionData = {
          ...subscriptionData,
          stripeStatus: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        };
      } catch (stripeError) {
        console.error('Error fetching Stripe subscription:', stripeError);
      }
    }

    res.json({
      success: true,
      subscription: subscriptionData
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ message: 'Error fetching subscription status' });
  }
});

// @route   POST /api/payments/cancel-subscription
// @desc    Cancel current subscription
// @access  Private
router.post('/cancel-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel subscription at period end
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    res.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
      cancelAt: new Date(subscription.current_period_end * 1000)
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Error canceling subscription' });
  }
});

// @route   POST /api/payments/reactivate-subscription
// @desc    Reactivate a canceled subscription
// @access  Private
router.post('/reactivate-subscription', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.subscription.stripeSubscriptionId) {
      return res.status(404).json({ message: 'No subscription found' });
    }

    // Reactivate subscription
    const subscription = await stripe.subscriptions.update(
      user.subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    res.json({
      success: true,
      message: 'Subscription reactivated successfully'
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Error reactivating subscription' });
  }
});

// @route   POST /api/payments/create-portal-session
// @desc    Create Stripe customer portal session
// @access  Private
router.post('/create-portal-session', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.subscription.stripeCustomerId) {
      return res.status(404).json({ message: 'No customer found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL}/dashboard/billing`,
    });

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Create portal session error:', error);
    res.status(500).json({ message: 'Error creating portal session' });
  }
});

// Webhook handler functions
async function handleCheckoutSessionCompleted(session) {
  const userId = session.metadata.userId;
  if (!userId) return;

  const user = await User.findById(userId);
  if (!user) return;

  // Update user subscription
  user.subscription.plan = 'pro';
  user.subscription.isActive = true;
  user.subscription.startDate = new Date();
  
  if (session.subscription) {
    user.subscription.stripeSubscriptionId = session.subscription;
  }

  await user.save();
  console.log(`Subscription activated for user ${userId}`);
}

async function handleSubscriptionCreated(subscription) {
  const customerId = subscription.customer;
  
  const user = await User.findOne({ 'subscription.stripeCustomerId': customerId });
  if (!user) return;

  user.subscription.stripeSubscriptionId = subscription.id;
  user.subscription.plan = 'pro';
  user.subscription.isActive = subscription.status === 'active';
  user.subscription.startDate = new Date(subscription.current_period_start * 1000);
  user.subscription.endDate = new Date(subscription.current_period_end * 1000);

  await user.save();
  console.log(`Subscription created for user ${user._id}`);
}

async function handleSubscriptionUpdated(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) return;

  user.subscription.isActive = subscription.status === 'active';
  user.subscription.endDate = new Date(subscription.current_period_end * 1000);

  // If subscription is canceled, downgrade at period end
  if (subscription.cancel_at_period_end) {
    user.subscription.isActive = true; // Keep active until period ends
  }

  await user.save();
  console.log(`Subscription updated for user ${user._id}`);
}

async function handleSubscriptionDeleted(subscription) {
  const user = await User.findOne({ 'subscription.stripeSubscriptionId': subscription.id });
  if (!user) return;

  // Downgrade to free plan
  user.subscription.plan = 'free';
  user.subscription.isActive = true;
  user.subscription.stripeSubscriptionId = '';
  user.subscription.endDate = null;

  await user.save();
  console.log(`Subscription canceled for user ${user._id}`);
}

async function handlePaymentSucceeded(invoice) {
  if (invoice.subscription) {
    const user = await User.findOne({ 'subscription.stripeSubscriptionId': invoice.subscription });
    if (user) {
      user.subscription.isActive = true;
      user.subscription.endDate = new Date(invoice.period_end * 1000);
      await user.save();
      console.log(`Payment succeeded for user ${user._id}`);
    }
  }
}

async function handlePaymentFailed(invoice) {
  if (invoice.subscription) {
    const user = await User.findOne({ 'subscription.stripeSubscriptionId': invoice.subscription });
    if (user) {
      // Don't immediately deactivate - Stripe will retry
      console.log(`Payment failed for user ${user._id}`);
      
      // You might want to send an email notification here
    }
  }
}

module.exports = router;