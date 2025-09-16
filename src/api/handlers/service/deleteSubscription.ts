import { RequestHandler } from "express";
import InquiryEndpointDTO from "../../dto/InquiryEndpointDTO.js";
import { instance as subscriptionRepository } from "../../../repository/sqlite/SubscriptionRepository.js";

export const deleteSubscriptionHandler: RequestHandler = async (_req, res, _next) => {
    const inquiryEndpointDto: InquiryEndpointDTO = res.locals.dto;

    const subscriptions = await subscriptionRepository.getMany({
        isDeleted: false,
        endpoint: inquiryEndpointDto.url,
    });

    if (subscriptions?.length !== 1 || subscriptions[0].scope.uniqueName !== inquiryEndpointDto.scope)
        return res.status(404).json({ message: "Subscription not found" });

    const deleted = await subscriptionRepository.update(subscriptions[0].id, {
        isDeleted: true,
    });

    res.status(200).json({ ok: deleted });
};
