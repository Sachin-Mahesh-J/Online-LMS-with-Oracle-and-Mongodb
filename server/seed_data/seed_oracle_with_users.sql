merge into users u
using (
   select 'john.silva@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          1 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'ishara.fernando@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          2 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'kamal.peris@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          3 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'nethmi.dias@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          4 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'rashen.g@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          5 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'piumi.w@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          6 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'hasitha.r@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          7 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'dinuki.a@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          8 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'sahan.m@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          9 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'udari.k@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          10 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'thisara.l@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          11 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'amaya.s@student.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'STUDENT' as role,
          12 as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'ayesha.perera@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'INSTRUCTOR' as role,
          cast(null as number) as student_id,
          1 as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'nimal.fernando@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'INSTRUCTOR' as role,
          cast(null as number) as student_id,
          2 as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'kavindi.silva@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'INSTRUCTOR' as role,
          cast(null as number) as student_id,
          3 as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'ruwan.j@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'INSTRUCTOR' as role,
          cast(null as number) as student_id,
          4 as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'malithi.g@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'INSTRUCTOR' as role,
          cast(null as number) as student_id,
          5 as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'tharindu.w@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'INSTRUCTOR' as role,
          cast(null as number) as student_id,
          6 as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

merge into users u
using (
   select 'admin@lms.demo' as email,
          '$2b$10$23jrLrT2SpjGSyJUD0MbQON4YEZeMHtNBaWEvg8gUeWieINfHZD7u' as password_hash,
          'ADMIN' as role,
          cast(null as number) as student_id,
          cast(null as number) as instructor_id,
          'Y' as is_active
     from dual
) s on ( u.email = s.email )
when matched then update
set u.password_hash = s.password_hash,
    u.role = s.role,
    u.student_id = s.student_id,
    u.instructor_id = s.instructor_id,
    u.is_active = s.is_active
when not matched then
insert (
   email,
   password_hash,
   role,
   student_id,
   instructor_id,
   is_active )
values
   ( s.email,
     s.password_hash,
     s.role,
     s.student_id,
     s.instructor_id,
     s.is_active );

commit;