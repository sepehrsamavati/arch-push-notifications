import { Router } from "express";
import RegisterDTO from "../dto/RegisterDTO.js";
import { validator } from "../middlewares/dtoValidator.js";
import PushNotificationDTO from "../dto/PushNotificationDTO.js";
import { registerHandler } from "../handlers/service/register.js";
import { pushNotificationHandler } from "../handlers/service/pushNotification.js";

const chequeRouter = Router();

chequeRouter.post('/register', validator(RegisterDTO), registerHandler);
chequeRouter.post('/push', validator(PushNotificationDTO), pushNotificationHandler);

export default chequeRouter;
