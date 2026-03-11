-- create index idx_courses_instructor on
--    courses (
--       instructor_id
--    );
-- create index idx_modules_course on
--    modules (
--       course_id
--    );
-- create index idx_enrollments_student on
--    enrollments (
--       student_id
--    );
-- create index idx_enrollments_course on
--    enrollments (
--       course_id
--    );
-- create index idx_payments_enrollment on
--    payments (
--       enrollment_id
--    );
-- -- create index idx_certifications_enrollment on
-- --    certifications (
-- --       enrollment_id
-- --    );

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