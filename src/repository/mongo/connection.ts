import mongoose from "mongoose";

mongoose.set('strictQuery', false);

export default class MongoConnection {
	#connection?: typeof mongoose;
    #connectionString: string;

    get connected() {
        return Boolean(this.#connection);
    }

    constructor(connectionUri: string){
        this.#connectionString = connectionUri;
    }

	async open(){
        try {
            this.#connection = await mongoose.connect(this.#connectionString);
            return true;
        } catch(e: any) {
            console.error("MongoDB / Connect, " + e.message);
            return false;
        }
    }

    dispose(): Promise<void> {
        return this.close();
    }

    async close(){
        console.info("Closing MongoDB Connection...");
        let disconnected = false;
        if(this.#connection)
        {
            await this.#connection.disconnect();
            this.#connection = undefined;
            disconnected = true;
        }
        console.info(disconnected ? "✅ MongoDB connection closed." : "❌ MongoDB disconnect failed!");
    }
};
