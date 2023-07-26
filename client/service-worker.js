'use strict';
/* eslint-env browser, serviceworker */

self.addEventListener('install', () => {
	self.skipWaiting();
});

self.addEventListener('push', function(event) {
	let notificationTitle = 'NO_TITLE';
	const notificationOptions = {
		body: 'NO_BODY_TEXT',
		icon: './images/app-logo.png',
		badge: './images/app-logo.png',
		data: {
			url: 'https://web.dev/push-notifications-overview/',
		},
	};

	if (event.data) {
		const data = event.data.json();
		notificationTitle = data.title;
		notificationOptions.body = data.body;
		notificationOptions.data.url = data.url;
	}

	event.waitUntil(
		self.registration.showNotification(
			notificationTitle,
			notificationOptions,
		),
	);
});

self.addEventListener('notificationclick', function(event) {
	event.notification.close();

	let clickResponsePromise = Promise.resolve();
	if (event.notification?.data?.url) {
		clickResponsePromise = clients.openWindow(event.notification.data.url);
	}

	event.waitUntil(clickResponsePromise);
});
