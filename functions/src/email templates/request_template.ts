import {ContactUs, RequestModification} from '../types/emails.types';

const sharedStyle = `* {
  box-sizing: border-box;
  font-family: Arial, Helvetica, sans-serif;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  color: #FFFFFF;
}

main {
  background-color: #61af87;
  color: white;
}

/* Style the content */

.content {
  background-color: #266461;
  padding: 10px;
  border-radius: 1rem;
  border-bottom: 0.4rem solid #cea374;
  margin: 2rem;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  color: white;
  /* Should be removed. Only for demonstration */
}

.content:hover {
  box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
}

/* Style the footer */

.footer {
  border-bottom: 0.4rem solid #cea374;
  background-color: #a76724;
  padding: 10px;

}

.h1font {
  font-size: 1rem;
  padding: 0.3rem;
}
a:link {
  color: #61af87;
  background-color: transparent;
  text-decoration: none;
}
a:visited {
  color: pink;
  background-color: transparent;
  text-decoration: none;
}
a:hover {
  color: #a76724;
  background-color: transparent;
  text-decoration: underline;
}
a:active {
  color: white;
  background-color: transparent;
  text-decoration: underline;
}`;

export const modifyRequestTemplate = (p: RequestModification) => {
  return `<!DOCTYPE html>
  <html lang="en">

  <head>
      <title>STIP NOTIFICATION</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
          ${sharedStyle}
      </style>
  </head>

  <body>
      <main>
          <h1 class="h1font">Notification from STIP</h1>
          <div class="content">
              <h1>Modify Request</h1>
              <h2>Modify Request from ${p.email}</h2>
              <h4>Email: <b>${p.email}</b></h4>
              <p>Hello Admin,</p>
              <p>The following information is from STIP Project.</p>
              <p><b>Rightist ID to modify:</b> ${p.rightistId}</p>
              <p><b>Modification request:</b> ${p.modifyRequest}</p>
              <p><b>Reason behind request:</b> ${p.reasonRequest}</p>
              <p>
                  You have a new request to modify your Rightist account.
              </p>
              <p>
                  Please click the link below to view the request.
              </p>
              <p>
                  <a class="" href="${p?.url}"  target="_blank">
                      Navigate to Rightist to modify your request.
                    </a>
              </p>
          </div>
          <div class="footer">
              <p>Sincerely, STIP@GMU</p>
          </div>
      </main>
  </body>

  </html>`;
};

export const contactUsTemplate = (p: ContactUs) => {
  return `<!DOCTYPE html>
  <html lang="en">

  <head>
      <title>STIP NOTIFICATION</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
          ${sharedStyle}
      </style>
  </head>

  <body>
      <main>
          <h1 class="h1font">Notification from STIP</h1>
          <div class="content">
              <h1>From ${p.name}</h1>
              <h2>Contact Us from (${p.email})</h2>
              <h4>Email: <b>${p.email}</b></h4>
              <p>Hello Admin,</p>
              <p>The following information is from STIP Project.</p>
              <p><b>Message:</b> ${p.message}</p>
          </div>
          <div class="footer">
              <p>Sincerely, STIP@GMU</p>
          </div>
      </main>
  </body>

  </html>`;
};
