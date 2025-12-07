document.addEventListener("DOMContentLoaded", () => {

    const newPass = document.getElementById("newPassword");
    const confirmPass = document.getElementById("confirmPassword");

    const lenCheck = document.getElementById("lenCheck");
    const numCheck = document.getElementById("numCheck");
    const upperCheck = document.getElementById("upperCheck");

    // Password visibility toggles
    document.getElementById("toggleNew").addEventListener("click", () => {
        newPass.type = newPass.type === "password" ? "text" : "password";
    });

    document.getElementById("toggleConfirm").addEventListener("click", () => {
        confirmPass.type = confirmPass.type === "password" ? "text" : "password";
    });

    // Requirements validation
    newPass.addEventListener("input", () => {
        const val = newPass.value;
        lenCheck.checked = val.length >= 8;
        numCheck.checked = /\d/.test(val);
        upperCheck.checked = /[A-Z]/.test(val);
    });

    // Form submit
    document.getElementById("resetForm").addEventListener("submit", (e) => {
        e.preventDefault();

        if (newPass.value !== confirmPass.value) {
            alert("Passwords do not match!");
            return;
        }

        alert("Password reset successfully!");
        // You will send AJAX / axios request to your backend here
    });

});
