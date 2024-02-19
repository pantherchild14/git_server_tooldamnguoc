import dotenv from "dotenv";
import mysql from 'mysql';

dotenv.config();

const dbConfig = {
    host: 'localhost',
    user: 'tooldamnguoc',
    password: '8cGF6aGnPmeCkD6b',
    database: 'tooldamnguoc'
};

const connection = mysql.createConnection(dbConfig);


export default connection;