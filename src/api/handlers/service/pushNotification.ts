import webpush from "web-push";
import { RequestHandler } from "express";
import PushNotificationDTO from "../../dto/PushNotificationDTO.js";
import { instance as scopeRepository } from "../../../repository/sqlite/ScopeRepository.js";
import { instance as subscriptionRepository } from "../../../repository/sqlite/SubscriptionRepository.js";

export const pushNotificationHandler: RequestHandler = async (_req, res, _next) => {
    const pushNotificationDTO: PushNotificationDTO = res.locals.dto;

    const scope = await scopeRepository.get({ accessToken: pushNotificationDTO.key });

    if (!scope)
        return res.status(401).json({ message: "Invalid key" });

    const subscriptions = await subscriptionRepository.getMany({
        scopeId: scope.id,
        scopeUserId: pushNotificationDTO.userId,
    });

    if (!subscriptions) return res.status(404).json({ message: "No subscriptions found" });

    const results: unknown[] = [];

    await Promise.all(
        subscriptions
            .map(subscription => new Promise(resolve => {
                webpush.sendNotification({
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh
                    },
                }, JSON.stringify({
                    title: pushNotificationDTO.title,
                    body: pushNotificationDTO.bodyText,
                    url: pushNotificationDTO.url
                }), {
                    vapidDetails: {
                        subject: scope.subject,
                        publicKey: scope.publicKey,
                        privateKey: scope.privateKey,
                    }
                })
                    .then(result => results.push(result))
                    .catch(error => {
                        console.log("Web Push Error, ", error);
                        let errorResult = typeof error === "object" && error && 'body' in error ? error.body : { message: "Error" };
                        try {
                            errorResult = JSON.parse(error.body);
                        } catch { }
                        results.push(errorResult);
                    })
                    .finally(() => resolve(null));
            }))
    );

    res.json(results);
};
