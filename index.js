const app = require("./app");
const connectDB = require("./config/connectDB");
const dotenv = require("dotenv");

dotenv.config();

connectDB();

app.listen(process.env.PORT, ()=>{
    console.log(`Server is running in ${process.env.PORT}`);
})