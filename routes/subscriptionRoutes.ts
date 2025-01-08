import { Router } from 'express';
const router = Router();
import subscription from '../controllers/subscriptionController'
import protect from '../middlewares/authMiddleware';
import checkForSubscription from '../middlewares/subscription';

router.use(protect)

const {subscribe, getSubscriptionDetails, getBillingHistory, updateSubscriptionPlan, cancelSubscription, stripeWebhook} = subscription

router.post('/subscribe', subscribe);
router.get('/subscription-details', checkForSubscription, getSubscriptionDetails);
router.get('/billing-history', checkForSubscription, getBillingHistory);
router.patch('/update-subscription', checkForSubscription, updateSubscriptionPlan);
router.delete('/cancel-subscription', checkForSubscription, cancelSubscription);
router.post('/webhook', checkForSubscription, stripeWebhook);

export default router;
