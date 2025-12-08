document.addEventListener("DOMContentLoaded", () => {

    const newPass = document.getElementById("newPassword");
    const confirmPass = document.getElementById("confirmPassword");

    const lenCheck = document.getElementById("lenCheck");
    const numCheck = document.getElementById("numCheck");
    const upperCheck = document.getElementById("upperCheck");

    // Toggle password visibility
    document.getElementById("toggleNew").addEventListener("click", () => {
        newPass.type = newPass.type === "password" ? "text" : "password";
    });

    document.getElementById("toggleConfirm").addEventListener("click", () => {
        confirmPass.type = confirmPass.type === "password" ? "text" : "password";
    });

    // Password requirement checks
    newPass.addEventListener("input", () => {
        const val = newPass.value;
        lenCheck.checked = val.length >= 8;
        numCheck.checked = /\d/.test(val);
        upperCheck.checked = /[A-Z]/.test(val);
    });

    // Form submission
    document.getElementById("resetForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        if (newPass.value !== confirmPass.value) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const { data } = await axios.post("/reset-password", {
                newPassword: newPass.value,
            });

            if (data.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success!",
                    text: "Password reset successfully. Please login.",
                    timer: 2000,
                    showConfirmButton: false
                });

                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || "Failed to reset password"
            });
        }

    });

});
