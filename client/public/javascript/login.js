// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Initialize Firebase using the config served from our backend
const firebaseConfig = window.FIREBASE_CONFIG;
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

function getOrCreateUserId() {
    let id = localStorage.getItem('tsim_user_id');
    if (!id) {
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        id = `Citizen_${randomNum}`;
        localStorage.setItem('tsim_user_id', id);
    }
    return id;
}

// Google Auth Handler
window.handleGoogleLogin = async function() {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        localStorage.setItem('tsim_user_email', user.email);
        localStorage.setItem('tsim_user_logged_in', 'true');
        getOrCreateUserId(); // Ensure ID exists
        window.location.href = "dashboard.html";
    } catch (error) {
        console.error("Google Auth Error:", error.code, error.message);
        alert(error.message);
    }
};

// Wait for DOM to attach listeners for module scope
document.addEventListener('DOMContentLoaded', () => {
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', window.handleGoogleLogin);
    }
});

// Make functions global so they can be called from HTML onclick attributes
window.switchTab = function(clickedTab) {
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

    window.activateSignup = function() {
        const tabs = document.querySelectorAll('.tab');
        tabs[1].click();
    }

    // LOGIN REDIRECT
    window.handleLogin = async function(event) {
        event.preventDefault();

        const email = event.target.querySelector('input[type="email"]').value;
        const password = document.getElementById("passwordField").value;
        const activeTab = document.querySelector(".tab.active").innerText;

        try {
            if (activeTab === "Login") {
                // Real Firebase Sign In
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                localStorage.setItem('tsim_user_email', user.email);
                localStorage.setItem('tsim_user_logged_in', 'true');
                getOrCreateUserId();
                window.location.href = "dashboard.html";
            } else {
                // Real Firebase Sign Up
                const confirmPassword = document.getElementById("confirmPassword").value;
                if (password !== confirmPassword) {
                    alert("Passwords do not match!");
                    return;
                }
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                localStorage.setItem('tsim_user_email', user.email);
                localStorage.setItem('tsim_user_logged_in', 'true');
                alert("Account created successfully!");
                window.location.href = "dashboard.html";
            }
        } catch (error) {
            console.error("Auth Error:", error.code, error.message);
            alert(error.message);
        }
    }
