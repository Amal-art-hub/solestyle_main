function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
window.onclick = e => { if (e.target.classList.contains("modal-overlay")) e.target.style.display = "none"; };

function togglePassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.add("fa-eye");
        icon.classList.remove("fa-eye-slash");
    }
}
/* --- SweetAlert Logic --- */
// Check for URL parameters (e.g. ?message=Success)
const urlParams = new URLSearchParams(window.location.search);
const msg = urlParams.get("message");
const error = urlParams.get("error");
if (msg) {
    Swal.fire({ icon: "success", title: "Success", text: msg, timer: 2000, showConfirmButton: false });
    window.history.replaceState(null, "", window.location.pathname); // Clean URL
}
if (error) {
    Swal.fire({ icon: "error", title: "Error", text: error });
    window.history.replaceState(null, "", window.location.pathname);
}
// Client-side Password Validation
function validatePassword(e) {
    const newPass = document.getElementById("newPass").value;
    const confirmPass = document.getElementById("confirmPass").value;

    if (newPass !== confirmPass) {
        e.preventDefault(); // Stop form
        Swal.fire({ icon: "warning", title: "Mismatch", text: "New passwords do not match!" });
        return false;
    }

    return true;
}



function copyReferral(type, text) {
    if (!text || text === "N/A") return;

    navigator.clipboard.writeText(text).then(() => {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: (type === "code" ? "Code" : "Link") + " copied!",
            showConfirmButton: false,
            timer: 2000
        });
    }).catch(err => {
        console.error("Failed to copy", err);
    });
}

// ------------------- AJAX PASSOWRD CHANGE -------------------

document.getElementById("changePasswordForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    // 1. Existing Validation
    if (!validatePassword(e)) return;

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch("/user/profile/password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            await Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: result.message,
                showConfirmButton: false,
                timer: 1500
            });
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: result.message
            });
        }
    } catch (error) {
        console.error("Password Update Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.'
        });
    }
});

// ------------------- AJAX PROFILE EDIT -------------------

document.getElementById("editProfileForm")?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch("/user/profile/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            await Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: result.message,
                showConfirmButton: false,
                timer: 1500
            });
            location.reload();
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: result.message || "Failed to update profile"
            });
        }
    } catch (error) {
        console.error("Profile Update Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'An unexpected error occurred. Please try again later.'
        });
    }
});
