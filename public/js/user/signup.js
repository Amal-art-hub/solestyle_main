document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const strengthBar = document.querySelector(".strength-bar");
  const submitBtn = document.querySelector(".submit-btn");
  const nameid1 = document.getElementById("firstName");
  const nameid2 = document.getElementById("lastName");

  //===============
  const emailid = document.getElementById("email");
  const phoneid = document.getElementById("phone");
  const error1 = document.getElementById("error1");
  const error2 = document.getElementById("error2");
  const error3 = document.getElementById("error3");
  const error4 = document.getElementById("error4");
  const error5 = document.getElementById("error5");

  function nameValidateChecking(e) {
    const nameval1 = nameid1.value;
    const nameval2 = nameid2.value;
    const namepattern = /^[A-ZA-z]+$/;

    if (nameval1.trim() === "" || nameval2.trim() === "") {
      error1.style.display = "block";
      error1.innerHTML = "Please enter a valid name";
    } else if (!namepattern.test(nameval1) || !namepattern.test(nameval2)) {
      error1.style.display = "block";
      error1.innerHTML = "Name can only contain alphabets and spaces";
    } else {
      error1.style.display = "none";
      error1.innerHTML = "";
    }
  }

  function emailValidateChecking(e) {
    const emailval = emailid.value;
    const emailpattern =
      /^([a-zA-Z0-9._-]+)@([a-zA-Z0-9.-]+)\.([a-zA-Z]{2,4})$/;

    if (!emailpattern.test(emailval)) {
      error2.style.display = "block";
      error2.innerHTML = "Invalid Format";
    } else {
      error2.style.display = "none";
      error2.innerHTML = "";
    }
  }

  function phoneValidateChecking(e) {
    const phoneval = phoneid.value;

    if (phoneval.trim() === "") {
      error3.style.display = "block";
      error3.innerHTML = "Enter valid phone number";
    } else if (phoneval.length < 10 || phoneval.length > 10) {
      error3.style.display = "block";
      error3.innerHTML = "Enter 10 digit";
    } else {
      error3.style.display = "none";
      error3.innerHTML = "";
    }
  }

  function passValidateChecking(e) {
    const passval = passwordInput.value;
    const cpassval = confirmPasswordInput.value;
    const alpha = /[a-zA-Z]/;
    const digit = /\d/;

    if (passval.length < 8) {
      error4.style.display = "block";
      error4.innerHTML = "Should contain atleast 8 characters";
    } else if (!alpha.test(passval) || !digit.test(passval)) {
      error4.style.display = "block";
      error4.innerHTML = "Should contain numbers and alphabets";
    } else {
      error4.style.display = "none";
      error4.innerHTML = "";
    }

    if (passval !== cpassval) {
      error5.style.display = "block";
      error5.innerHTML = "Passwords do not match";
    } else {
      error5.style.display = "none";
      error5.innerHTML = "";
    }
  }

  // Show error message
  function showError(message) {
    let errorElement = document.getElementById("error-message");
    if (!errorElement) {
      errorElement = document.createElement("div");
      errorElement.id = "error-message";
      errorElement.className = "error-message";
      document.querySelector(".signup-form").prepend(errorElement);
    }
    errorElement.textContent = message;
    errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Toggle password visibility
  window.togglePassword = function (fieldId) {
    const input = document.getElementById(fieldId);
    const button = input.parentElement.querySelector(".toggle-password");
    const icon = input.nextElementSibling.querySelector("i");
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  };

  // Calculate password strength
  function calculatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;
    return { score };
  }

  // Password strength indicator
  if (strengthBar) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;
      const strength = calculatePasswordStrength(password);

      strengthBar.className = "strength-bar";

      if (strength.score === 0) {
        strengthBar.style.width = "0";
      } else if (strength.score < 3) {
        strengthBar.classList.add("weak");
        strengthBar.style.width = "33%";
      } else if (strength.score < 5) {
        strengthBar.classList.add("medium");
        strengthBar.style.width = "66%";
      } else {
        strengthBar.classList.add("strong");
        strengthBar.style.width = "100%";
      }
    });
  }

  // Handle form submission
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    nameValidateChecking();
    emailValidateChecking();
    phoneValidateChecking();
    passValidateChecking();

    if (
      !nameid1 ||
      !emailid ||
      !phoneid ||
      !passwordInput ||
      !error1 ||
      !error2 ||
      !error3 ||
      !error4 ||
      !error5 ||
      !signupForm
    ) {
      console.error("One or more elements not found");
    }

    if (
      error1.innerHTML ||
      error2.innerHTML ||
      error3.innerHTML ||
      error4.innerHTML ||
      error5.innerHTML
    ) {
      e.preventDefault();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    const formData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    };

    // Client-side validation
    if (!formData.firstName || !formData.lastName) {
      showError("Please enter your first and last name");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
      return;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError("Please enter a valid email address");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
      return;
    }

    if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
      showError("Please enter a valid 10-digit phone number");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
      return;
    }

    if (formData.password.length < 8) {
      showError("Password must be at least 8 characters long");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
      return;
    }

    // Submit the form using Axios
    try {
      const response = await axios.post("/signup", formData);
      const data = response.data;

      if (data.success && data.redirect) {
        window.location.href = data.redirect;
      } else if (data.message) {
        showError(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      const msg =
        error.response?.data?.message || "An error occurred. Please try again.";
      showError(msg);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Account";
    }
  });
});

// document.addEventListener('DOMContentLoaded', function() {
//     const signupForm = document.getElementById('signupForm');
//     const passwordInput = document.getElementById('password');
//     const confirmPasswordInput = document.getElementById('confirmPassword');
//     const strengthBar = document.querySelector('.strength-bar');

//     // Toggle password visibility
//     function togglePassword(fieldId) {
//         const input = document.getElementById(fieldId);
//         const icon = input.nextElementSibling.querySelector('i');
//         if (input.type === "password") {
//             input.type = "text";
//             icon.classList.remove("fa-eye");
//             icon.classList.add("fa-eye-slash");
//         } else {
//             input.type = "password";
//             icon.classList.remove("fa-eye-slash");
//             icon.classList.add("fa-eye");
//         }
//     }

//     // Show error message
//     function showError(message) {
//         let errorElement = document.getElementById('error-message');
//         if (!errorElement) {
//             errorElement = document.createElement('div');
//             errorElement.id = 'error-message';
//             errorElement.className = 'error-message';
//             document.querySelector('.signup-form').prepend(errorElement);
//         }
//         errorElement.textContent = message;
//         errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
//     }

//     // Handle form submission
//     signupForm.addEventListener('submit', function(e) {
//         e.preventDefault();

//         const submitBtn = document.querySelector('.submit-btn');
//         const originalBtnText = submitBtn.innerHTML;

//         // Show loading state
//         submitBtn.disabled = true;
//         submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

//         const formData = {
//             firstName: document.getElementById('firstName').value,
//             lastName: document.getElementById('lastName').value,
//             email: document.getElementById('email').value,
//             phone: document.getElementById('phone').value, // ← Add this line
//             password: document.getElementById('password').value,
//             confirmPassword: document.getElementById('confirmPassword').value
//         };

//         // Client-side validation
//         if (!formData.firstName || !formData.lastName) {
//             showError('Please enter your first and last name');
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = 'Create Account';
//             return;
//         }

//         if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             showError('Please enter a valid email address');
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = 'Create Account';
//             return;
//         }

//         if (!formData.phone || !/^\d{10}$/.test(formData.phone)) {
//            showError('Please enter a valid 10-digit phone number');
//            submitBtn.disabled = false;
//            submitBtn.innerHTML = 'Create Account';
//            return;
// }

//         if (formData.password.length < 8) {
//             showError('Password must be at least 8 characters long');
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = 'Create Account';
//             return;
//         }

//         if (formData.password !== formData.confirmPassword) {
//             showError('Passwords do not match');
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = 'Create Account';
//             return;
//         }

//         // Submit the form
//         fetch('/signup', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(formData)
//         })
//         .then(response => {
//             if (!response.ok) {
//                 return response.json().then(err => {
//                     throw new Error(err.message || 'An error occurred during registration');
//                 });
//             }
//             return response.json();
//         })
//         .then(data => {
//             if (data.success && data.redirect) {
//                 window.location.href = data.redirect;
//             } else if (data.message) {
//                 showError(data.message);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             showError(error.message || 'An error occurred. Please try again.');
//         })
//         .finally(() => {
//             submitBtn.disabled = false;
//             submitBtn.innerHTML = 'Create Account';
//         });
//     });

//     // Password strength indicator
//     if (strengthBar) {
//         passwordInput.addEventListener('input', function() {
//             const password = this.value;
//             const strength = calculatePasswordStrength(password);

//             strengthBar.className = 'strength-bar';

//             if (strength.score === 0) {
//                 strengthBar.style.width = '0';
//             } else if (strength.score < 3) {
//                 strengthBar.classList.add('weak');
//                 strengthBar.style.width = '33%';
//             } else if (strength.score < 5) {
//                 strengthBar.classList.add('medium');
//                 strengthBar.style.width = '66%';
//             } else {
//                 strengthBar.classList.add('strong');
//                 strengthBar.style.width = '100%';
//             }
//         });
//     }

//     // Calculate password strength
//     function calculatePasswordStrength(password) {
//         let score = 0;
//         if (password.length >= 8) score++;
//         if (password.length >= 12) score++;
//         if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
//         if (/\d/.test(password)) score++;
//         if (/[^a-zA-Z\d]/.test(password)) score++;
//         return { score };
//     }
// });

// // Make togglePassword function globally available
// window.togglePassword = function(fieldId) {
//     const input = document.getElementById(fieldId);
//     const icon = input.nextElementSibling.querySelector('i');
//     if (input.type === "password") {
//         input.type = "text";
//         icon.classList.remove("fa-eye");
//         icon.classList.add("fa-eye-slash");
//     } else {
//         input.type = "password";
//         icon.classList.remove("fa-eye-slash");
//         icon.classList.add("fa-eye");
//     }
// };
