const API_URL = 'http://localhost:6969/api';

export interface Book {
    id?: number;
    title: string;
    author: string;
    category_id: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    status: 'to-read' | 'in-progress' | 'completed';
    publication_date: string;
    category_name?: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    book_count?: number;
}

export interface User {
    id: number;
    name: string;
    email: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export const api = {
    setToken(token: string) {
        localStorage.setItem('token', token);
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    async request(endpoint: string, options: RequestInit = {}) {
        const token = this.getToken();
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        };

        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API request failed');
        }

        return response.json();
    },

    // Auth
    async login(email: string, password: string): Promise<AuthResponse> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    },

    async register(name: string, email: string, password: string): Promise<AuthResponse> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
        });
    },

    // Books
    async getBooks(params: Record<string, string> = {}): Promise<{ data: Book[], pagination: any }> {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/books?${queryString}`);
    },

    async createBook(book: Omit<Book, 'id'>): Promise<Book> {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(book),
        });
    },

    async updateBook(id: number, book: Partial<Book>): Promise<Book> {
        return this.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(book),
        });
    },

    async deleteBook(id: number): Promise<void> {
        return this.request(`/books/${id}`, {
            method: 'DELETE',
        });
    },

    // Categories
    async getCategories(): Promise<Category[]> {
        return this.request('/categories');
    },
};