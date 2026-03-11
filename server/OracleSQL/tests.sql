-- select *
--   from students;
-- select *
--   from instructors;
-- select *
--   from courses;
-- select *
--   from modules;
-- select *
--   from enrollments;
-- select *
--   from payments;
-- select *
--   from certifications;

-- update enrollments
--    set completion_status = 'COMPLETED',
--        progress_percent = 100
--  where enrollment_id = 1;

-- commit;

-- INSERT INTO certifications (enrollment_id, certificate_code, issue_date, grade, certificate_status)
-- VALUES (1, 'CERT-001', SYSDATE, 'A', 'ISSUED');

-- COMMIT;

-- select *
--   from certifications;

-- begin
--    enroll_student(
--       1,
--       2
--    );
-- end;
-- /
-- SHOW ERRORS;

-- select *
--   from enrollments
--  order by enrollment_id;

-- select object_name,
--        object_type
--   from user_objects
--  where object_type = 'PROCEDURE';

-- BEGIN
--     record_payment(3, 18000, 'CARD', 'PAID');
-- END;
--/

-- SELECT * FROM payments ORDER BY payment_id;
-- SELECT * FROM enrollments ORDER BY enrollment_id;

-- begin
--    record_payment(
--       3,
--       18000,
--       'CARD',
--       'PAID'
--    );
-- end;
-- /

-- select *
--   from payments
--  order by payment_id;
-- select *
--   from enrollments
--  order by enrollment_id;

-- begin
--    enroll_student(
--       1,
--       2
--    );
-- end;
-- /

-- commit;
-- select *
--   from enrollments
--  order by enrollment_id;

-- begin
--    record_payment(
--       21,
--       18000,
--       'CARD',
--       'PAID'
--    );
-- end;
-- /
-- commit;
-- select *
--   from payments
--  order by payment_id;

-- select *
--   from enrollments
--  order by enrollment_id;

-- select get_student_total_payments(1) as total_paid
--   from dual;

-- begin
--    issue_certificate(
--       1,
--       'CERT-001',
--       'A'
--    );
-- end;
-- /
-- commit;

-- select *
--   from certifications;

-- begin
--    issue_certificate(
--       21,
--       'CERT-021',
--       'B'
--    );
-- end;
-- /

-- BEGIN
--     list_students_by_course(2);
-- END;
-- /

-- select *
--   from students;
-- select *
--   from instructors;
-- select *
--   from courses;
-- select *
--   from modules;
-- select *
--   from enrollments;
-- select *
--   from payments;
-- select *
--   from certifications;

-- select object_name,
--        object_type,
--        status
--   from user_objects
--  where object_type in ( 'TABLE',
--                         'INDEX',
--                         'PROCEDURE',
--                         'FUNCTION',
--                         'TRIGGER' )
--  order by object_type,
--           object_name;

-- begin
--    enroll_student(
--       1,
--       2
--    );
-- end;
-- /

-- insert into payments (
--    enrollment_id,
--    amount,
--    payment_method,
--    payment_status
-- ) values ( 1,
--            - 500,
--            'CARD',
--            'PAID' );

-- drop table users cascade constraints;