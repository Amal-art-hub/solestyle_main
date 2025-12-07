



document.addEventListener("DOMContentLoaded", () => {




let countdownTime = 60; // 60 seconds countdown
let countdownInterval;

function startCountdown() {
    const resendLink = document.getElementById('resendLink');
    
    // Disable the resend link
    resendLink.style.pointerEvents = 'none';
    resendLink.style.opacity = '0.5';
    resendLink.style.cursor = 'not-allowed';
    
    // Update the link text with countdown
    resendLink.textContent = `Resend OTP in ${countdownTime}s`;
    
    // Start the countdown
    countdownInterval = setInterval(() => {
        countdownTime--;
        
        if (countdownTime > 0) {
            // Update text with remaining time
            resendLink.textContent = `Resend OTP in ${countdownTime}s`;
        } else {
            // Countdown finished - enable the link
            clearInterval(countdownInterval);
            resendLink.textContent = 'Resend OTP';
            resendLink.style.pointerEvents = 'auto';
            resendLink.style.opacity = '1';
            resendLink.style.cursor = 'pointer';
            countdownTime = 60; // Reset for next time
        }
    }, 1000); // Update every second
}




    const form = document.getElementById("verifyOtpForm");

    // Verify OTP
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const otp = document.getElementById("otp").value.trim();

        if (!otp || otp.length !== 6) {
            alert("Please enter a valid 6-digit OTP.");
            return;
        }

        try {
            const { data } = await axios.post("/forget-verify-otp", { otp });

            if (data.success) {
                alert("OTP Verified Successfully!");
                window.location.href = "/reset-password";
            } else {
                alert(data.message || "Invalid OTP. Try again.");
            }

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Server error.");
        }
    });

   // Resend OTP - UPDATE THIS SECTION
document.getElementById("resendLink").addEventListener("click", async () => {
    
    // Check if countdown is still active
    if (countdownTime !== 60) {
        return; // Link is disabled during countdown
    }
    
    try {
        const { data } = await axios.post("/resend-forgot-otp"); // Changed route name
        
        // Use SweetAlert instead of alert
        Swal.fire({
            icon: 'success',
            title: 'OTP Resent!',
            text: data.message || "Check your email for the new OTP",
            timer: 2000
        });
        
        // Restart countdown after resending
        countdownTime = 60;
        startCountdown();
        
    } catch (err) {
        console.error(err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.response?.data?.message || "Could not resend OTP. Try again."
        });
    }
});

      startCountdown();

      // Replace the alerts with SweetAlert in verify OTP section too
if (data.success) {
    Swal.fire({
        icon: 'success',
        title: 'OTP Verified!',
        text: 'Redirecting to reset password...',
        timer: 1500
    });
    setTimeout(() => {
        window.location.href = "/reset-password";
    }, 1500);
}
});


