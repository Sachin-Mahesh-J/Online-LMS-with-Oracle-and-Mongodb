create user lms identified by lms1234;

grant create session to lms;
grant create table to lms;
grant create view to lms;
grant create procedure to lms;
grant create sequence to lms;
grant create trigger to lms;

alter user lms
   quota unlimited on users;