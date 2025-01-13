import { Router } from 'express';
const router = Router();
import protect from '../middlewares/authMiddleware';
import checkForSubscription from '../middlewares/subscription';
import { cancelSubscription } from '../controllers/authController';
import { subscribe, getSubscriptionDetails, getBillingHistory, updateSubscriptionPlan, stripeWebhook } from '../controllers/subscriptionController';

router.use(protect)

router.post('/subscribe', subscribe);
router.get('/subscription-details', checkForSubscription, getSubscriptionDetails);
router.get('/billing-history', checkForSubscription, getBillingHistory);
router.patch('/update-subscription', checkForSubscription, updateSubscriptionPlan);
router.delete('/cancel-subscription', checkForSubscription, cancelSubscription);
router.post('/webhook', checkForSubscription, stripeWebhook);

export default router;
