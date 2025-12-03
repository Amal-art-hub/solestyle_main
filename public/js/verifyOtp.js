document.addEventListener("DOMContentLoaded", () => {
    const otpInput = document.getElementById("otp");
    const otpForm = document.getElementById("otpForm");
    const timerElement = document.getElementById("timer");
    const resendLink = document.getElementById("resendLink");
    let timeLeft = 60; // 60 seconds
    let timerId;

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
            timerId = setTimeout(updateTimer, 1000);
        } else {
            // Enable Resend Link
            resendLink.classList.remove("disabled");
            resendLink.style.pointerEvents = "auto";
            resendLink.style.color = "#007bff";
            timerElement.textContent = "";
        }
    }

    // Handle Resend OTP
    async function handleResendOTP() {
        try {
            // Disable resend link and show loading
            resendLink.classList.add("disabled");
            resendLink.style.pointerEvents = "none";
            resendLink.style.color = "#6c757d";
            
            const response = await axios.post('/resend-otp');
            
            if (response.data.success) {
                // Reset and restart timer
                clearTimeout(timerId);
                timeLeft = 60;
                updateTimer();
                
                Swal.fire({
                    icon: 'success',
                    title: 'OTP Resent!',
                    text: 'A new OTP has been sent to your registered email/phone.',
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                throw new Error(response.data.message || 'Failed to resend OTP');
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to resend OTP. Please try again.'
            });
            
            // Re-enable resend link on error
            resendLink.classList.remove("disabled");
            resendLink.style.pointerEvents = "auto";
            resendLink.style.color = "#007bff";
        }
    }

    // Add click event listener for resend link
    if (resendLink) {
        resendLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (!resendLink.classList.contains('disabled')) {
                handleResendOTP();
            }
        });
    }

    // Start Timer
    if (timerElement && resendLink) {
        updateTimer();
    }
});
