import { RequestHandler } from "express";
import InquiryEndpointDTO from "../../dto/InquiryEndpointDTO.js";
import { instance as subscriptionRepository } from "../../../repository/sqlite/SubscriptionRepository.js";

export const subscriptionExistsHandler: RequestHandler = async (_req, res, _next) => {
    const inquiryEndpointDto: InquiryEndpointDTO = res.locals.dto;

    const subscriptions = (await subscriptionRepository.getMany({
        isDeleted: false,
        endpoint: inquiryEndpointDto.url,
    }))?.filter(sub => sub.scope.uniqueName === inquiryEndpointDto.scope);

    res.status(200).json({ ok: Boolean(subscriptions?.length) });
};
