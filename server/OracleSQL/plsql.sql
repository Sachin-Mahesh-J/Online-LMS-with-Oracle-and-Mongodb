   SET SERVEROUTPUT ON;

-- =========================================
-- 1. Procedure: enroll a student in a course
-- =========================================
create or replace procedure enroll_student (
   p_student_id in enrollments.student_id%type,
   p_course_id  in enrollments.course_id%type
) as
   v_count number;
begin
    -- check student exists
   select count(*)
     into v_count
     from students
    where student_id = p_student_id;

   if v_count = 0 then
      raise_application_error(
         -20001,
         'Student does not exist.'
      );
   end if;

    -- check course exists
   select count(*)
     into v_count
     from courses
    where course_id = p_course_id;

   if v_count = 0 then
      raise_application_error(
         -20002,
         'Course does not exist.'
      );
   end if;

    -- check duplicate enrollment
   select count(*)
     into v_count
     from enrollments
    where student_id = p_student_id
      and course_id = p_course_id;

   if v_count > 0 then
      raise_application_error(
         -20003,
         'Student is already enrolled in this course.'
      );
   end if;
   insert into enrollments (
      student_id,
      course_id,
      enrollment_date,
      completion_status,
      progress_percent
   ) values ( p_student_id,
              p_course_id,
              sysdate,
              'ENROLLED',
              0 );

   dbms_output.put_line('Student enrolled successfully.');
end;
/
SHOW ERRORS;


-- =========================================
-- 2. Procedure: record a payment
-- =========================================
create or replace procedure record_payment (
   p_enrollment_id  in payments.enrollment_id%type,
   p_amount         in payments.amount%type,
   p_payment_method in payments.payment_method%type,
   p_payment_status in payments.payment_status%type
) as
   v_count number;
begin
   -- check enrollment exists
   select count(*)
     into v_count
     from enrollments
    where enrollment_id = p_enrollment_id;

   if v_count = 0 then
      raise_application_error(
         -20004,
         'Enrollment does not exist.'
      );
   end if;

   -- prevent new payments after a successful payment already exists
   select count(*)
     into v_count
     from payments
    where enrollment_id = p_enrollment_id
      and payment_status = 'PAID';

   if v_count > 0 then
      raise_application_error(
         -20008,
         'A successful payment already exists for this enrollment.'
      );
   end if;
   insert into payments (
      enrollment_id,
      amount,
      payment_date,
      payment_method,
      payment_status
   ) values ( p_enrollment_id,
              p_amount,
              sysdate,
              p_payment_method,
              p_payment_status );

   dbms_output.put_line('Payment recorded successfully.');
end;
/
show errors;


-- =========================================
-- 3. Function: get total paid by a student
-- =========================================
create or replace function get_student_total_payments (
   p_student_id in students.student_id%type
) return number as
   v_total number := 0;
begin
   select nvl(
      sum(p.amount),
      0
   )
     into v_total
     from payments p
     join enrollments e
   on p.enrollment_id = e.enrollment_id
    where e.student_id = p_student_id
      and p.payment_status = 'PAID';

   return v_total;
end;
/
SHOW ERRORS;


-- =========================================
-- 4. Trigger: after a successful payment,
--    update enrollment status/progress
-- =========================================
create or replace trigger trg_update_enrollment_after_payment after
   insert on payments
   for each row
begin
   if :new.payment_status = 'PAID' then
      update enrollments
         set completion_status = 'IN_PROGRESS',
             progress_percent =
                case
                   when progress_percent = 0 then
                      10
                   else
                      progress_percent
                end
       where enrollment_id = :new.enrollment_id
         and completion_status = 'ENROLLED';
   end if;
end;
/
SHOW ERRORS;


-- =========================================
-- 5. Trigger: prevent certificate issue
--    unless enrollment is completed
-- =========================================
create or replace trigger trg_check_certificate_completion before
   insert on certifications
   for each row
declare
   v_status enrollments.completion_status%type;
begin
   select completion_status
     into v_status
     from enrollments
    where enrollment_id = :new.enrollment_id;

   if v_status <> 'COMPLETED' then
      raise_application_error(
         -20005,
         'Certificate can only be issued for completed enrollments.'
      );
   end if;
end;
/
SHOW ERRORS;


-- =========================================
-- 6. Procedure: issue certificate
-- =========================================
create or replace procedure issue_certificate (
   p_enrollment_id    in certifications.enrollment_id%type,
   p_certificate_code in certifications.certificate_code%type,
   p_grade            in certifications.grade%type
) as
   v_count number;
begin
    -- check enrollment exists
   select count(*)
     into v_count
     from enrollments
    where enrollment_id = p_enrollment_id;

   if v_count = 0 then
      raise_application_error(
         -20006,
         'Enrollment does not exist.'
      );
   end if;

    -- check certificate not already issued
   select count(*)
     into v_count
     from certifications
    where enrollment_id = p_enrollment_id;

   if v_count > 0 then
      raise_application_error(
         -20007,
         'Certificate already exists for this enrollment.'
      );
   end if;
   insert into certifications (
      enrollment_id,
      certificate_code,
      issue_date,
      grade,
      certificate_status
   ) values ( p_enrollment_id,
              p_certificate_code,
              sysdate,
              p_grade,
              'ISSUED' );

   dbms_output.put_line('Certificate issued successfully.');
end;
/
SHOW ERRORS;


-- =========================================
-- 7. Procedure with cursor:
--    list all students in a course
-- =========================================
create or replace procedure list_students_by_course (
   p_course_id in courses.course_id%type
) as
   cursor c_students is
   select s.student_id,
          s.first_name,
          s.last_name,
          e.completion_status,
          e.progress_percent
     from students s
     join enrollments e
   on s.student_id = e.student_id
    where e.course_id = p_course_id
    order by s.student_id;

   v_student_id        students.student_id%type;
   v_first_name        students.first_name%type;
   v_last_name         students.last_name%type;
   v_completion_status enrollments.completion_status%type;
   v_progress_percent  enrollments.progress_percent%type;
begin
   open c_students;
   loop
      fetch c_students into
         v_student_id,
         v_first_name,
         v_last_name,
         v_completion_status,
         v_progress_percent;
      exit when c_students%notfound;
      dbms_output.put_line('Student ID: '
                           || v_student_id
                           || ', Name: '
                           || v_first_name
                           || ' '
                           || v_last_name
                           || ', Status: '
                           || v_completion_status
                           || ', Progress: '
                           || v_progress_percent || '%');
   end loop;

   close c_students;
end;
/
SHOW ERRORS;