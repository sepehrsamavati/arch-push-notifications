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

const chequeRouter = Router();

chequeRouter.post('/register', validator(RegisterDTO), registerHandler);
chequeRouter.post('/push', validator(PushNotificationDTO), pushNotificationHandler);
chequeRouter.get('/publicKey', validator(ScopeNameDTO), getPublicKeyHandler);
chequeRouter.get('/subscriptionExistsHandler', validator(InquiryEndpointDTO), subscriptionExistsHandler);

export default chequeRouter;
