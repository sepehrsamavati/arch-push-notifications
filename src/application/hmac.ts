/* eslint-env browser */
import crypto from "node:crypto";

export class HMAC {
	private _ikm;

	constructor(ikm: Buffer) {
		this._ikm = ikm;
	}

	async sign(input: Buffer) {
		const key = await crypto.subtle.importKey('raw', this._ikm,
			{name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
		return crypto.subtle.sign('HMAC', key, input);
	}
}
