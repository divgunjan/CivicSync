
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

/*
 TODO: Add SDKs for Firebase products that you want to use
 https://firebase.google.com/docs/web/setup#available-libraries

 Your web app's Firebase configuration
 For Firebase JS SDK v7.20.0 and later, measurementId is optional
*/
const firebaseConfig = {
    apiKey: "AIzaSyBGB11flOUEUBhCW1askXISsogFQpe5NGs",
    authDomain: "civicsync-376c0.firebaseapp.com",
    projectId: "civicsync-376c0",
    storageBucket: "civicsync-376c0.firebasestorage.app",
    messagingSenderId: "175901313311",
    appId: "1:175901313311:web:ffe367c60c567ef7ae882a",
    measurementId: "G-FS24FKMSQH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

function switchTab(clickedTab) {
        let tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');

        const isSignup = clickedTab.innerText === "Sign Up";

        document.getElementById("nameField").style.display =
            isSignup ? "block" : "none";

        document.getElementById("confirmPasswordField").style.display =
            isSignup ? "block" : "none";

        document.querySelector(".btn-primary").innerText =
            isSignup ? "Create Account" : "Login";
    }

    function activateSignup() {
        const tabs = document.querySelectorAll('.tab');
        tabs[1].click();
    }

    // HANDLE AUTH (Login / Sign Up) using Firebase
    async function handleLogin(event) {
        event.preventDefault();

        const activeTab = document.querySelector(".tab.active").innerText;
        const emailEl = document.getElementById('emailField');
        const passwordEl = document.getElementById('passwordField');
        if (!emailEl || !passwordEl) return;

        const email = emailEl.value.trim();
        const password = passwordEl.value;

        if (activeTab === "Login") {
            try {
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = "dashboard.html";
            } catch (err) {
                alert(err.message);
            }
        } else {
            // Sign Up flow
            const confirm = document.getElementById('confirmPassword')?.value;
            if (password !== confirm) {
                alert('Passwords do not match');
                return;
            }

            const name = document.getElementById('name')?.value || '';
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                if (name) {
                    await updateProfile(userCredential.user, { displayName: name });
                }
                alert('Account created successfully!');
                window.location.href = "dashboard.html";
            } catch (err) {
                alert(err.message);
            }
        }
    }

    // Google sign-in
    async function signInWithGoogle() {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = 'dashboard.html';
        } catch (err) {
            alert(err.message);
        }
    }

    // Toggle password visibility for password inputs
    function togglePassword(inputId, btn) {
        const input = document.getElementById(inputId);
        if (!input) return;

        const eyeSvg = '<svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>\n                                <circle cx="12" cy="12" r="3"></circle>\n                            </svg>';

        const eyeOffSvg = '<svg class="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">\n                                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.84 20.84 0 0 1 5.06-6.06"></path>\n                                <path d="M1 1l22 22"></path>\n                                <path d="M9.53 9.53A3.5 3.5 0 0 0 14.5 14.5"></path>\n                            </svg>';

        if (input.type === 'password') {
            input.type = 'text';
            btn.innerHTML = eyeOffSvg;
        } else {
            input.type = 'password';
            btn.innerHTML = eyeSvg;
        }
    }

    // Attach Google button handler if present
    document.addEventListener('DOMContentLoaded', () => {
        const gBtn = document.getElementById('googleBtn');
        if (gBtn) gBtn.addEventListener('click', signInWithGoogle);
    });
