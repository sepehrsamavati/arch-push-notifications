import * as dotenv from "dotenv";
dotenv.config();

const config = Object.freeze({
    api: {
        port: parseInt(process.env?.ARCH_WP_API_PORT ?? "5086")
    },
    vapid: {
        subject: process.env?.ARCH_WP_VAPID_SUBJECT ?? "",
        publicKey: process.env?.ARCH_WP_VAPID_PUBLIC_KEY ?? "",
        privateKey: process.env?.ARCH_WP_VAPID_PRIVATE_KEY ?? "",
    }
});

export default config;
