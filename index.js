import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3000;

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.SSL_CA_PATH, 'utf8')
  },
};

const client = new pg.Client(config);

async function connectToDatabase() {
  try {
    await client.connect();
    const res = await client.query('SELECT VERSION()');
    console.log(res.rows[0].version);
  } catch (err) {
    console.error('Error during database connection or query execution:', err);
  } finally {
    await client.end();
  }
}

connectToDatabase();

app.post("/volume", async (req, res) => {
    const { productionDate, productionVolume } = req.body;
    console.log(productionDate, productionVolume);

    res.status(200).json({ message: "Volume data received successfully", productionDate, productionVolume });
});

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
