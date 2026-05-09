const CONFIG = {
    // Change this to your public IP or ngrok URL if testing on other machines
    API_BASE_URL: "http://localhost:5000",

    // Helper to get full API paths
    getEndpoint: (path) => `${CONFIG.API_BASE_URL}${path.startsWith('/') ? path : '/' + path}`
};

// Export to window so other scripts can access it
window.CONFIG = CONFIG;
