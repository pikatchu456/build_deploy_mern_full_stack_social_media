import express from 'express';
import { Webhook } from 'svix';
import { inngest } from '../inngest/index.js';

const webhookRouter = express.Router();

webhookRouter.post('/clerk', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        console.log('🔔 Webhook received from Clerk');
        
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            console.error('⚠️ CLERK_WEBHOOK_SECRET is not set');
            if (process.env.NODE_ENV === 'production') {
                return res.status(500).json({ error: 'Webhook secret not configured' });
            }
        }

        const svix_id = req.headers['svix-id'];
        const svix_timestamp = req.headers['svix-timestamp'];
        const svix_signature = req.headers['svix-signature'];

        console.log('📋 Webhook headers:', {
            svix_id: svix_id ? '✅' : '❌',
            svix_timestamp: svix_timestamp ? '✅' : '❌',
            svix_signature: svix_signature ? '✅' : '❌'
        });

        const payload = req.body;
        const body = payload.toString();

        let evt;

        // Vérifier le webhook avec Svix
        if (WEBHOOK_SECRET && svix_id && svix_timestamp && svix_signature) {
            try {
                const wh = new Webhook(WEBHOOK_SECRET);
                evt = wh.verify(body, {
                    'svix-id': svix_id,
                    'svix-timestamp': svix_timestamp,
                    'svix-signature': svix_signature,
                });
                console.log('✅ Webhook signature verified');
            } catch (err) {
                console.error('❌ Webhook verification failed:', err.message);
                return res.status(400).json({ error: 'Webhook verification failed' });
            }
        } else {
            console.warn('⚠️ Webhook verification skipped (development mode)');
            evt = JSON.parse(body);
        }

        const { type, data } = evt;

        console.log('📥 Webhook type:', type);
        console.log('📄 Webhook data:', JSON.stringify(data, null, 2));

        // IMPORTANT: Envoyer les événements à Inngest au lieu de gérer directement
        // Inngest s'occupera de la création/mise à jour/suppression
        
        if (type === 'user.created') {
            console.log('👤 Sending user.created event to Inngest');
            await inngest.send({
                name: 'clerk/user.created',
                data: data
            });
            return res.status(200).json({ success: true, message: 'Event sent to Inngest' });
        }

        if (type === 'user.updated') {
            console.log('🔄 Sending user.updated event to Inngest');
            await inngest.send({
                name: 'clerk/user.updated',
                data: data
            });
            return res.status(200).json({ success: true, message: 'Event sent to Inngest' });
        }

        if (type === 'user.deleted') {
            console.log('🗑️ Sending user.deleted event to Inngest');
            await inngest.send({
                name: 'clerk/user.deleted',
                data: data
            });
            return res.status(200).json({ success: true, message: 'Event sent to Inngest' });
        }

        // Événement non géré
        console.log('ℹ️ Unhandled event type:', type);
        return res.status(200).json({ success: true, message: 'Event received but not handled' });

    } catch (error) {
        console.error('❌ Webhook error:', error);
        console.error('Stack:', error.stack);
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default webhookRouter;