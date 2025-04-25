export function setupUI() {
    const toast = document.getElementById('toast')!;
    const toastMessage = document.getElementById('toast-message')!;
}

export function showToast(message: string, type: 'success' | 'error' = 'success') {
    const toast = document.getElementById('toast')!;
    const toastMessage = document.getElementById('toast-message')!;

    toastMessage.textContent = message;
    toast.classList.remove('translate-y-full');
    toast.classList.add(type === 'error' ? 'bg-red-50' : 'bg-white');
    toastMessage.classList.add(type === 'error' ? 'text-red-800' : 'text-gray-900');

    setTimeout(() => {
        toast.classList.add('translate-y-full');
    }, 3000);
}