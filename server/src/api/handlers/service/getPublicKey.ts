import { RequestHandler } from "express";
import type ScopeNameDTO from "../../dto/ScopeNameDTO.js";
import { instance as scopeRepository } from "../../../repository/sqlite/ScopeRepository.js";

export const getPublicKeyHandler: RequestHandler = async (_req, res, _next) => {
    const scopeNameDTO: ScopeNameDTO = res.locals.dto;

    const scope = await scopeRepository.get({ uniqueName: scopeNameDTO.scope });

    if (!scope)
        return res.status(404).json({ message: "Scope not found" });

    res.send(scope.publicKey);
};
