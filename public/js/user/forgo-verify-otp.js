document.addEventListener("DOMContentLoaded", () => {
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
            const { data } = await axios.post("/verify-otp", { otp });

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

    // Resend OTP
    document.getElementById("resendLink").addEventListener("click", async () => {
        try {
            const { data } = await axios.post("/resend-otp");

            alert(data.message || "OTP resent successfully!");
        } catch (err) {
            console.error(err);
            alert("Could not resend. Try again.");
        }
    });
});
