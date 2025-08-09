// =============== FIREBASE IMPORTS (modular) ===============
// Using explicit versioned imports keeps behavior stable.
// If you prefer, use the exact CDN version suggested by Firebase console.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

// =============== CONFIG - replace with your Firebase values ===============
const firebaseConfig = {
  apiKey: "YOUR_APIKEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const PUBLISHER_EMAIL = "you@yourdomain.com"; // replace with your email exactly

// =============== INIT ===============
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// =============== UI refs ===============
const el = {
  newsList: document.getElementById('news-list'),
  recommendedList: document.getElementById('recommended-list'),
  authMsg: document.getElementById('auth-msg'),
  postMsg: document.getElementById('post-msg'),
  loginBtn: document.getElementById('btn-login'),
  logoutBtn: document.getElementById('btn-logout'),
  editor: document.getElementById('editor'),
  publisherPanel: document.getElementById('publisher'),
  email: document.getElementById('email'),
  password: document.getElementById('password'),
  title: document.getElementById('art-title'),
  body: document.getElementById('art-body'),
  recommend: document.getElementById('art-recommend')
};

// =============== AUTH UX ===============
el.loginBtn?.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  try {
    await signInWithEmailAndPassword(auth, email, pass);
    el.authMsg.textContent = 'Logged in';
  } catch (e) {
    el.authMsg.textContent = 'Login failed: ' + e.message;
  }
});
el.logoutBtn?.addEventListener('click', async () => {
  await signOut(auth);
});

// Show/hide publisher/editor based on auth
onAuthStateChanged(auth, user => {
  if (user && user.email === PUBLISHER_EMAIL) {
    // publisher logged in
    el.editor.classList.remove('hidden');
    el.loginBtn.classList?.add('hidden');
    el.logoutBtn.classList?.remove('hidden');
    el.authMsg.textContent = `Signed in as ${user.email}`;
  } else {
    // not publisher
    el.editor.classList.add('hidden');
    el.loginBtn.classList?.remove('hidden');
    el.logoutBtn.classList?.add('hidden');
    el.authMsg.textContent = 'Not signed in';
  }
});

// =============== POST ARTICLE ===============
document.getElementById('btn-post')?.addEventListener('click', async () => {
  const title = document.getElementById('art-title').value.trim();
  const body = document.getElementById('art-body').value.trim();
  const recommended = document.getElementById('art-recommend').checked;
  if (!title || !body) { el.postMsg.textContent = 'Title and body required'; return; }

  try {
    await addDoc(collection(db, 'articles'), {
      title,
      body,
      recommended: !!recommended,
      date: serverTimestamp()
    });
    el.postMsg.textContent = 'Posted!';
    document.getElementById('art-title').value = '';
    document.getElementById('art-body').value = '';
    loadArticles();
    loadRecommended();
  } catch (e) {
    el.postMsg.textContent = 'Error: ' + e.message;
  }
});

// =============== LOAD ARTICLES ===============
async function loadArticles() {
  const q = query(collection(db, 'articles'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  el.newsList.innerHTML = '';
  snap.forEach(doc => {
    const data = doc.data();
    const art = document.createElement('article');
    const h = document.createElement('h2');
    h.textContent = data.title || 'Untitled';
    const p = document.createElement('p');
    p.textContent = (data.body || '').slice(0, 600) + (data.body && data.body.length>600 ? '…' : '');
    art.appendChild(h);
    art.appendChild(p);
    el.newsList.appendChild(art);
  });
}

// =============== LOAD RECOMMENDED (top 3 recent) ===============
async function loadRecommended() {
  const q = query(collection(db, 'articles'), orderBy('date', 'desc'), limit(3));
  const snap = await getDocs(q);
  el.recommendedList.innerHTML = '';
  snap.forEach(doc => {
    const data = doc.data();
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#';
    a.textContent = data.title || 'Untitled';
    li.appendChild(a);
    el.recommendedList.appendChild(li);
  });
}

// initial load
loadArticles();
loadRecommended();

