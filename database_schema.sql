-- Database Schema for Church Management System
-- Compatible with PostgreSQL

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ZONES
-- Represents geographic areas for HBS (Home Based Fellowship) groups.
-- -----------------------------------------------------------------------------
CREATE TABLE zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    area_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 2. GROUPS (Cells/HBS)
-- Small groups that meet regularly.
-- -----------------------------------------------------------------------------
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    leader_id UUID, -- Forward reference to users table, added as alter constraint later
    location VARCHAR(255),
    meeting_day VARCHAR(20),
    meeting_time TIME,
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Planning'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 3. USERS (Members, Leaders, Admins)
-- Core entity for all system users.
-- Role hierarchy: Member < Cell Leader < Zone Leader < Pastor/Admin
-- Counselor is a dynamic role based on assignments.
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('Member', 'Cell Leader', 'Zone Leader', 'Admin', 'Pastor');
CREATE TYPE user_status AS ENUM ('Active', 'Transferred', 'Inactive');
CREATE TYPE gender_type AS ENUM ('Male', 'Female');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id VARCHAR(50) UNIQUE, -- e.g. "2024001"
    
    -- Authentication & System Info
    password_hash VARCHAR(255),
    role user_role DEFAULT 'Member',
    status user_status DEFAULT 'Active',
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    gender gender_type,
    birth_date DATE,
    nationality VARCHAR(100) DEFAULT 'Ethiopian',
    photo_url TEXT,
    
    -- Contact Information
    mobile_phone VARCHAR(50),
    extra_mobile VARCHAR(50),
    home_phone VARCHAR(50),
    work_phone VARCHAR(50),
    primary_email VARCHAR(150),
    secondary_email VARCHAR(150),
    
    -- Address
    sub_city VARCHAR(100),
    suburb VARCHAR(100),
    district VARCHAR(100),
    house_number VARCHAR(50),
    city VARCHAR(100),
    country VARCHAR(100),
    
    -- Structure / Ministry Assignments
    assigned_group_id UUID REFERENCES groups(id) ON DELETE SET NULL, -- Member belongs to this group
    assigned_counselor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Member is counseled by this user
    
    -- Spiritual / Ministry Details
    religious_background TEXT,
    date_of_salvation DATE,
    is_baptized BOOLEAN DEFAULT FALSE,
    baptism_date DATE,
    previous_church_name VARCHAR(150),
    
    -- Marriage
    marital_status VARCHAR(50), -- Single, Married, Divorced, Widowed
    spouse_name VARCHAR(150),
    marriage_date DATE,
    
    -- Professional
    occupation VARCHAR(100),
    professional_status VARCHAR(100),
    
    -- Metadata
    registration_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Foreign Key for Group Leader (circular dependency resolution)
ALTER TABLE groups ADD CONSTRAINT fk_group_leader FOREIGN KEY (leader_id) REFERENCES users(id) ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- 4. CHILDREN
-- Dependents of members.
-- -----------------------------------------------------------------------------
CREATE TABLE children (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    gender gender_type,
    birth_date DATE,
    is_christian BOOLEAN DEFAULT FALSE,
    is_member BOOLEAN DEFAULT FALSE,
    mobile_number VARCHAR(50)
);

-- -----------------------------------------------------------------------------
-- 5. EDUCATION_HISTORY
-- Educational background of members.
-- -----------------------------------------------------------------------------
CREATE TABLE education_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    institution VARCHAR(150),
    level VARCHAR(100), -- High School, Bachelor, Master, PhD
    type VARCHAR(100),
    start_year VARCHAR(4),
    end_year VARCHAR(4)
);

-- -----------------------------------------------------------------------------
-- 6. PASTORAL_NOTES
-- Records of visitations, counseling logs, and follow-ups.
-- -----------------------------------------------------------------------------
CREATE TABLE pastoral_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- The subject of the note
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- The pastor/leader writing the note
    
    title VARCHAR(200),
    content TEXT,
    note_type VARCHAR(50), -- 'visitation', 'phone', 'counseling', 'redFlag'
    location VARCHAR(100), -- 'Home Visit', 'Office'
    category VARCHAR(100),
    
    is_red_flag BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'read', 'replied'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- 7. HBS_SESSIONS
-- Attendance tracking for cell groups.
-- -----------------------------------------------------------------------------
CREATE TABLE hbs_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    topic VARCHAR(200),
    discussion_leader_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'Scheduled', -- 'Scheduled', 'Completed', 'Cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_attendance (
    session_id UUID NOT NULL REFERENCES hbs_sessions(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_present BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (session_id, member_id)
);

-- -----------------------------------------------------------------------------
-- 8. COUNSELING_ASSIGNMENTS (Optional / Historic)
-- While users.assigned_counselor_id holds the current active counselor,
-- this table can track history or complex assignments.
-- -----------------------------------------------------------------------------
CREATE TABLE counseling_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counselor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    counselee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'Active',
    notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_group ON users(assigned_group_id);
CREATE INDEX idx_users_counselor ON users(assigned_counselor_id);
CREATE INDEX idx_pastoral_notes_member ON pastoral_notes(member_id);
