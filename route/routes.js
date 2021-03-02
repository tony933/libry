var express = require('express'),
 router = express.Router(),
 promiseQuery = require("../database/librydb"),
 bcrypt = require('bcryptjs'),
 jwt = require('jsonwebtoken'),
 jwt_decode = require('jwt-decode'),
 tookendekod = "",
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
            tookendekod = token
            res.status(200).json({ jwt: token,  });
  });
  //=========
//jwt_decode function
//=========
  function jwtdecod (){
    if (!tookendekod) return res.status(400).json({  Error: 'no jwt' });;
    var decoded = jwt_decode(tookendekod);
return decoded.id;
  }
  //=========
//category Route
//=========
  router.post('/category', async(req, res) => {
    const {Name} = req.body;
var id_decode = jwtdecod()
 //check category Existence
 const result = await promiseQuery( 'SELECT category_name FROM category WHERE category_name = ?' , [Name] );
if (result.length>0) return res.status(200).json({ categoryExistence: "category is  exists" });
var sql = "INSERT INTO category (category_name,user_id ) VALUES ?";
//Make an array of values:
var values = [
    [ Name , id_decode ],
];
//Execute the SQL statement, with the value array:
const register = await promiseQuery( sql, [values] );
if (register) return res.status(200).json({ categoryregist: "successful" });
})


router.post('/book', async(req, res) => {
const {name_book , year_book , numper_book , dec_book , indx_book , book_image} = req.body;
var id_decode = jwtdecod()
 const result = await promiseQuery( 'SELECT * FROM category WHERE user_id = ?' , [id_decode] );
 console.log(result)
 var sql = "INSERT INTO book (book_name,user_id,category_id,book_year,book_nopages,book_description,book_index,book_image ) VALUES ?";
 //Make an array of values:
 var values = [
     [ name_book ,result[0].user_id,result[0].category_id, year_book , numper_book , dec_book , indx_book , book_image ],
 ];
 //Execute the SQL statement, with the value array:
 const register = await promiseQuery( sql, [values] );
 if (register) return res.status(200).json({ bookregist: "successful" });
})



module.exports = router