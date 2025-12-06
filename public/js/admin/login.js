console.log("Admin login.js loaded!");

document.addEventListener('DOMContentLoaded', () => {
    // ---------------- Password Toggle ----------------
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.password-toggle');

    if (toggleIcon && passwordInput) {
        toggleIcon.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            toggleIcon.classList.toggle('fa-eye');
            toggleIcon.classList.toggle('fa-eye-slash');
        });
    }

    // ---------------- Admin Login Using Axios ----------------
    const form = document.getElementById('adminLoginForm');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();  // stop default form submit

            const email = document.getElementById("email-username").value.trim();
            const password = document.getElementById("password").value.trim();

            // Optional simple validation
            if (!email || !password) {
                Swal.fire({
                    icon: "warning",
                    title: "Missing Fields",
                    text: "Please enter email and password."
                });
                return;
            }

            try {
                const response = await axios.post("/admin/login", { email, password });

                if (response.data.success) {
                    Swal.fire({
                        icon: "success",
                        title: "Login Successful",
                        text: response.data.message,
                        timer: 1500,
                        showConfirmButton: false
                    });

                    setTimeout(() => {
                        window.location.href = response.data.redirectUrl;
                    }, 1500);

                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed",
                        text: response.data.message
                    });
                }

            } catch (err) {
                Swal.fire({
                    icon: "error",
                    title: "Server Error",
                    text: err.response?.data?.message || "Something went wrong. Please try again."
                });
                console.error(err);
            }
        });
    } else {
        console.error("Form with id 'adminLoginForm' not found!");
    }
});