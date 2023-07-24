export enum ContentEncoding {
    AESGCM = "aesgcm",
    AES128GCM = "aes128gcm"
};

export type UserSubscription = {
    id: string;

    endpoint: string;
    encoding: ContentEncoding;
    auth: string;
    p256dh: string;
};

class FakeRepository {
    #subscriptions: UserSubscription[] = [];

    add(user: UserSubscription) {
        if(this.#subscriptions.some(s => s.id === user.id)) return false;
        else {
            this.#subscriptions.push(user);
            return true;
        }
    }

    find(userOrId: UserSubscription | UserSubscription['id']) {
        const userId = typeof userOrId === "object" ? userOrId.id : userOrId;
        return this.#subscriptions.find(s => s.id === userId);
    }
}

const userRepository = new FakeRepository();

export default userRepository;
