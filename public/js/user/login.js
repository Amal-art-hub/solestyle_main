document.addEventListener('DOMContentLoaded', function () {

    // -------------------------------
    // Password toggle function
    // -------------------------------
    const toggleButton = document.querySelector('.toggle-password');
    if (toggleButton) {
        toggleButton.addEventListener('click', function () {
            const passwordInput = document.getElementById("password");
            const icon = toggleButton.querySelector('i');

            if (!passwordInput || !icon) return;

            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = "password";
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }

    // -------------------------------
    // Check if user is already logged in
    // -------------------------------
    async function checkSession() {
        try {
            const response = await axios.get('/api/check-session');
            if (response.data.authenticated) {
                window.location.href = '/';
            }
        } catch (error) {
            console.error('Session check error:', error);
        }
    }
    checkSession(); // Run on page load

    // -------------------------------
    // Login form submission
    // -------------------------------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const submitButton = loginForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;

            // Basic validation
            if (!email || !password) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Error',
                    text: 'Please enter both email and password',
                    confirmButtonText: 'OK'
                });
                return;
            }

            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';

            try {
                const response = await axios.post('/login', { email, password }, {
                    withCredentials: true,
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.data.success) {
                    // Success Swal + redirect
                    Swal.fire({
                        icon: 'success',
                        title: 'Login Successful!',
                        text: 'Redirecting to home page...',
                        showConfirmButton: false,
                        timer: 1500,
                        timerProgressBar: true
                    }).then(() => {
                        window.location.href = response.data.redirectUrl || '/';
                    });
                } else {
                    throw new Error(response.data.message || 'Login failed');
                }

            } catch (error) {
                let errorMessage = 'An error occurred. Please try again later.';

                if (error.response) {
                    errorMessage = error.response.data.message || errorMessage;
                } else if (error.request) {
                    errorMessage = 'No response from server. Please check your connection.';
                } else if (error.message) {
                    errorMessage = error.message;
                }

                Swal.fire({
                    icon: 'error',
                    title: 'Login Failed',
                    text: errorMessage,
                    confirmButtonText: 'Try Again'
                });
            } finally {
                // Reset button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }

});
