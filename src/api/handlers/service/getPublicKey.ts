import config from "../../../config.js";
import { RequestHandler } from "express";

export const getPublicKeyHandler: RequestHandler = async (req, res, next) => {
    res.send(config.vapid.publicKey);
};
