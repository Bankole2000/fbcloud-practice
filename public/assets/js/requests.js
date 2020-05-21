// import { threadId } from 'worker_threads';

var app = new Vue({
  el: '#app',
  data: {
    requests: [],
    userId : '',
    userUpvotedOn: [],
  },
  methods: {
    upvoteRequest(id) {
      const upvote = firebase.functions().httpsCallable('upvote');
      upvote({ id })
        .then(() => {
          console.log(id)
          M.toast({html: `<i class="mdi mdi-check-circle success"></i> Request Upvoted`});
        })
        .catch(err => {
          console.log(err.message);
          M.toast({html: `<i class="mdi mdi-close-circle error"></i> ${err.message}`});
        });
    },
    getUserUpvotedOn(userId){
      const userRef = firebase.firestore().collection('users').doc(userId);
      userRef.get()
        .then(doc => {
          this.userUpvotedOn = [...doc.data().upvotedOn];
        })
    }
  },
  mounted() {
    const requestsRef = firebase.firestore().collection('requests').orderBy('upvotes', 'desc');
    
    requestsRef.onSnapshot(snapshot => {
      let requests = [];
      snapshot.forEach(doc => {
        requests.push({
          ...doc.data(), 
          id: doc.id
        })
      });
      this.requests = requests;
      setTimeout(() => {
        const UserID = document.querySelector('.user-email').getAttribute('data-id');
        this.userId = UserID;
        console.log(this.userId);
        this.getUserUpvotedOn(UserID);
      }, 3000);
      
    })
  }
})
