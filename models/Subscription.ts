import { Schema, model } from 'mongoose';

const SubscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    stripeCustomerId: { type: String, required: true },
    stripeSubscriptionId: { type: String, required: true },
    subscriptionPlan: { type: String, required: true },
    updatedPlan: String,
    planDetails: {type: Object}
});

export default model('Subscription', SubscriptionSchema);
