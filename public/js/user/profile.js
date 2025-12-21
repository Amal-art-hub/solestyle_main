function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
window.onclick = e => { if (e.target.classList.contains('modal-overlay')) e.target.style.display = 'none'; };

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
const msg = urlParams.get('message');
const error = urlParams.get('error');
if (msg) {
    Swal.fire({ icon: 'success', title: 'Success', text: msg, timer: 2000, showConfirmButton: false });
    window.history.replaceState(null, '', window.location.pathname); // Clean URL
}
if (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: error });
    window.history.replaceState(null, '', window.location.pathname);
}
// Client-side Password Validation
function validatePassword(e) {
    const newPass = document.getElementById('newPass').value;
    const confirmPass = document.getElementById('confirmPass').value;
    if (newPass !== confirmPass) {
        e.preventDefault(); // Stop form
        Swal.fire({ icon: 'warning', title: 'Mismatch', text: 'New passwords do not match!' });
        return false;
    }
    return true;
}
