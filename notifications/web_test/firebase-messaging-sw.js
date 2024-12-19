// // importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");
// // importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
// importScripts(
// 	'https://www.gstatic.com/firebasejs/10.1.0/firebase-app-compat.js'
// );
// importScripts(
// 	'https://www.gstatic.com/firebasejs/10.1.0/firebase-messaging-compat.js'
// );

// const firebaseConfig = {
// 	apiKey: 'AIzaSyA9q9OJvrRsj_-vcUIirXzR5PbBGYTDZr4',
// 	authDomain: 'meta-test-ae78d.firebaseapp.com',
// 	projectId: 'meta-test-ae78d',
// 	storageBucket: 'meta-test-ae78d.appspot.com',
// 	messagingSenderId: '69974214552',
// 	appId: '1:69974214552:web:67c1c81537d56b9e3f8ded',
// 	measurementId: 'G-8Y9W4NWLFF',
// };

// // Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig);
// const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
// 	console.log('Background: Message received. ', payload);
// 	const notificationTitle = payload?.notification?.title;
// 	if (notificationTitle) {
// 		const notificationOptions = {
// 			body: payload.notification.body,
// 			icon: 'https://dimg.scandid.in/favicon/1613362636.png',
// 		};

// 		self.registration.showNotification(notificationTitle, notificationOptions);
// 		console.log('Notification displayed.');
// 	}
// });
