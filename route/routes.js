var express = require('express'),
 router = express.Router(),
 promiseQuery = require("../database/librydb"),
 bcrypt = require('bcryptjs'),
 jwt = require('jsonwebtoken'),
 { registerValidation, loginValidation } = require('../validation/validation');
//=========
//Registration Route 
//=========
router.post('/ragister', async(req, res) => {
    // Check user validation
    const error = await registerValidation(req.body);
    if (error) return res.status(400).json({ validateError: error });
    const { userName, email, password } = req.body;

    //Hash password
 var salt = await bcrypt.genSaltSync(10);
 var hash = await bcrypt.hashSync(password, salt);
 var today = new Date();
     //check Email Existence
 const result = await promiseQuery( 'SELECT user_email FROM users WHERE user_email = ?' , [email] );
if (result.length>0) return res.status(400).json({ validateError: "Email is already exists" });

var sql = "INSERT INTO users (user_name,user_email, user_password ,user_register_date ) VALUES ?";
//Make an array of values:
var values = [
    [userName, email , hash ,today ],
];
//Execute the SQL statement, with the value array:


const register = await promiseQuery( sql, [values] );
if (register) return res.status(200).json({ regist: "successful" });
})
//=========
//Login Route
//=========
router.post('/login', async function(req, res) {
    // Check  validation
    const error = await loginValidation(req.body);
    if (error) return res.status(400).json({ validateError: error });
    const { email, password } = req.body;
    // Check emaill
    const results = await promiseQuery( 'SELECT * FROM users WHERE user_email = ?' , [email] );
    if (results.length<0) return res.status(400).json({  emailError: 'Email is wrong' });
    // Check paswword
        const compuer_password = await bcrypt.compareSync(password, results[0].user_password);
        if (!compuer_password) return res.status(400).json({ passwordError: 'Invalid password' });
            // Generate a token for the user 
            const id = results[0].user_id;
            const token = jwt.sign({ id  }, process.env.jwt_SECRET, {
                expiresIn: process.env.jwt_EXPIRES_IN
            });
            console.log('jwt', token)
            res.status(200).json({ jwt: token,  });
            


  });
module.exports = router