document.addEventListener("DOMContentLoaded", () => {
    const otpInput = document.getElementById("otp");
    const otpForm = document.getElementById("otpForm");

    // Auto-move cursor & formatting
    otpInput.addEventListener("input", () => {
        otpInput.value = otpInput.value.replace(/\D/g, "").substring(0, 6);
    });

    otpForm.addEventListener("submit", () => {
        const btn = document.querySelector(".otp-submit-btn");
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    });
});
