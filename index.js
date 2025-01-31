import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3000;

app.post("/volume", async(req,res)=>{
    const {productionDate, productionVolume} = req.body;
    console.log(productionDate, productionVolume);
})

app.listen(port, () => {
    console.log(`Server running on ${port}`);
});
