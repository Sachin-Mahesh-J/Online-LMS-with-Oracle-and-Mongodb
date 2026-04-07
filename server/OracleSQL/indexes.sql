create index idx_courses_instructor on
   courses (
      instructor_id
   );
create index idx_modules_course on
   modules (
      course_id
   );
create index idx_enrollments_student on
   enrollments (
      student_id
   );
create index idx_enrollments_course on
   enrollments (
      course_id
   );
create index idx_payments_enrollment on
   payments (
      enrollment_id
   );
create index idx_certifications_enrollment on
   certifications (
      enrollment_id
   );

create index idx_courses_instructor on
   courses (
      instructor_id
   );
create index idx_modules_course on
   modules (
      course_id
   );
create index idx_enrollments_student on
   enrollments (
      student_id
   );
create index idx_enrollments_course on
   enrollments (
      course_id
   );
create index idx_payments_enrollment on
   payments (
      enrollment_id
   );
create index idx_certifications_enrollment on
   certifications (
      enrollment_id
   );


create index idx_users_email on
   users (
      email
   );
create index idx_users_role on
   users (
      role
   );
create index idx_users_student_id on
   users (
      student_id
   );
create index idx_users_instructor_id on
   users (
      instructor_id
   );