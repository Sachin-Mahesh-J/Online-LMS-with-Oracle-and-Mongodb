import bcrypt from "bcrypt";

const generate = async () => {
  console.log("Student123! =>", await bcrypt.hash("Student123!", 10));
  console.log("Instructor123! =>", await bcrypt.hash("Instructor123!", 10));
  console.log("Admin123! =>", await bcrypt.hash("Admin123!", 10));
};

generate();
