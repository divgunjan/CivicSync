
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

    // LOGIN REDIRECT
    function handleLogin(event) {
        event.preventDefault();

        const activeTab =
            document.querySelector(".tab.active").innerText;

        // Only redirect on Login
        if (activeTab === "Login") {
            window.location.href = "dashboard.html";
        } else {
            alert("Account created successfully!");
            window.location.href = "dashboard.html";
        }
    }
<<<<<<< HEAD

=======
>>>>>>> 6c90be8fc28ec660e6b9c4a8ec0455930c7ccf49
