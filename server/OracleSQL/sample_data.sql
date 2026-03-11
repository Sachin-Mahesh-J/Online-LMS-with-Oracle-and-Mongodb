insert into students (
   first_name,
   last_name,
   email,
   phone,
   date_of_birth
) values ( 'John',
           'Silva',
           'john@example.com',
           '0771234567',
           date '2002-05-14' );

insert into students (
   first_name,
   last_name,
   email,
   phone,
   date_of_birth
) values ( 'Nimal',
           'Perera',
           'nimal@example.com',
           '0779876543',
           date '2001-11-20' );

insert into instructors (
   first_name,
   last_name,
   email,
   phone,
   specialization
) values ( 'Kasun',
           'Fernando',
           'kasun@example.com',
           '0711234567',
           'Database Systems' );

insert into instructors (
   first_name,
   last_name,
   email,
   phone,
   specialization
) values ( 'Ayesha',
           'Jayasuriya',
           'ayesha@example.com',
           '0724567890',
           'Web Development' );

insert into courses (
   instructor_id,
   course_title,
   description,
   category,
   fee,
   duration_weeks,
   level_name
) values ( 1,
           'Database Management Fundamentals',
           'Introduction to databases and SQL',
           'Data Management',
           15000,
           8,
           'BEGINNER' );

insert into courses (
   instructor_id,
   course_title,
   description,
   category,
   fee,
   duration_weeks,
   level_name
) values ( 2,
           'Full Stack Web Basics',
           'Introductory web application development',
           'Web Development',
           18000,
           10,
           'INTERMEDIATE' );

insert into modules (
   course_id,
   module_title,
   module_description,
   module_order,
   duration_hours
) values ( 1,
           'Introduction to Databases',
           'Basic DB concepts',
           1,
           4 );

insert into modules (
   course_id,
   module_title,
   module_description,
   module_order,
   duration_hours
) values ( 1,
           'SQL Basics',
           'DDL and DML commands',
           2,
           6 );

insert into modules (
   course_id,
   module_title,
   module_description,
   module_order,
   duration_hours
) values ( 2,
           'HTML CSS Basics',
           'Frontend foundations',
           1,
           5 );

insert into modules (
   course_id,
   module_title,
   module_description,
   module_order,
   duration_hours
) values ( 2,
           'JavaScript Essentials',
           'Programming for the web',
           2,
           7 );

insert into enrollments (
   student_id,
   course_id,
   completion_status,
   progress_percent
) values ( 1,
           1,
           'IN_PROGRESS',
           60 );

insert into enrollments (
   student_id,
   course_id,
   completion_status,
   progress_percent
) values ( 2,
           2,
           'ENROLLED',
           10 );

insert into payments (
   enrollment_id,
   amount,
   payment_method,
   payment_status
) values ( 1,
           15000,
           'CARD',
           'PAID' );

insert into payments (
   enrollment_id,
   amount,
   payment_method,
   payment_status
) values ( 2,
           18000,
           'BANK_TRANSFER',
           'PENDING' );

commit;