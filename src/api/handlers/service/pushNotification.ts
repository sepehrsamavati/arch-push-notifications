import webpush from "web-push";
import config from "../../../config.js";
import { RequestHandler } from "express";
import PushNotificationDTO from "../../dto/PushNotificationDTO.js";
import userRepository from "../../../repository/mongo/fakeRepo.js";

export const pushNotificationHandler: RequestHandler = async (req, res, next) => {
    const pushNotificationDTO: PushNotificationDTO = res.locals.dto;

    const subscription = userRepository.find(pushNotificationDTO.userId);

    if (!subscription) return res.status(404).send("User not found");

    webpush.setVapidDetails(
        config.vapid.subject,
        config.vapid.publicKey,
        config.vapid.privateKey
    );

    webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh
        }
    }, JSON.stringify({
        title: pushNotificationDTO.title,
        body: pushNotificationDTO.bodyText,
        url: pushNotificationDTO.url
    }))
        .then(result => {
            res.json(result);
        })
        .catch(err => {
            console.log("Web Push Error, ", err);
            let errorResult = err.body || { message: "Error" };
            try {
                errorResult = JSON.parse(err.body);
            } catch {}
            res.status(err.statusCode || 500).json(errorResult);
        });

};
