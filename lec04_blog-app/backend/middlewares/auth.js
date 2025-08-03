const { validToken } = require("../utils/generateToken")

async function verifyUser(req, res, next) {
    // try-catch mei error handling karo  -> server chalta rehna chahiye 
    try {
        // token verify
        // extract token from headers
        let token = req.headers.authorization.split(" ")[1];
        // console.log("Token:", token);

        // if token is not there -> early return
        if (!token) {
            res.status(400).json({
                "success": false,
                "message": "Please Sign in"
            })
        }

        // if token is there -> check token validity
        try {
            const userData = validToken(token)
                // if userData not there -> early return
            if (!userData) {
                res.status(400).json({
                    "success": false,
                    "message": "Please Sign in"
                })
            }

            // set user id extracted via token to custom request property
            req.user = userData.id;

            // if token valid -> call controller
            next()

        } catch (err) {
            res.status(500).json({
                "success": false,
                "message": "Error verifying user",
                "error": err.message
            })

        }
    } catch (error) {
        res.status(500).json({
            "success": false,
            "message": "Token missing",
            "error": error.message
        })
    }



    // pass control to next function
    // valid user -> next, otherwise -> early return
    // next();

}

module.exports = verifyUser;