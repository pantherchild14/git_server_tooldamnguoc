import dotenv from "dotenv";
import mysql from 'mysql';

dotenv.config();

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tooldamnguoc'
};

const connection = mysql.createConnection(dbConfig);


export default connection;