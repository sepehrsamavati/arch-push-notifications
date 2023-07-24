import { RequestHandler } from "express";
import RegisterDTO from "../../dto/RegisterDTO.js";
import userRepository from "../../../repository/mongo/fakeRepo.js";

export const registerHandler: RequestHandler = async (req, res, next) => {
    const registerDTO: RegisterDTO = res.locals.dto;

    res.send(
        userRepository.add({
            id: registerDTO.userId,
            endpoint: registerDTO.endpoint,
            encoding: registerDTO.encoding,
            auth: registerDTO.auth,
            p256dh: registerDTO.p256dh
        })
    );
};
