const requestModal = document.querySelector('.new-request');
const requestLink = document.querySelector('.add-request');
const requestForm = document.querySelector('.new-request form');

requestLink.addEventListener('click', (e) => {
  e.preventDefault();
  requestModal.classList.add('open');
})

requestModal.addEventListener('click', (e) => {
  if (e.target.classList.contains('new-request')) {
    requestModal.classList.remove('open');
  }
})

// say Hello button cloud function call - Callable 1
const btn = document.querySelector('.call');
btn.addEventListener('click', (e) => {
  e.preventDefault();
  const sayHello = firebase.functions().httpsCallable('sayHello');
  email = document.querySelector('.user-email').textContent;
  sayHello({email})
    .then((result) => {
      console.log(result.data);
      M.toast({ html: `${result.data} 👋`})
    })
})

// Add a new request 
requestForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const addRequest = firebase.functions().httpsCallable('addRequest');
  addRequest({text: requestForm.request.value})
    .then(() => {
      requestForm.reset();
      requestModal.classList.remove('open');
      requestForm.querySelector('.error').textContent = '';
      M.toast({html: '<i class="mdi mdi-check-circle success"></i> &nbsp; Request Added'});
    })
    .catch((err) => {
      err ? requestForm.querySelector('.error').textContent = err.message: '';
      M.toast({html: '<i class="mdi mdi-check-circle success"></i> &nbsp; Failed to add Request'});
    })
});