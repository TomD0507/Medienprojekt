

import { Router } from 'express';

import { subscribe, pushNotification } from '../controllers/subscriptionController';


const router = Router();


router.post('/subscribe', subscribe);

router.post('/push', pushNotification);


export default router;


