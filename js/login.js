// js/login.js

document.addEventListener('DOMContentLoaded', function() {
    // ===== Tab Switching =====
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    const tabIndicator = document.querySelector('.tab-indicator');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update tab indicator position
            if (targetTab === 'signup') {
                tabIndicator.style.transform = 'translateX(100%)';
            } else {
                tabIndicator.style.transform = 'translateX(0)';
            }
            
            // Show corresponding form
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // ===== Password Toggle =====
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const eyeIcon = button.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.textContent = '🙈';
            } else {
                input.type = 'password';
                eyeIcon.textContent = '👁️';
            }
        });
    });

    // ===== Password Strength Indicator =====
    const passwordInput = document.getElementById('signup-password');
    const strengthBars = document.querySelectorAll('.strength-bar span');
    const strengthText = document.querySelector('.strength-text');

    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = calculatePasswordStrength(password);
            updateStrengthIndicator(strength);
        });
    }

    function calculatePasswordStrength(password) {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        
        return strength;
    }

    function updateStrengthIndicator(strength) {
        const colors = ['#ff4444', '#ffa700', '#ffdd00', '#00c851'];
        const texts = ['Weak', 'Fair', 'Good', 'Strong'];
        
        strengthBars.forEach((bar, index) => {
            if (index < strength) {
                bar.style.background = colors[strength - 1];
                bar.style.transform = 'scaleY(1)';
            } else {
                bar.style.background = '#e0e0e0';
                bar.style.transform = 'scaleY(0.5)';
            }
        });
        
        if (strength > 0) {
            strengthText.textContent = texts[strength - 1];
            strengthText.style.color = colors[strength - 1];
        } else {
            strengthText.textContent = 'Password strength';
            strengthText.style.color = '#999';
        }
    }

    // ===== Confirm Password Validation =====
    const confirmPasswordInput = document.getElementById('signup-confirm-password');
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = document.getElementById('signup-password').value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (confirmPassword && password !== confirmPassword) {
                confirmPasswordInput.style.borderColor = '#ff4444';
            } else if (confirmPassword && password === confirmPassword) {
                confirmPasswordInput.style.borderColor = '#00c851';
            } else {
                confirmPasswordInput.style.borderColor = '';
            }
        });
    }

    // ===== Form Submissions =====
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Add loading state
            const submitBtn = loginForm.querySelector('.auth-submit-btn');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Show success modal
                showSuccessModal('You have successfully logged in!');
            }, 1500);
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            // Validate passwords match
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            // Add loading state
            const submitBtn = signupForm.querySelector('.auth-submit-btn');
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                
                // Show success modal
                showSuccessModal('Your account has been created successfully!');
            }, 1500);
        });
    }

    // ===== Input Focus Effects =====
    const inputs = document.querySelectorAll('.input-wrapper input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('focused');
        }
    });

    // ===== Social Login Buttons =====
    const socialButtons = document.querySelectorAll('.social-btn');
    
    socialButtons.forEach(button => {
        button.addEventListener('click', () => {
            const provider = button.classList.contains('google') ? 'Google' : 'Facebook';
            // In a real app, this would redirect to OAuth
            alert(`${provider} login would be implemented with OAuth in production.`);
        });
    });
});

// ===== Success Modal Functions =====
function showSuccessModal(message) {
    const modal = document.getElementById('success-modal');
    const modalMessage = document.getElementById('modal-message');
    
    if (modalMessage) {
        modalMessage.textContent = message;
    }
    
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        // Redirect to home after closing
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 300);
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});
