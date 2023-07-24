/* eslint-env browser */

'use strict';

import {HMAC} from './hmac.js';

export class HKDF {
	private _ikm;
	private _salt;
	private _hmac;

	constructor(ikm: Buffer, salt: Buffer) {
		this._ikm = ikm;
		this._salt = salt;

		this._hmac = new HMAC(salt);
	}

	async generate(info: Buffer, byteLength: number) {
		const fullInfoBuffer = new Uint8Array(info.byteLength + 1);
		fullInfoBuffer.set(info, 0);
		fullInfoBuffer.set(new Uint8Array(1).fill(1), info.byteLength);

		const prk = await this._hmac.sign(this._ikm);
		const nextHmac = new HMAC(Buffer.from(prk));
		const nextPrk = await nextHmac.sign(Buffer.from(fullInfoBuffer));
		return nextPrk.slice(0, byteLength);
	}
}
