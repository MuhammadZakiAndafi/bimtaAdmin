-- Create Database
CREATE DATABASE bimta_db;

-- Connect to database
\c bimta_db;

-- Create ENUM Types
CREATE TYPE role_enum AS ENUM ('mahasiswa', 'dosen', 'admin');
CREATE TYPE status_user_enum AS ENUM ('active', 'inactive');
CREATE TYPE status_bimbingan_enum AS ENUM ('ongoing', 'done', 'warning', 'terminated');
CREATE TYPE status_jadwal_enum AS ENUM ('waiting', 'accepted', 'declined');
CREATE TYPE status_progress_enum AS ENUM ('unread', 'read', 'need_revision', 'done');
CREATE TYPE jenis_bimbingan_enum AS ENUM ('offline', 'online');

-- Create Tables
CREATE TABLE referensi_ta (
    nim_mahasiswa VARCHAR(25) PRIMARY KEY,
    nama_mahasiswa VARCHAR(255) NOT NULL,
    judul VARCHAR(255) NOT NULL,
    doc_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE users (
    user_id VARCHAR(100) PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    no_whatsapp VARCHAR(25) NOT NULL,
    sandi VARCHAR(255) NOT NULL,
    role role_enum NOT NULL,
    photo_url TEXT NOT NULL,
    status_user status_user_enum NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

CREATE TABLE bimbingan (
    bimbingan_id VARCHAR(255) PRIMARY KEY,
    dosen_id VARCHAR(100) NOT NULL,
    mahasiswa_id VARCHAR(100) NOT NULL,
    status_bimbingan status_bimbingan_enum NOT NULL,
    total_bimbingan INTEGER NOT NULL,
    FOREIGN KEY (dosen_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (mahasiswa_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE jadwal (
    bimbingan_id VARCHAR(255) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    lokasi TEXT NOT NULL,
    note_mahasiswa TEXT NOT NULL,
    note_dosen TEXT,
    status_jadwal status_jadwal_enum NOT NULL,
    PRIMARY KEY (bimbingan_id, datetime),
    FOREIGN KEY (bimbingan_id) REFERENCES bimbingan(bimbingan_id) ON DELETE CASCADE
);

CREATE TABLE progress (
    progress_id VARCHAR(255) PRIMARY KEY,
    bimbingan_id VARCHAR(255) NOT NULL,
    datetime TIMESTAMP NOT NULL,
    subject_progress VARCHAR(255) NOT NULL,
    file_progress TEXT NOT NULL,
    submit_at TIMESTAMP NOT NULL,
    file_koreksi TEXT,
    koreksi_at TIMESTAMP,
    evaluasi_dosen TEXT,
    note_mahasiswa TEXT,
    status_progress status_progress_enum NOT NULL,
    jenis_bimbingan jenis_bimbingan_enum NOT NULL,
    revisi_number INTEGER NOT NULL,
    parent_progress_id VARCHAR(255),
    FOREIGN KEY (bimbingan_id) REFERENCES bimbingan(bimbingan_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_progress_id) REFERENCES progress(progress_id) ON DELETE SET NULL
);

-- Create Indexes for better performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status_user);
CREATE INDEX idx_bimbingan_dosen ON bimbingan(dosen_id);
CREATE INDEX idx_bimbingan_mahasiswa ON bimbingan(mahasiswa_id);
CREATE INDEX idx_bimbingan_status ON bimbingan(status_bimbingan);
CREATE INDEX idx_progress_bimbingan ON progress(bimbingan_id);
CREATE INDEX idx_progress_datetime ON progress(datetime);

-- Insert default admin account
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
VALUES (
    'admin001',
    'Admin BIMTA',
    '081234567890',
    '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK',
    'admin',
    '/uploads/photos/default-avatar.png',
    'active',
    NOW(),
    NOW()
);

-- Insert sample data for testing

-- Insert sample dosen
INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
VALUES 
    ('dosen001', 'Dr. Budi Santoso', '081234567891', '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK', 'dosen', '/uploads/photos/default-avatar.png', 'active', NOW(), NOW()),
    ('dosen002', 'Dr. Siti Nurhaliza', '081234567892', '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK', 'dosen', '/uploads/photos/default-avatar.png', 'active', NOW(), NOW()),
    ('dosen003', 'Prof. Ahmad Dahlan', '081234567893', '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK', 'dosen', '/uploads/photos/default-avatar.png', 'active', NOW(), NOW());

-- Insert sample mahasiswa
INSERT INTO users (user_id, nama, no_whatsapp, sandi, role, photo_url, status_user, created_at, updated_at)
VALUES 
    ('2021110001', 'Andi Pratama', '081234567894', '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK', 'mahasiswa', '/uploads/photos/default-avatar.png', 'active', NOW(), NOW()),
    ('2021110002', 'Dewi Lestari', '081234567895', '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK', 'mahasiswa', '/uploads/photos/default-avatar.png', 'active', NOW(), NOW()),
    ('2021110003', 'Rudi Hermawan', '081234567896', '$2a$10$xKqVZ8YJqKZqKZqKZqKZqOxKqVZ8YJqKZqKZqKZqKZqKZqKZqKZqK', 'mahasiswa', '/uploads/photos/default-avatar.png', 'active', NOW(), NOW());

-- Insert sample bimbingan
INSERT INTO bimbingan (bimbingan_id, dosen_id, mahasiswa_id, status_bimbingan, total_bimbingan)
VALUES 
    ('BIM-2024-001', 'dosen001', '2021110001', 'ongoing', 5),
    ('BIM-2024-002', 'dosen002', '2021110002', 'ongoing', 3),
    ('BIM-2024-003', 'dosen003', '2021110003', 'done', 10);

-- Insert sample referensi TA
INSERT INTO referensi_ta (nim_mahasiswa, nama_mahasiswa, judul, doc_url, created_at, updated_at)
VALUES 
    ('2020110001', 'Agus Setiawan', 'Sistem Informasi Manajemen Perpustakaan Berbasis Web', '/uploads/documents/sample-ta-1.pdf', NOW(), NOW()),
    ('2020110002', 'Rina Kusuma', 'Aplikasi Mobile Learning Berbasis Android', '/uploads/documents/sample-ta-2.pdf', NOW(), NOW());

COMMIT;