var admin = require("firebase-admin");
var uid = process.argv[2];
//var serviceAccount = require("path/to/serviceAccountKey.json");

var serviceAccount = require('./file.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log("custom claims set for user", uid);
    process.exit();
  })
  .catch((error) => {
    console.log("error", error);
    process.exit(1);
  });
