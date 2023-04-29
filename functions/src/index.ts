/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import * as functions from 'firebase-functions';
import * as express from 'express';
import * as cors from 'cors';
import {allArchies} from './archiveController';
import {testFetchDetails} from './testController';
import {
  contactUs,
  modifyRightistRequest,
  sendMailApprovedRejectNotificationContribution,
} from './emailController';
// https://firebase.google.com/docs/functions/typescript
// https://firebase.google.com/docs/database/extend-with-functions

const app = express();
app.use(cors({origin: true}));

app.post('/', (_req, res) => res.status(200).send('Hello World!'));
app.post('/allArchies', allArchies);

exports.modifyRightistRequest = modifyRightistRequest;
exports.sendMailApprovedRejectNotificationContribution =
  sendMailApprovedRejectNotificationContribution;
exports.contactUs = contactUs;
exports.testFetchDetails = functions.https.onCall(testFetchDetails);
exports.app = functions.https.onRequest(app);
