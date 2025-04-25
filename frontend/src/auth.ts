import { api } from './api';
import { showToast } from './ui';

let isAuthenticated = false;

export function setupAuth() {
    const authButtons = document.getElementById('auth-buttons')!;
    const userProfile = document.getElementById('user-profile')!;
    const welcomeMessage = document.getElementById('welcome-message')!;
    const loginBtn = document.getElementById('login-btn')!;
    const registerBtn = document.getElementById('register-btn')!;
    const logoutBtn = document.getElementById('logout-btn')!;
    const authModal = document.getElementById('auth-modal')!;
    const authForm = document.getElementById('auth-form')! as HTMLFormElement;
    const authTitle = document.getElementById('auth-title')!;
    const nameField = document.getElementById('name-field')!;
    const cancelAuth = document.getElementById('cancel-auth')!;

    let isRegister = false;

    function updateAuthDisplay() {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        isAuthenticated = !!user;

        if (user) {
            authButtons.classList.add('hidden');
            userProfile.classList.remove('hidden');
            welcomeMessage.textContent = `Welcome, ${user.name}!`;
        } else {
            authButtons.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    }

    function showAuthModal(register = false) {
        isRegister = register;
        authTitle.textContent = register ? 'Register' : 'Log In';
        nameField.classList.toggle('hidden', !register);
        authModal.classList.remove('hidden');
        authForm.reset();
    }

    loginBtn.addEventListener('click', () => showAuthModal(false));
    registerBtn.addEventListener('click', () => showAuthModal(true));
    cancelAuth.addEventListener('click', () => authModal.classList.add('hidden'));

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = (document.getElementById('auth-email') as HTMLInputElement).value;
        const password = (document.getElementById('auth-password') as HTMLInputElement).value;

        try {
            let response;
            if (isRegister) {
                const name = (document.getElementById('auth-name') as HTMLInputElement).value;
                response = await api.register(name, email, password);
            } else {
                response = await api.login(email, password);
            }

            api.setToken(response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            authModal.classList.add('hidden');
            updateAuthDisplay();
            showToast(`Successfully ${isRegister ? 'registered' : 'logged in'}!`);
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        updateAuthDisplay();
        showToast('Successfully logged out!');
    });

    updateAuthDisplay();
}

export function isUserAuthenticated(): boolean {
    return isAuthenticated;
}