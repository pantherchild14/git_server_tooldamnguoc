import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connection from '../configs/mysqlDb.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { EMAIL, PASSWORD } = req.body;
        if (EMAIL && PASSWORD) {
            const query = "SELECT * FROM user WHERE EMAIL = ?";
            connection.query(query, [EMAIL], async (err, results) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal server error', err });
                }
                if (results.length === 1) {
                    const user = results[0];
                    if (await bcrypt.compare(PASSWORD, user.PASSWORD)) {
                        // Generate token
                        const token = jwt.sign({ userID: user.id }, "pleaseSubscribe", {
                            expiresIn: "2d",
                        });
                        return res.status(200).json({
                            message: "Login Successfully",
                            token: token,
                            USER_NAME: user.USER_NAME,
                            EMAIL: user.EMAIL,
                            ROLE: user.ROLE
                        });
                    } else {
                        return res.status(400).json({ message: "Invalid Credentials" });
                    }
                } else {
                    return res.status(400).json({ message: "User Not Registered" });
                }
            });
        } else {
            return res.status(400).json({ message: "All fields are required" });
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
});

export default router;
