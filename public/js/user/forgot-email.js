document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("forgotEmail");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim();

        if (!email) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Email',
                text: 'Please enter your email address'
            });
            return;
        }

        try {
            // Axios POST request
            const response = await axios.post("/forgot-password", {
                email: email
            });

            // Check success
            if (response.data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Sent!',
                    text: 'Please check your email for the OTP',
                    showConfirmButton: true
                }).then(() => {
                    window.location.href = "/forg-verify-otp";
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Something went wrong'
                });
            }

        } catch (err) {
            console.error("Error:", err);
            const errorMessage = err.response?.data?.message || "Server error. Try again later.";
            
            Swal.fire({
                icon: 'error',
                title: 'Request Failed',
                text: errorMessage
            });
        }
    });
});













































// document.addEventListener("DOMContentLoaded", () => {
//     const form = document.getElementById("forgotForm");

//     form.addEventListener("submit", async (e) => {
//         e.preventDefault();

//         const email = document.getElementById("email").value.trim();

//         if (!email) {
//             alert("Please enter your email.");
//             return;
//         }

//         try {
//             const response = await fetch("/forgot-password", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email }),
//             });

//             const data = await response.json();

//             if (data.success) {
//                 alert("OTP sent successfully to your email!");
//                 window.location.href = "/verify-otp";
//             } else {
//                 alert(data.message || "Something went wrong");
//             }

//         } catch (err) {
//             console.error("Error:", err);
//             alert("Server error. Try again later.");
//         }
//     });
// });
