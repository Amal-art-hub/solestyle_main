document.addEventListener('DOMContentLoaded', () => {
    const inputs = document.querySelectorAll('.otp-input-group input');
    const verifyBtn = document.querySelector('.btn-verify');
    const form = document.getElementById('verifyOtpForm');
    const resendLink = document.getElementById('resendLink');
    const timerDisplay = document.getElementById('timer');
    const messageBox = document.getElementById('messageBox');

    let timerInterval;
    const TIMER_DURATION = 60; // seconds

    // Focus first input on load
    inputs[0].focus();

    // Setup Input Logic (Auto-focus next)
    inputs.forEach((input, index) => {
        // Handle input event
        input.addEventListener('input', (e) => {
            const value = e.target.value;

            // Allow only numbers
            if (!/^\d*$/.test(value)) {
                e.target.value = value.replace(/\D/g, '');
                return;
            }

            // Move to next input if value entered
            if (value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

            // Allow pasting full OTP
            if (value.length === 6) {
                const chars = value.split('');
                inputs.forEach((inp, i) => {
                    if (chars[i]) inp.value = chars[i];
                });
                inputs[inputs.length - 1].focus();
            }
        });

        // Handle Backspace
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
    });

    // Start Timer
    function startTimer() {
        let timeLeft = TIMER_DURATION;
        resendLink.style.pointerEvents = 'none';
        resendLink.style.color = '#9ca3af'; // Gray out
        resendLink.textContent = 'Resend OTP';

        // Show timer span if not existing (optional structure check)

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;

            timerDisplay.textContent = `(${minutes}:${seconds < 10 ? '0' : ''}${seconds})`;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerDisplay.textContent = '';
                resendLink.style.pointerEvents = 'auto';
                resendLink.style.color = ''; // Restore original color
            }
        }, 1000);
    }

    startTimer();

    // Handle Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Collect OTP
        let otp = '';
        inputs.forEach(input => otp += input.value);

        if (otp.length !== 6) {
            showMessage('Please enter a complete 6-digit OTP.', 'error');
            return;
        }

        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';

        try {
            const response = await axios.post('/user/verify-email-otp', { otp }); // Update this route to match your actual verify route

            if (response.data.success) {
                showMessage('Email verified successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/user/profile';
                }, 1500);
            } else {
                showMessage(response.data.message || 'Invalid OTP. Please try again.', 'error');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Verify OTP';
            }
        } catch (error) {
            console.error(error);
            showMessage('An error occurred. Please try again.', 'error');
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify OTP';
        }
    });

    // Handle Resend
    resendLink.addEventListener('click', async () => {
        showMessage('Resending OTP...', 'success'); // Temporary waiting message

        try {
            const response = await axios.post('/user/resend-email-otp'); // Update route
            if (response.data.success) {
                showMessage('New OTP sent to your email.', 'success');
                startTimer();
                inputs.forEach(input => input.value = ''); // Clear inputs
                inputs[0].focus();
            } else {
                showMessage(response.data.message || 'Failed to resend OTP.', 'error');
            }
        } catch (error) {
            showMessage('Error resending OTP.', 'error');
        }
    });

    function showMessage(msg, type) {
        messageBox.textContent = msg;
        messageBox.className = `message-box ${type}`;
        messageBox.style.display = 'block';
    }
});
