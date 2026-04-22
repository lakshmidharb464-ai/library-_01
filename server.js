import userRoutes from "./routes/userRoutes.js";
const express = required("express")
 
const dotEnv = require('dotenv')
const {MangoClient} = require("mongodb+srv://vishnu_db_user:9676303473@cluster0.dlofohl.mongodb.net/?library")
const app = express()

app.use("/api/users", userRoutes);

const PORT = 5000
console.log(process.env)
app.listen(PORT, ()=>{
    console.log('server is running at ${PORT}')
})