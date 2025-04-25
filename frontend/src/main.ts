import './index.css';
import { setupAuth } from './auth';
import { setupBooks } from './books';
import { setupUI } from './ui';

document.addEventListener('DOMContentLoaded', () => {
    setupAuth();
    setupBooks();
    setupUI();
});