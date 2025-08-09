const auth = firebase.auth();
const db = firebase.firestore();

// Login function
function login() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  auth.signInWithEmailAndPassword(email, pass)
    .then(() => {
      document.getElementById('login-status').innerText = "Logged in!";
      document.getElementById('publisher-tools').classList.remove('hidden');
      document.getElementById('login-section').classList.add('hidden');
    })
    .catch(err => {
      document.getElementById('login-status').innerText = err.message;
    });
}

// Post an article
function postArticle() {
  const title = document.getElementById('title').value;
  const content = document.getElementById('content').value;
  db.collection('articles').add({
    title: title,
    content: content,
    date: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    alert("Article posted!");
    loadArticles();
  });
}

// Load articles for everyone
function loadArticles() {
  db.collection('articles').orderBy('date', 'desc').get().then(snapshot => {
    let newsHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      newsHTML += `<article><h2>${data.title}</h2><p>${data.content}</p></article>`;
    });
    document.getElementById('news').innerHTML = newsHTML;
  });
}

loadArticles();
