/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
import * as functions from 'firebase-functions';
import nodemailer = require('nodemailer');
import sdmail = require('@sendgrid/mail');
import {fireStore} from './config/firebase';
import {ALL_ADMIN_EMAIL} from './constants/adminEmails.contants';
import {ContactUs, RequestModification} from './types/emails.types';
import {contactUsTemplate, modifyRequestTemplate} from './email templates/request_template';
// eslint-disable-next-line camelcase
const sendGrid_api_key = functions.config().sendgrid.key;
const formAdminEmail = functions.config().admin.email;
sdmail.setApiKey(sendGrid_api_key);

// Fetch admin emails that want notification from firestore.
const adminEmails = async () => {
  const admins = (await fireStore.collection('adminEmailsNotification').get())
      .docs;
  const sendAdminEmail = [];

  admins.forEach((admin) => {
    const {email: adminEmail, isNotified: isNotified} = admin.data();
    if (isNotified === true) {
      sendAdminEmail.push(adminEmail);
    }
  });
  return [...sendAdminEmail, ...ALL_ADMIN_EMAIL];
};

export const contactUs = functions.https.onCall(
    async (data: ContactUs, context: any) => {
    // if (!context.auth) {
    //   throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' + 'while authenticated.');
    // }
      const {email: email = '', name: name = ''} = data;
      const to = await adminEmails();
      const msg = {
        to,
        from: formAdminEmail ?? 'no-reply@gmail.com',
        subject: `${name || 'User'} Contact Us (${email || 'User'})`,
        html: contactUsTemplate(data),
      };
      try {
        await sdmail.send(msg);
        return {
          message: 'sendGridMail',
          status: 'success',
          data: 'Email sent successfully',
        };
      } catch (error) {
        return {
          message: 'sendGridMail',
          status: 'error',
          data: error,
        };
      }
    }
);

export const modifyRightistRequest = functions.https.onCall(
    async (data: RequestModification, context: any) => {
      const {
        email: email = '',
        rightistId: rightistId = '',
        modifyRequest: modifyRequest = '',
        reasonRequest: reasonRequest = '',
      } = data;
      const to = await adminEmails();
      const msg = {
        to,
        from: formAdminEmail ?? 'no-reply@gmail.com',
        subject: `New Request to Modify Rightist ${email || 'User'} (${
          rightistId || 'User'
        })`,
        // this is only needed when html is not used.
        text: `${modifyRequest}
    ${reasonRequest}`,
        html: modifyRequestTemplate(data),
      };
      try {
        await sdmail.send(msg);
        return {
          message: 'sendGridMail',
          status: 'success',
          data: 'Email sent successfully',
        };
      } catch (error) {
        return {
          message: 'sendGridMail',
          status: 'error',
          data: error,
        };
      }
    }
);

export const sendMailApprovedRejectNotificationContribution = functions.database
    .ref(`/persons/requestArchieve/contributions/{user_id}/{contribution_id}`)
    .onUpdate(async (change, context: any) => {
      const contributorDetails = await fireStore
          .collection('users')
          .doc(context.params.user_id)
          .get();
      if (
        ['approved', 'rejected'].includes(change.after.val().publish) &&
      context.auth.token?.admin === true &&
      contributorDetails.get('emailVerified') === true
      ) {
        try {
          const result = await sdmail.send({
            from: formAdminEmail ?? 'no-reply@gmail.com',
            to: [context.auth.email, contributorDetails.get('email')],
            subject: `You have a notification from STIP ${contributorDetails.get(
                'uid'
            )} (${contributorDetails.get('email')}) ${context.auth.email}`,
            text: `Hello ${
              contributorDetails.get('nickName') ||
            contributorDetails.get('email')
            }, Your contribution was ${
              change.after.val().publish
            } - ContributionId: ${context.params.contribution_id} - UserId: ${
              context.params.user_id
            }`,
          });
          return {
            message: 'sendMail',
            status: 'success',
            data: result,
          };
        } catch (error) {
          console.log('Error (sendMailApprovedContribution):', error);
          return {
            message: 'sendMail',
            status: 'error',
            data: error,
          };
        }
      }
      return {
        message: 'sendMailApprovedContribution',
        status: 'Failed',
        data: 'no changes',
      };
    });

const {useremail, refreshtoken, clientid, clientsecret, accesstoken} =
  functions.config().gmail;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: false,
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: useremail,
    clientId: clientid,
    clientSecret: clientsecret,
    refreshToken: refreshtoken,
    accessToken: accesstoken,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

export const sendMail = functions.https.onCall(
    async (_data: ContactUs, _context: any) => {
      try {
        const result = await transporter.sendMail({
          from: _data?.email,
          to: ALL_ADMIN_EMAIL,
          text: _data?.message,
          subject: `You have a notification from ${_data?.name} (${_data?.email})`,
        });
        fireStore.collection('mail').add({
          to: 'joel@example.com',
          message: {
            subject: 'Hello from Firebase!',
            html: 'This is an <code>HTML</code> email body.',
          },
        });
        return {
          message: 'sendMail',
          status: 'success',
          data: result,
          result: _context,
        };
      } catch (error) {
        return {
          message: 'sendMail',
          status: 'error',
          data: error,
        };
      }
    }
);
