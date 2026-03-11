import dotenv from "dotenv";
import app from "./app.js";
import connectMongo from "./config/mongo.js";
import getOracleConnection from "./config/oracle.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  let oracleConnection;

  try {
    await connectMongo();

    oracleConnection = await getOracleConnection();
    console.log("Oracle connected");

    await oracleConnection.close();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
