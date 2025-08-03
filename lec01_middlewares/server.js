// MIDDLEWARE - BEECH KA AADMI

// import express
const express = require('express');

// create server
const app = express();

// fs module
const fs = require("node:fs");

// yeh log karega ki kisne kis time par request maari
function logger(req, res, next) {
    const data = new Date().toLocaleString() + " route: " + req.url + " method: " + req.method;
    // console.log(`Route ${req.url} hits at ${date}`);
    // append kardo
    fs.appendFile("./logFile.txt", `${data}\n`, (err) => {
            console.log(err);
        })
        // next par joh bhi ho usko control paas kardo
    next();
}

function func1(req, res, next) {
    console.log("hello 1");
    // response bhej doge toh yahin se return kar jaayega, next par jaayega hi nahi, isiliye console karo
    // res.send("hello 1")
    // middleware request ko modify bhi kar sakta hai
    req.skill = "mern"
    next();
}

function func2(req, res, next) {
    req.role = "coder"
    console.log("hello 2");
    next();

}

// middleware
app.use(func1)
app.use(func2)

// middleware
// app.use(logger)

// built-in middleware
// js object ko parse kar dega json string mei, stringify ka kaam karega
app.use(express.json())
    // text wala bhi hai
    // app.use(express.text());

// app.use(express.urlencoded({ extended: false }))

// routes
app.get("/blog", logger, (req, res, next) => {
    try {
        throw new Error("error aa gaya hai...");
        // res.send("get request")
    } catch (err) {
        console.log("Error: ", err);
        // next();
        // generally yahi handle kar lete hai, next ka use kam karte hai
        return res.status(500).json({ message: "server error, please try again...!" })
    }
})

// "logger" ek middleware hai joh single route par hai, yeh globally execute nahi hoga kyuki route level par define kiya gaya hai
// "logger ek baari define ho gaya toh ab use multiple jagah use kar sakte ho, multiple request (routes) par
app.post("/blog", logger, (req, res) => {
    // console.log(req.skill);
    // console.log(req.role);
    console.log(req.body);
    res.status(200).json({ message: "post method" })
})



// route pe error handle middleware
app.use((req, res, next) => {
    next("dummy");
    res.status(500).json({ message: "error occurred" })
    next("dummy");
})

// error middleware (global level par)
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke!')
    next();
})


// listen on server
app.listen(3000, () => {
    console.log(`Server is listening on port https://localhost:3000`);
})