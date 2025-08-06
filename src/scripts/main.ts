import { checkAuth, registerUser } from './api'

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already authenticated
  const token = localStorage.getItem('authToken');

  if (token) {
    redirectToAuthZone(token);
    return;
  }

  // Modal functionality
  const modal = document.getElementById('modal') as HTMLElement;
  const signUpBtn = document.getElementById('signUpBtn') as HTMLElement;
  const closeBtn = document.querySelector('.modal__close') as HTMLElement;
  const signupForm = document.getElementById('signupForm') as HTMLFormElement;
  const thankYouMessage = document.getElementById('thankYouMessage') as HTMLElement;

  signUpBtn.addEventListener('click', () => {
    modal.style.display = 'block';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
    }
  });

  // Form validation and submission
  signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const emailError = document.getElementById('emailError') as HTMLElement;
    const passwordError = document.getElementById('passwordError') as HTMLElement;

    // Reset errors
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

    let isValid = true;

    // Email validation
    if (!emailInput.value || !/^\S+@\S+\.\S+$/.test(emailInput.value)) {
      emailError.textContent = 'Please enter a valid email address';
      emailError.style.display = 'block';
      isValid = false;
    }

    // Password validation
    if (!passwordInput.value || passwordInput.value.length < 8) {
      passwordError.textContent = 'Password must be at least 8 characters';
      passwordError.style.display = 'block';
      isValid = false;
    }

    if (!isValid) return;

    try {
      // First try to authenticate
      const authToken = await checkAuth(emailInput.value, passwordInput.value);

      if (authToken) {
        // User exists, redirect with token
        localStorage.setItem('authToken', authToken);
        redirectToAuthZone(authToken);
        return;
      }

      // If no auth, proceed with registration
      const newToken = await registerUser(emailInput.value, passwordInput.value);

      // Show thank you message
      signupForm.style.display = 'none';
      thankYouMessage.style.display = 'block';

      // Store token and redirect
      localStorage.setItem('authToken', newToken);
      setTimeout(() => redirectToAuthZone(newToken), 2000);

    } catch (error: any) {
      alert('An error occurred: ' + error?.message);
    }
  });
});

function redirectToAuthZone(token: string): void {
  window.location.href = `https://www.dating.com/people/#token=${token}`;
}
