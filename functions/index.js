const functions = require('firebase-functions'); // include to use functions
const admin = require('firebase-admin');
admin.initializeApp();


// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// Http request 1 - Sample HTTP request cloud function return to random number
exports.randomNumber = functions.https.onRequest((request, response) => {
  const number = Math.round(Math.random() * 100);
  response.send(number.toString());
})

// Http request 2 - Sample HTTP request cloud function to redirect 
exports.toThePortfolio = functions.https.onRequest((request, response) => {
  response.redirect('https://bankole2000.github.io/portfolio'); // Redirect the user
})

// Http callable 1 Function 
exports.sayHello = functions.https.onCall((data, context) => {
  const name = data.name;
  return `Hello, ${name}`;
})

// Auth Background Trigger (New User Signup)
exports.newUserSignup = functions.auth.user().onCreate((user) => {
  console.log(`user created ${user.email} ${user.uid}`);
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email,
    upvotedOn: []
  });
})

// Auth Trigger (User Deleted)
exports.userDeleted = functions.auth.user().onDelete((user) => {
  console.log(`user deleted ${user.email} ${user.uid}`);
  // delete record from firebase
  const ref = admin.firestore().collection('users').doc(user.uid);
  return ref.delete();
})

// Http Callable fxn (adding a request)
exports.addRequest = functions.https.onCall((data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can add requests'
    );
  } 
  if (data.text.length > 40) {
    throw new functions.https.HttpsError(
      'invalid-argument', 
      'Requests must be less than 30 characters'
    );
  }
  return admin.firestore().collection('requests').add({
    text: data.text,
    upvotes: 0,
  });
});

// upvote Callable function 
exports.upvote = functions.https.onCall(async (data, context) => {
  // Check auth state if not logged in
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'only authenticated users can upvote requests'
    );
  } 
  // get refs for user doc and request doc
  const user = admin.firestore().collection('users').doc(context.auth.uid)
  const request = admin.firestore().collection('requests').doc(data.id)
  // Check user hasn't upvoted before
  const doc = await user.get()

  if(doc.data().upvotedOn.includes(data.id)) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'Can only upvote once'
    );
  }
  // update User upvotedOn Array
  await user.update({
    upvotedOn:[...doc.data().upvotedOn, data.id]
  });
  // update votes on the request
  return request.update({
    upvotes:  admin.firestore.FieldValue.increment(1)
  })    
})

// Firestore Trigger (tracking user activity for example)
exports.logActivities = functions.firestore.document('/requests/{id}')
  .onCreate((snap, context) => {
    console.log(snap.data());
    const collection = context.params.collection;
    const id = context.params.id;

    const activities = admin.firestore().collection('activities');
    if (collection === 'requests') {
      return activities.add({ text: 'A new Tutorial Request was added' })
    }
    if (collection === 'users') {
      return activities.add({ text: 'A new User Signed up' })
    }
    return null;
  })