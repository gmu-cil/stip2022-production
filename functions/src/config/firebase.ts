import * as admin from 'firebase-admin';
// import * as functions from 'firebase-functions';

// admin.initializeApp({
//   credential: admin.credential.applicationDefault(),
//   databaseURL: 'https://stip-demo-default-rtdb.firebaseio.com',
// });
admin.initializeApp();

const fireStore = admin.firestore();
const database = admin.database();
const storage = admin.storage();

export {fireStore, database, storage, admin};
