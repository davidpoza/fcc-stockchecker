"use strict";

require("dotenv").config();
const express    = require("express");
const bodyParser = require("body-parser");
const cors       = require("cors");
const mongoose   = require("mongoose");
const helmet     = require("helmet");

const apiRoutes        = require("./routes/api.js");
const errorMdw         = require("./middleware/errors");
const fccTestingRoutes = require("./routes/fcctesting.js");
const runner           = require("./test-runner");

const app = express();

let uri;
if(process.env.NODE_ENV == "production") uri = process.env.MONGO_URI_PROD;
else if(process.env.NODE_ENV == "development") uri = process.env.MONGO_URI_DEV;
else if(process.env.NODE_ENV == "testing") uri = process.env.MONGO_URI_TEST;
else uri = process.env.MONGO_URI_TEST;

console.log(process.env.NODE_ENV + " environment");

mongoose.connect(uri, { useNewUrlParser: true, useFindAndModify: false })
    .catch((err)=>{console.log(err); process.exit(1);});

app.use(helmet({
    frameguard: {              // configure
        action: "sameorigin"
    },
    contentSecurityPolicy: {   // enable and configure
        directives: {
            defaultSrc:["'self'", "glitch.com"],
            scriptSrc:["'self'", "'unsafe-inline'", "code.jquery.com"],
            styleSrc:["'self'", "'unsafe-inline'"],
            imgSrc:["'self'", "hyperdev.com", "cdn.gomix.com", "glitch.com"]
        }
    },
    dnsPrefetchControl: false   // disable
}));

app.use("/public", express.static(process.cwd() + "/public"));

app.use(cors({ origin: "*" })); //For FCC testing purposes only

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index page (static HTML)
app.route("/")
    .get(function (req, res) {
        res.sendFile(process.cwd() + "/views/index.html");
    });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API
apiRoutes(app);

//error Middleware
app.use(errorMdw.errorHandler);

//404 Not Found Middleware
app.use(errorMdw.notFoundHandler);

//Start our server and tests!
const port = process.env.NODE_ENV == "testing" ? process.env.PORT_TEST : process.env.PORT;
app.listen(port, function () {
    console.log("Listening on port " + port);
    if (process.env.NODE_ENV === "fcctesting") {
        console.log("Running Tests...");
        setTimeout(function () {
            try {
                runner.run();
            } catch (e) {
                var error = e;
                console.log("Tests are not valid:");
                console.log(error);
            }
        }, 3500);
    }
});

module.exports = app; //for testing
