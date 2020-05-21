M.AutoInit();

const authSwitchLinks = document.querySelectorAll('.switch');
const authModals = document.querySelectorAll('.auth .modal');
const authWrapper = document.querySelector('.auth');
const registerForm = document.querySelector('.register');
const loginForm = document.querySelector('.login');
const signOut = document.querySelector('.sign-out');
const userProfile = document.querySelector('.user-profile');

// toggle auth modals
authSwitchLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    authModals.forEach(modal => modal.classList.toggle('active'));
  });
});

// Register form 
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = registerForm.email.value;
  const password = registerForm.password.value;
  console.log(email, password);

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then((cred) => {
      console.log(cred, cred.user);
      registerForm.querySelector('.error').innerHTML = '';
      registerForm.reset();
      M.toast({html: '<i class="mdi mdi-check-circle success"></i> Registration Successful'});
    })
    .catch(err => {
      registerForm.querySelector('.error').innerHTML = err.message;
      M.toast({html: '<i class="mdi mdi-close-circle error"></i> Registration Failed'});
    });
});

// signout
signOut.addEventListener('click', () => {
  firebase.auth().signOut()
    .then(() => console.log(`Signed Out`));
})

// Login form 
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginForm.email.value;
  const password = loginForm.password.value;
  console.log(email, password);

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((user) => {
      console.log(`Logged in ${user}`);
      loginForm.querySelector('.error').innerHTML = '';
      M.toast({html: '<i class="mdi mdi-check-circle success"></i> Login Successful'});
      loginForm.reset();
    })
    .catch(err => {
      err ? loginForm.querySelector('.error').innerHTML = err.message : '';
      M.toast({html: '<i class="mdi mdi-close-circle error"></i> Login Failed'});
    });
});

// Auth Listener
firebase.auth().onAuthStateChanged((user) => {
  if(user){
    authWrapper.classList.remove('open');
    authModals.forEach(modal => {
      modal.classList.remove('active');
    })
    const gravatar = MD5(user.email.trim().toLowerCase());
    user.image = `https://www.gravatar.com/avatar/${gravatar}`;
    userProfile.querySelector('img').setAttribute('src', user.image);
    userProfile.querySelector('.user-email').innerHTML = user.email;
    userProfile.querySelector('.user-email').setAttribute('data-id', user.uid);
  } else {
    authWrapper.classList.add('open');
    authModals[0].classList.add('active');
    userProfile.querySelector('img').setAttribute('src', '');
    userProfile.querySelector('.user-email').innerHTML = '';
    userProfile.querySelector('.user-email').setAttribute('data-id', '');
  }
})


