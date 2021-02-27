const express = require('express'),
    app = express(),
    port = 7000;
    const bodyParser = require('body-parser'),
    cookieParser = require("cookie-parser");
    const  dotenv = require("dotenv");
//===========
// Middleware
//===========
    dotenv.config({ path: './.env' });
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: "50mb" }));
    app.use(cookieParser());
//===========
//  Routes
//===========
app.use('/', require("./route/routes"));

//===========
//  CONECTIN PORT
//===========
app.listen(port, () => {
    console.log("it work")


})