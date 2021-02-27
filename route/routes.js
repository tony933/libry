var express = require('express');
var router = express.Router();
const pool = require("../database/librydb");
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const { registerValidation, loginValidation } = require('../validation/validation');
//=========
//Registration Route 
//=========
router.post('/ragister', async(req, res) => {
    const { userName, email, password } = req.body;
    // Check user validation
    const error = await registerValidation(req.body);
    if (error) return res.status(400).json({ validateError: error });
 //Hash password
 var salt = await bcrypt.genSaltSync(10);
 var hash = await bcrypt.hashSync(password, salt);
 var today = new Date();
     //check Email Existence
 pool.query('SELECT user_email FROM users WHERE user_email ="' + (email) +'"', function (err, result) {
    if (err) throw err;
    if (result.length>0){
      res.send("Email is already exists");
    }else{
        var sql = "INSERT INTO users (user_name,user_email, user_password ,user_register_date ) VALUES ?";
        //Make an array of values:
        var values = [
            [userName, email , hash ,today ],
        ];
        //Execute the SQL statement, with the value array:
        pool.query(sql, [values], function(err, result) {
            if (err) {
                console.log(err)
            } else {
                res.status(200).json({ success: "successful" });
            }
        });
    }
 })
})
//=========
//Login Route
//=========
router.post('/login', async function(req, res) {
    const { email, password } = req.body;
    // Check  validation
    const error = await loginValidation(req.body);
    if (error) return res.status(400).json({ validateError: error });
    pool.query('SELECT * FROM users WHERE user_email = ?', [email], async function(err, results, fields) {
            if (err) throw err;
            if (results.length > 0) {

                const compuer_password = await bcrypt.compareSync(password, results[0].user_password);
                if (!compuer_password) return res.status(400).json({ passwordError: 'Invalid password' });
;
                if ( compuer_password ) {
                    const id = results[0].user_id;
                    const token = jwt.sign({ id  }, process.env.jwt_SECRET, {
                        expiresIn: process.env.jwt_EXPIRES_IN
                    });

                    const cookopthin = await {
                        expires: new Date(
                            Date.now() + process.env.jwt_COOKLE_EXPIRES * 24 * 60 * 60 * 1000
                        ),
                        httpOnly: true
                    }
                    console.log('jwt', token, cookopthin)
                    res.cookie('jwt', token, cookopthin);
                    res.status(200).json({ jwt: token,  });
                    }
        
    }else{
        res.status(400).json({ emailError: 'Email is wrong' });
    }
    });
  });
module.exports = router