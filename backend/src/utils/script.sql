DROP TABLE IF EXISTS borrowings;

DROP TABLE IF EXISTS books;

DROP TABLE IF EXISTS categories;

DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE
    users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

CREATE TABLE
    books (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(100) NOT NULL,
        category_id INT,
        difficulty ENUM ('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
        status ENUM ('to-read', 'in-progress', 'completed') NOT NULL DEFAULT 'to-read',
        publication_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
    );

CREATE INDEX idx_books_category ON books (category_id);

CREATE TABLE
    borrowings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        book_id INT NOT NULL,
        borrow_date DATE NOT NULL,
        due_date DATE NOT NULL,
        return_date DATE,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (book_id) REFERENCES books (id)
    );

CREATE INDEX idx_borrowings_user ON borrowings (user_id);

CREATE INDEX idx_borrowings_book ON borrowings (book_id);

CREATE INDEX idx_borrowings_dates ON borrowings (borrow_date, due_date, return_date);

-- Sample users
INSERT INTO
    users (name, email, password)
VALUES
    ('John Doe', 'john.doe@example.com', 'password123'),
    (
        'Jane Smith',
        'jane.smith@example.com',
        'password123'
    ),
    (
        'Bob Johnson',
        'bob.johnson@example.com',
        'password123'
    ),
    (
        'Alice Brown',
        'alice.brown@example.com',
        'password123'
    ),
    (
        'Charlie Davis',
        'charlie.davis@example.com',
        'password123'
    );

-- Sample categories
INSERT INTO
    categories (name, description)
VALUES
    (
        'JavaScript',
        'Books about JavaScript programming language and related frameworks.'
    ),
    (
        'Python',
        'Books about Python programming language and related libraries.'
    ),
    (
        'Web Development',
        'Books about web development technologies and methodologies.'
    ),
    (
        'DevOps',
        'Books about DevOps practices, tools, and methodologies.'
    ),
    (
        'Data Science',
        'Books about data science, machine learning, and analytics.'
    ),
    (
        'Databases',
        'Books about database systems and technologies.'
    ),
    (
        'Mobile Development',
        'Books about mobile app development for iOS and Android.'
    ),
    (
        'Security',
        'Books about cybersecurity, ethical hacking, and secure coding.'
    );

-- Sample books
INSERT INTO
    books (
        title,
        author,
        category_id,
        difficulty,
        status,
        publication_date
    )
VALUES
    (
        'JavaScript: The Good Parts',
        'Douglas Crockford',
        1,
        'intermediate',
        'completed',
        '2008-05-01'
    ),
    (
        'Eloquent JavaScript',
        'Marijn Haverbeke',
        1,
        'beginner',
        'in-progress',
        '2018-12-04'
    ),
    (
        'Python Crash Course',
        'Eric Matthes',
        2,
        'beginner',
        'completed',
        '2019-05-03'
    ),
    (
        'Learning React',
        'Alex Banks & Eve Porcello',
        1,
        'intermediate',
        'to-read',
        '2020-06-12'
    ),
    (
        'Clean Code',
        'Robert C. Martin',
        3,
        'advanced',
        'completed',
        '2008-08-01'
    ),
    (
        'Docker in Action',
        'Jeff Nickoloff',
        4,
        'intermediate',
        'in-progress',
        '2019-11-10'
    ),
    (
        'Hands-On Machine Learning',
        'Aurélien Géron',
        5,
        'advanced',
        'to-read',
        '2019-10-15'
    ),
    (
        'PostgreSQL for Beginners',
        'John Doe',
        6,
        'beginner',
        'completed',
        '2020-01-15'
    ),
    (
        'iOS Programming: The Big Nerd Ranch Guide',
        'Christian Keur',
        7,
        'advanced',
        'to-read',
        '2020-02-10'
    ),
    (
        'Web Security for Developers',
        'Malcolm McDonald',
        8,
        'intermediate',
        'to-read',
        '2020-03-20'
    );

-- Sample borrowings
INSERT INTO
    borrowings (
        user_id,
        book_id,
        borrow_date,
        due_date,
        return_date
    )
VALUES
    (1, 1, '2023-01-05', '2023-01-19', '2023-01-18'),
    (2, 1, '2023-02-01', '2023-02-15', '2023-02-10'),
    (3, 1, '2023-03-10', '2023-03-24', '2023-03-20'),
    (4, 2, '2023-01-15', '2023-01-29', '2023-01-28'),
    (5, 3, '2023-02-05', '2023-02-19', '2023-02-15'),
    (1, 4, '2023-03-01', '2023-03-15', NULL),
    (2, 5, '2023-01-20', '2023-02-03', '2023-02-01'),
    (3, 6, '2023-02-15', '2023-03-01', '2023-02-25'),
    (4, 7, '2023-03-05', '2023-03-19', NULL),
    (5, 8, '2023-01-25', '2023-02-08', '2023-02-05'),
    (1, 9, '2023-02-10', '2023-02-24', '2023-02-20'),
    (2, 10, '2023-03-15', '2023-03-29', NULL),
    (3, 2, '2023-01-10', '2023-01-24', '2023-01-22'),
    (4, 3, '2023-02-20', '2023-03-06', '2023-03-05'),
    (5, 4, '2023-03-20', '2023-04-03', NULL);