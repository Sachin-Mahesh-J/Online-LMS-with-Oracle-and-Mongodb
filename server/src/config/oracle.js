import oracledb from "oracledb";

const getOracleConnection = async () => {
  return await oracledb.getConnection({
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASSWORD,
    connectString: process.env.ORACLE_CONNECT_STRING,
  });
};

export default getOracleConnection;
