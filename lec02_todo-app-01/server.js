// import express
const express = require("express");

// create server
const app = express();

// persistent karne ke liye file systam ka use karege
const fs = require("node:fs");

// path module
const path = require("node:path");

// hard-coded todo
// const todos = [{
//         title: "title 1",
//         description: "description 1",
//         isChecked: false,
//     },
//     {
//         title: "title 2",
//         description: "description 2",
//         isChecked: false,
//     },
//     },
//     {
//         title: "title 3",
//         description: "description 3",
//         isChecked: false,
//     },
//     }
// ]

// empty todo
// let todos = [{
//         "title": "todo 1",
//         "description": "description 1",
//         "isChecked": false,
//         "id": 1
//     },
//     {
//         "title": "todo 1",
//         "description": "description 1",
//         "isChecked": false,
//         "id": 2
//     },
//     {
//         "title": "todo 1",
//         "description": "description 1",
//         "isChecked": false,
//         "id": 3
//     },
//     {
//         "title": "todo 1",
//         "description": "description 1",
//         "isChecked": false,
//         "id": 4
//     }
// ];

// middleware (taaki request body ka acaess mil sake)
app.use(express.json());

// routes

// get todos
app.get("/todos", (req, res) => {
    try {
        // file ko read karo
        fs.readFile(path.join(__dirname, "/todos.json"), { encoding: "utf-8" }, (err, todos) => {
            // parse isiliye kar rahe kyuki string mei return karega data file system, string ke saath manipulation nahi kar sakte, wapas JS object mei convert karna padega
            todos = todos ? JSON.parse(todos) : [];
            return res.status(200).json({ todos });
        })
    } catch (error) {
        res.status(500).json({ message: "server error, please try again..." })
    }

})

// post todo
app.post("/todos", (req, res) => {
    // error handling ke liye try-catch use karo, isse server chalta rahega error aane par band nhi hoga
    try {
        // console.log(req.body)
        // const { title, description } = req.body;
        // todo bhejo joh body mei paas ho raha hai
        // todos.push({ title, description });
        //  response mei success message bhej do
        // res.status(200).json({ message: "todo created/added successfully..." });

        // directly req.body bhi pass kar sakte ho, mostly yahi wala use karege
        // todos.push(req.body);
        // response mei success message bhej do
        // res.status(200).json({ message: "todo created/added successfully..." });

        // isCompleted waali field server se add kar sakte ho
        // todos.push({...req.body, isChecked: false, id: todos.length + 1 });
        // // response mei success message bhej do
        // res.status(200).json({ message: "todo created/added successfully..." });

        // using file system
        // pehle file read karo, phir us data mei todo push karke write kardo
        fs.readFile(path.join(__dirname, "/todos.json"), "utf-8", (err, todos) => {

            todos = todos ? JSON.parse(todos) : [];
            todos.push({...req.body, isChecked: false, id: todos.length + 1 });

            // write karo inn mutated todos ko file mei
            fs.writeFile(path.join(__dirname, "/todos.json"), JSON.stringify(todos), { encoding: "utf-8" }, (err) => {
                if (err) {
                    return res.status(500).json({ message: "server error, please try again..." })
                } else {
                    return res.status(200).json({ message: "todo created/added successfully..." });
                }
            })
        })

    } catch (error) {
        res.status(500).json({ message: "server error, please try again..." });
    }

});



// delete todos
// koi specific todo delete karna hai isiliye id bhi paas karni padegi
app.delete("/todos/:id", (req, res) => {
    try {
        // console.log(req.params.id);
        // splice kardo joh id paas ho rahi hai
        // req,params.id string return karega, usko number mei convert karlo
        // todos.splice(Number(req.params.id - 1), 1)

        // deleting using filter method, kyuki id kuch bhi ho sakti (recommended)
        // woh saare todos return karwa do jiski id match nhi karti param id se
        const filteredTodos = todos.filter((todo) => todo.id !== Number(req.params.id));
        // Todos ko filterdTodos se replace kardo
        todos = filteredTodos;
        // or
        // todos = [...filteredTodos];

        res.status(200).json({ message: "todo deleted successfully..." })
    } catch (error) {
        res.status(500).json({ message: "server error, please try again..." })
    }
})

// update todos
// delete ki tarah ismei bhi id paas karni hogi, kisi specific todo ko hi update karege
app.put("/todos/:id", (req, res) => {
    try {
        // uss todo ke index find karo jis todo ko update karna hai, phir index ka use karke todo ko mutate kardo
        const index = todos.findIndex(todo => todo.id == Number(req.params.id))
        console.log(index);
        // joh update karna hai woh request.body mei paas karege
        // phir uss update todo ko replace karna hoga req.body se    
        todos[index] = {...todos[index], ...req.body };
        res.status(200).json({ message: "todo updated successfully..." })

    } catch (error) {
        res.status(500).json({ message: "server error, please try again...!" })
    }
});

// listen on server
app.listen(3000, () => {
    console.log("Server is listening on port https://localhost:3000");
});