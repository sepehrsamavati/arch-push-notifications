import { RequestHandler } from "express";
import PushNotificationDTO from "../../dto/PushNotificationDTO.js";
import userRepository from "../../../repository/mongo/fakeRepo.js";
import { VapidHelper2 } from "../../../application/VapidHelper.js";
import { APPLICATION_KEYS } from "../../../application/constants.js";
import { EncryptionAES128GCM } from "../../../application/encryption-aes-128-gcm.js";

import https from "node:https";

const encFactory = new EncryptionAES128GCM({
    serverKeys: APPLICATION_KEYS
});

export const pushNotificationHandler: RequestHandler = async (req, res, next) => {
    const pushNotificationDTO: PushNotificationDTO = res.locals.dto;

    const subscription = userRepository.find(pushNotificationDTO.userId);

    if (!subscription) return res.status(404).send("User not found");

    const body = pushNotificationDTO.bodyText;

    const vapid = await VapidHelper2.createVapidAuthHeader(APPLICATION_KEYS, subscription.endpoint, 'mailto:simple-push-demo@gauntface.co.uk');

    const requestDetails = await encFactory.getRequestDetails(subscription, body);

    // fetch(requestDetails.endpoint, {
    //     method: 'POST',
    //     headers: requestDetails.headers,
    //     body: JSON.stringify(requestDetails.body)
    // });

    const requestData = requestDetails;
    const url = requestData.endpoint;
    const options = {
        headers: requestData.headers,
        // headers: {
        //     "Authorization":	"vapid t=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJodHRwczovL3VwZGF0ZXMucHVzaC5zZXJ2aWNlcy5tb3ppbGxhLmNvbSIsImV4cCI6MTY5MDI0NTU1NCwic3ViIjoibWFpbHRvOnNpbXBsZS1wdXNoLWRlbW9AZ2F1bnRmYWNlLmNvLnVrIn0.jsM0RfL4z43LShVMBxLns8brmJBWOlmj-qNYAw_WUgcJGlqszU-dwPQj2C73Oe-EPiOzIARw3NGrRf3Tk9rInw, k=BDd3_hVL9fZi9Ybo2UUzA284WG5FZR30_95YeZJsiApwXKpNcF1rRPF3foIiBHXRdJI2Qhumhf6_LFTeZaNndIo",
        //     "Content-Encoding":	"aes128gcm",
        //     TTL:	60
        // },
        method: 'POST',
    };

    const pushRequest = https.request(url, options, function (pushResponse) {
        let responseText = '';

        pushResponse.on('data', function (chunk) {
            responseText += chunk;
        });

        pushResponse.on('end', function () {
            res.status(pushResponse.statusCode ?? 500);
            res.send(responseText);
            if (pushResponse.statusCode &&
                (pushResponse.statusCode < 200 || pushResponse.statusCode > 299)) {
                console.log(`Error: ${responseText}`);
            }
        });
    });

    pushRequest.on('error', function (e) {
        console.log(`Error: ${e}`);
        res.status(500);
        res.send(e);
    });

    if (requestData.body) {
        pushRequest.write(Buffer.from(requestData.body));
    }

    pushRequest.end();

};
