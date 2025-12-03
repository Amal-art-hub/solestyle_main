document.addEventListener("DOMContentLoaded", () => {
    const otpInput = document.getElementById("otp");
    const otpForm = document.getElementById("otpForm");
    const timerElement = document.getElementById("timer");
    const resendLink = document.getElementById("resendLink");
    let timeLeft = 60; // 60 seconds

    // Auto-move cursor & formatting
    otpInput.addEventListener("input", () => {
        otpInput.value = otpInput.value.replace(/\D/g, "").substring(0, 6);
    });

    // Enhanced Form Submission Logic
    otpForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const otpValue = otpInput.value;
        const btn = document.querySelector(".otp-submit-btn");

        // Show loading state
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

        try {
            const response = await axios.post("/verify-otp", {
                otp: otpValue
            });

            if (response.data.success) {
                Swal.fire({
                    icon: "success",
                    title: "OTP Verified Successfully",
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = response.data.redirectUrl;
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: response.data.message || "Invalid OTP"
                });
                btn.disabled = false;
                btn.innerHTML = 'Verify OTP';
            }
        } catch (error) {
            console.error("Verification error:", error);
            Swal.fire({
                icon: "error",
                title: "Invalid OTP",
                text: "Please try again"
            });
            btn.disabled = false;
            btn.innerHTML = 'Verify OTP';
        }
    });

    // Countdown Timer Logic
    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        if (timeLeft > 0) {
            timeLeft--;
            setTimeout(updateTimer, 1000);
        } else {
            // Enable Resend Link
            resendLink.classList.remove("disabled");
            resendLink.style.pointerEvents = "auto";
            resendLink.style.color = "#007bff";
            timerElement.textContent = ""; // Hide timer or show "Expired"
        }
    }

    // Start Timer
    if (timerElement && resendLink) {
        updateTimer();
    }
});
