// import express
const express = require("express");

// import mongoose
const mongoose = require("mongoose");


// create server
const app = express();


// connect db function (cloud par bhi database hoga isiliye time lagega, asyncronously handle karo)
async function connectDB() {
    await mongoose.connect("mongodb://localhost:27017/myFirstDB")
    console.log("Database connected successfully..")
}

// schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },

})

// creating model
const User = mongoose.model("user", userSchema);


async function crudUser() {
    // insert/create user in db
    const newUser = await User.create({
            name: "Shoaib",
            email: "demo@gmail.com",
            password: "123"
        })
        // or
        // const newUser = new User({
        //     name: "Rohit",
        //     email: "example@gmail.com",
        //     password: "123"
        // })
        // await newUser.save();

    // get/read/retrieve user from db
    // const newUser = await User.find({})
    // const newUser = await User.findOne({ name: "Shoaib" })
    // const newUser = await User.findById("67b358359bd4a4a05b000af2")

    // update user from db
    // new flag use karo updated wala chahiye toh
    // const newUser = await User.findByIdAndUpdate("67b358359bd4a4a05b000af2", { name: "Rohit" }, { new: true })

    // delete user from db
    // const newUser = await User.findByIdAndDelete("67b358359bd4a4a05b000af2")

    console.log(newUser)
}


// listen to server
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
    // connect to DB (server start hone ke baad)
    connectDB();
    // create user
    crudUser();
});