import { api, Book, Category } from './api';
import { showToast } from './ui';
import { isUserAuthenticated } from './auth';

let categories: Category[] = [];
let books: Book[] = []; // 🛠️ THE FIX — Declare books here
let currentPage = 1;
let totalPages = 1;

export function setupBooks() {
    const booksGrid = document.getElementById('books-grid')!;
    const addBookBtn = document.getElementById('add-book-btn')!;
    const bookModal = document.getElementById('book-modal')!;
    const bookForm = document.getElementById('book-form')! as HTMLFormElement;
    const cancelBook = document.getElementById('cancel-book')!;
    const categoryFilter = document.getElementById('category-filter')! as HTMLSelectElement;
    const difficultyFilter = document.getElementById('difficulty-filter')! as HTMLSelectElement;
    const prevPageBtn = document.getElementById('prev-page')! as HTMLButtonElement;
    const nextPageBtn = document.getElementById('next-page')! as HTMLButtonElement;
    const currentPageSpan = document.getElementById('current-page')!;
    const totalPagesSpan = document.getElementById('total-pages')!;

    let editingBookId: number | null = null;

    async function loadBooks() {
        try {
            const params: Record<string, string> = {
                page: currentPage.toString(),
                limit: '9',
            };

            if (categoryFilter.value) params.category = categoryFilter.value;
            if (difficultyFilter.value) params.difficulty = difficultyFilter.value;

            const response = await api.getBooks(params);
            books = response.data;
            renderBooks(books);

            totalPages = response.pagination.pages;
            currentPageSpan.textContent = currentPage.toString();
            totalPagesSpan.textContent = totalPages.toString();

            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages;
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    }

    async function loadCategories() {
        try {
            categories = await api.getCategories();

            categoryFilter.innerHTML = '<option value="">All Categories</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

            const bookCategory = document.getElementById('book-category')!;
            bookCategory.innerHTML = '<option value="">Select Category</option>' +
                categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    }

    function renderBooks(books: Book[]) {
        booksGrid.innerHTML = books.map(book => `
      <div class="book-card">
        <h3 class="text-lg font-semibold mb-2">${book.title}</h3>
        <p class="text-gray-600 mb-3">by ${book.author}</p>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="badge">${book.category_name || 'Uncategorized'}</span>
          <span class="badge badge-${book.difficulty}">${book.difficulty}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="badge badge-${book.status}">${book.status}</span>
          ${isUserAuthenticated() ? `
            <div class="space-x-2">
              <button class="text-blue-600 hover:text-blue-800" onclick="editBook(${book.id})">Edit</button>
              <button class="text-red-600 hover:text-red-800" onclick="deleteBook(${book.id})">Delete</button>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
    }

    function showBookModal(book?: Book) {
        if (!isUserAuthenticated()) {
            showToast('Please log in to manage books', 'error');
            return;
        }

        editingBookId = book?.id || null;
        const title = document.getElementById('book-title') as HTMLInputElement;
        const author = document.getElementById('book-author') as HTMLInputElement;
        const category = document.getElementById('book-category') as HTMLSelectElement;
        const difficulty = document.getElementById('book-difficulty') as HTMLSelectElement;
        const status = document.getElementById('book-status') as HTMLSelectElement;
        const date = document.getElementById('book-date') as HTMLInputElement;

        if (book) {
            title.value = book.title;
            author.value = book.author;
            category.value = book.category_id.toString();
            difficulty.value = book.difficulty;
            status.value = book.status;
            date.value = book.publication_date;
        } else {
            bookForm.reset();
        }

        bookModal.classList.remove('hidden');
    }

    async function handleBookSubmit(e: Event) {
        e.preventDefault();

        const bookData = {
            title: (document.getElementById('book-title') as HTMLInputElement).value,
            author: (document.getElementById('book-author') as HTMLInputElement).value,
            category_id: parseInt((document.getElementById('book-category') as HTMLSelectElement).value),
            difficulty: (document.getElementById('book-difficulty') as HTMLSelectElement).value,
            status: (document.getElementById('book-status') as HTMLSelectElement).value,
            publication_date: (document.getElementById('book-date') as HTMLInputElement).value,
        } as Book;

        try {
            if (editingBookId) {
                await api.updateBook(editingBookId, bookData);
                showToast('Book updated successfully!');
            } else {
                await api.createBook(bookData);
                showToast('Book added successfully!');
            }

            bookModal.classList.add('hidden');
            loadBooks();
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    }

    async function deleteBook(id: number) {
        if (!confirm('Are you sure you want to delete this book?')) return;

        try {
            await api.deleteBook(id);
            showToast('Book deleted successfully!');
            loadBooks();
        } catch (error) {
            showToast((error as Error).message, 'error');
        }
    }

    addBookBtn.addEventListener('click', () => showBookModal());
    cancelBook.addEventListener('click', () => bookModal.classList.add('hidden'));
    bookForm.addEventListener('submit', handleBookSubmit);

    categoryFilter.addEventListener('change', () => {
        currentPage = 1;
        loadBooks();
    });

    difficultyFilter.addEventListener('change', () => {
        currentPage = 1;
        loadBooks();
    });

    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadBooks();
        }
    });

    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadBooks();
        }
    });

    loadCategories();
    loadBooks();

    (window as any).editBook = (id: number) => {
        const book = books.find(b => b.id === id);
        if (book) showBookModal(book);
    };

    (window as any).deleteBook = deleteBook;
}
