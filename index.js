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

const pool = new pg.Pool(config);

async function connectToDatabase() {
  try {
    const res = await pool.query('SELECT VERSION()');
    console.log('PostgreSQL Version:', res.rows[0].version);
  } catch (err) {
    console.error('Error during database connection or query execution:', err);
  }
}

connectToDatabase();

// Get production data
app.get("/productiondata", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM productiondata`);
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching production data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get orders for a specific date
app.get("/orders/:date", async (req, res) => {
  const { date } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM orderdata WHERE order_date = $1`,
      [date]
    );
    res.status(200).json({ data: result.rows });
  } catch (err) {
    console.error("Error fetching order data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


app.post("/volume", async (req, res) => {
  const { productionDate, productionVolume } = req.body;

  if (!productionDate || isNaN(Date.parse(productionDate))) {
    return res.status(400).json({ message: "Invalid or missing production date" });
  }

  if (!productionVolume || isNaN(productionVolume) || productionVolume <= 0) {
    return res.status(400).json({ message: "Invalid or missing production volume" });
  }

  try {
    const existingRecord = await pool.query(
      `SELECT * FROM productiondata WHERE production_date = $1`,
      [productionDate]
    );

    if (existingRecord.rows.length > 0) {
      const updatedVolume = parseFloat(existingRecord.rows[0].production_volume) + parseFloat(productionVolume);
      const result = await pool.query(
        `UPDATE productiondata SET production_volume = $1 WHERE production_date = $2 RETURNING *`,
        [updatedVolume, productionDate]
      );
      res.status(200).json({ message: "Production data updated successfully", data: result.rows[0] });
    } else {
      const result = await pool.query(
        `INSERT INTO productiondata (production_date, production_volume) VALUES ($1, $2) RETURNING *`,
        [productionDate, productionVolume]
      );
      res.status(201).json({ message: "Production data added successfully", data: result.rows[0] });
    }
  } catch (err) {
    console.error("Error processing production data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/order", async (req, res) => {
  const { orderDate, customerName, capColor, volume, quantity, totalVolume } = req.body;

  if (!orderDate || !customerName || !volume || !quantity || !totalVolume) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
  const result = await pool.query(
    `INSERT INTO orderdata (order_date, customer_name, volume, quantity, total_volume, cap_color) 
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [orderDate, customerName, volume, quantity, totalVolume, capColor]
  );
  res.status(201).json({ message: "Order data added successfully", data: result.rows[0] });
} 
  catch (err) {
    console.error("Error inserting order data:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
