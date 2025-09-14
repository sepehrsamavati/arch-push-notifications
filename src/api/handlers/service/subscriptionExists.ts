import { RequestHandler } from "express";
import InquiryEndpointDTO from "../../dto/InquiryEndpointDTO.js";
import { instance as scopeRepository } from "../../../repository/sqlite/ScopeRepository.js";
import { instance as subscriptionRepository } from "../../../repository/sqlite/SubscriptionRepository.js";

export const subscriptionExistsHandler: RequestHandler = async (_req, res, _next) => {
    const inquiryEndpointDto: InquiryEndpointDTO = res.locals.dto;

    const scope = await scopeRepository.get({
        isDeleted: false,
        uniqueName: inquiryEndpointDto.scope,
    });

    if (!scope)
        return res.status(404).json({ message: "Invalid scope" });

    const subscriptions = await subscriptionRepository.getMany({
        isDeleted: false,
        endpoint: inquiryEndpointDto.url,
    });

    res.status(200).json({ ok: Boolean(subscriptions?.length) });
};
