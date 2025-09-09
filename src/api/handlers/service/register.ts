import { RequestHandler } from "express";
import RegisterDTO from "../../dto/RegisterDTO.js";
import { instance as scopeRepository } from "../../../repository/sqlite/ScopeRepository.js";
import { instance as subscriptionRepository } from "../../../repository/sqlite/SubscriptionRepository.js";

export const registerHandler: RequestHandler = async (_req, res, _next) => {
    const registerDTO: RegisterDTO = res.locals.dto;

    const scope = await scopeRepository.get({
        uniqueName: registerDTO.scope,
    });

    if (!scope)
        return res.status(404).json({ message: "Invalid scope" });

    let scopeUserId: string | null = null;

    try {
        const res = await fetch(scope.getUserIdEndpoint, {
            method: "GET",
            headers: {
                'ClientAccessToken': registerDTO.accessToken,
            }
        });
        if (res.status === 200)
            scopeUserId = await res.text();
    } catch (err) {

    }

    if (!scopeUserId)
        return res.status(401).json({ message: "Authentication failed" });

    res.send(
        await subscriptionRepository.create({
            isDeleted: false,
            scopeId: scope.id,
            scopeUserId: scopeUserId,
            endpoint: registerDTO.endpoint,
            encoding: registerDTO.encoding,
            auth: registerDTO.auth,
            p256dh: registerDTO.p256dh
        })
    );
};
