-- EduManager Supabase Schema Migration

-- 1. Establishments
CREATE TABLE establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- PRIMAIRE, COLLEGE, LYCEE
    address TEXT,
    phone TEXT,
    logo_url TEXT,
    grading_config JSONB DEFAULT '{"interro": 25, "devoir": 25, "compo": 50}',
    period_type TEXT DEFAULT 'TRIMESTRE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users (extending auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    is_super_admin BOOLEAN DEFAULT false,
    can_generate_bulletins BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE -- SUPER_ADMIN, PROVISEUR, CENSEUR, SECRETAIRE, ENSEIGNANT
);

-- 4. User Roles Mapping
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    UNIQUE(user_id, role_id, establishment_id)
);

-- 5. Academic Years
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label TEXT NOT NULL, -- e.g., 2024-2025
    is_active BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Classes
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., 6ème A
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE
);

-- 7. Subjects
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    coefficient INTEGER DEFAULT 1,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE
);

-- 8. Teacher Assignments
CREATE TABLE teacher_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE
);

-- 9. Students
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE,
    gender CHAR(1),
    address TEXT,
    phone TEXT,
    email TEXT,
    photo_url TEXT,
    registration_number TEXT UNIQUE,
    establishment_id UUID REFERENCES establishments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Student Enrollments
CREATE TABLE student_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE,
    UNIQUE(student_id, academic_year_id)
);

-- 11. Periods
CREATE TABLE periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- Trimestre 1, Semestre 1
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT false,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE CASCADE
);

-- 12. Grades (Compiled)
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    period_id UUID REFERENCES periods(id) ON DELETE CASCADE,
    interro_avg NUMERIC(4,2),
    devoir_avg NUMERIC(4,2),
    compo_grade NUMERIC(4,2),
    period_avg NUMERIC(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Initial Roles
INSERT INTO roles (name) VALUES ('SUPER_ADMIN'), ('PROVISEUR'), ('CENSEUR'), ('SECRETAIRE'), ('ENSEIGNANT');
