import * as dotenv from "dotenv";
dotenv.config();

const config = Object.freeze({
    api: {
        port: parseInt(process.env?.ARCH_WP_API_PORT ?? "5086")
    },
});

export default config;
