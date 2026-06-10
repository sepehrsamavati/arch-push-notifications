import { Router } from "express";
import RegisterDTO from "../dto/RegisterDTO.js";
import ScopeNameDTO from "../dto/ScopeNameDTO.js";
import { validator } from "../middlewares/dtoValidator.js";
import InquiryEndpointDTO from "../dto/InquiryEndpointDTO.js";
import PushNotificationDTO from "../dto/PushNotificationDTO.js";
import { registerHandler } from "../handlers/service/register.js";
import { getPublicKeyHandler } from "../handlers/service/getPublicKey.js";
import { pushNotificationHandler } from "../handlers/service/pushNotification.js";
import { subscriptionExistsHandler } from "../handlers/service/subscriptionExists.js";
import { deleteSubscriptionHandler } from "../handlers/service/deleteSubscription.js";

const serviceRouter = Router();

serviceRouter.post('/register', validator(RegisterDTO), registerHandler);
serviceRouter.post('/push', validator(PushNotificationDTO), pushNotificationHandler);
serviceRouter.get('/publicKey', validator(ScopeNameDTO), getPublicKeyHandler);
serviceRouter.get('/subscriptionExists', validator(InquiryEndpointDTO), subscriptionExistsHandler);
serviceRouter.delete('/subscription', validator(InquiryEndpointDTO), deleteSubscriptionHandler);

export default serviceRouter;
