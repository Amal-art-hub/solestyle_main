// Global variables
let currentSlide = 0;
let authMode = 'login';

// Hero Slider
function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return;
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    if (!slides.length) return;
    
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    
    currentSlide = index;
    
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
}

// Auto slide every 5 seconds
setInterval(() => {
    changeSlide(1);
}, 5000);

// User Menu Toggle
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const userMenu = document.querySelector('.user-menu-trigger');
    const dropdown = document.getElementById('userDropdown');
    
    if (dropdown && userMenu && !userMenu.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
    }
});

// Auth Modal Functions
function openAuthModal(mode) {
    authMode = mode;
    const modal = document.getElementById('authModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const nameLabel = document.getElementById('nameLabel');
    const nameInput = document.getElementById('nameInput');
    const submitBtn = document.getElementById('submitBtn');
    const switchText = document.getElementById('switchText');
    const loginOptions = document.getElementById('loginOptions');
    
    if (mode === 'login') {
        modalTitle.textContent = 'Welcome Back!';
        modalSubtitle.textContent = 'Login to access your account';
        nameLabel.textContent = 'Name';
        nameInput.style.display = 'block';
        submitBtn.textContent = 'Login';
        switchText.innerHTML = "Don't have an account? <button type='button' class='link-btn' onclick='switchAuthMode()'>Sign Up</button>";
        if (loginOptions) loginOptions.style.display = 'flex';
    } else {
        modalTitle.textContent = 'Create Account';
        modalSubtitle.textContent = 'Sign up to start shopping';
        nameLabel.textContent = 'Full Name';
        nameInput.style.display = 'block';
        submitBtn.textContent = 'Sign Up';
        switchText.innerHTML = "Already have an account? <button type='button' class='link-btn' onclick='switchAuthMode()'>Login</button>";
        if (loginOptions) loginOptions.style.display = 'none';
    }
    
    if (modal) {
        modal.classList.add('show');
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

function switchAuthMode() {
    authMode = authMode === 'login' ? 'signup' : 'login';
    openAuthModal(authMode);
}

// Handle Auth Form Submit
function handleAuthSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password')
    };
    
    const endpoint = authMode === 'login' ? '/login' : '/signup';
    
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            // Reload page to show user logged in state
            window.location.reload();
        } else {
            alert(result.message || 'Authentication failed');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('authModal');
    if (modal && e.target === modal) {
        closeAuthModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAuthModal();
    }
});