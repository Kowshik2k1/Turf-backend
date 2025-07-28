const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: {type: String, unique: true},
    password: String,
    role: { type : String, enum : ["user", "admin", "manager"], default : "user"}
}, { timestamps: true });

module.exports = mongoose.model("users", userSchema);