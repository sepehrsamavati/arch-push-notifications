import webpush from "web-push";
import { randomUUID } from "node:crypto";
import { RequestHandler } from "express";
import { PushStatus } from "../../../types/enums.js";
import type { IPush } from "../../../types/entities/push.js";
import PushNotificationDTO from "../../dto/PushNotificationDTO.js";
import { instance as pushRepository } from "../../../repository/sqlite/PushRepository.js";
import { instance as scopeRepository } from "../../../repository/sqlite/ScopeRepository.js";
import { instance as subscriptionRepository } from "../../../repository/sqlite/SubscriptionRepository.js";

class SubscriptionPushResult {
    ok = false;
    message?: string;
    sendResult?: webpush.SendResult;

    succeeded(sendResult: webpush.SendResult) {
        this.ok = true;
        if (sendResult)
            this.sendResult = sendResult;
        return this;
    }

    failed(message?: string, sendResult?: webpush.SendResult) {
        this.ok = false;
        if (message)
            this.message = message;
        if (sendResult)
            this.sendResult = {
                statusCode: sendResult.statusCode,
                body: sendResult.body,
                headers: sendResult.headers,
            };
        return this;
    }
}

export const pushNotificationHandler: RequestHandler = async (_req, res, _next) => {
    const pushNotificationDto: PushNotificationDTO = res.locals.dto;

    const scope = await scopeRepository.get({ accessToken: pushNotificationDto.key });

    if (!scope)
        return res.status(401).json({ message: "Invalid key" });

    const subscriptions = await subscriptionRepository.getMany({
        scopeId: scope.id,
        scopeUserId: pushNotificationDto.userId,
    });

    if (!subscriptions) return res.status(404).json({ message: "No subscriptions found" });

    const results: SubscriptionPushResult[] = [];

    const _pushBaseInfo = {
        content: JSON.stringify(pushNotificationDto),
        date: new Date(),
        isDeleted: false,
        status: PushStatus.Pending,
    } satisfies Partial<IPush>;

    const pushes = await Promise.all(
        subscriptions
            .map(async subscription => {
                return {
                    subscription: subscription,
                    pushId: await pushRepository.create({
                        ..._pushBaseInfo,
                        subscriptionId: subscription.id,
                    }),
                };
            })
    );

    const webPushRequests: Promise<void>[] = [];

    for (const push of pushes) {
        if (push.pushId === null) continue;
        const { pushId, subscription } = push;
        webPushRequests.push(
            new Promise(resolve => {
                let result = new SubscriptionPushResult();
                webpush.sendNotification({
                    endpoint: subscription.endpoint,
                    keys: {
                        auth: subscription.auth,
                        p256dh: subscription.p256dh
                    },
                }, JSON.stringify({
                    title: pushNotificationDto.title,
                    body: pushNotificationDto.bodyText,
                    url: pushNotificationDto.url
                }), {
                    vapidDetails: {
                        subject: scope.subject,
                        publicKey: scope.publicKey,
                        privateKey: scope.privateKey,
                    }
                })
                    .then(webPushResult => {
                        result.succeeded(webPushResult);
                    })
                    .catch(error => {
                        const errorId = randomUUID();
                        console.log(`Web Push Error; ID: ${errorId}, `, subscription, error);
                        result.failed(`Error ID: ${errorId}`, error instanceof webpush.WebPushError ? error : undefined);

                        if(error instanceof webpush.WebPushError) {
                            if(error.statusCode === 410)
                                subscriptionRepository.update(subscription.id, { isDeleted: true });
                        }
                    })
                    .finally(() => {

                        results.push(result);

                        pushRepository.update(pushId, {
                            status: result.ok ? PushStatus.OK : PushStatus.Failed,
                        });

                        resolve();
                    });
            })
        );
    }

    await Promise.all(webPushRequests);

    res.json(results);
};
