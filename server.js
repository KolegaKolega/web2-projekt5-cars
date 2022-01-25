const express = require("express");
const path = require("path");
const bodyParser = require('body-parser')
const fs = require('fs')

const app = express();
app.use(express.json());

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));

app.use(express.static(path.join(__dirname, "/")));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/", "index.html"));
});

app.get("/post", function (req, res) {
    res.sendFile(path.join(__dirname, "/", "post.html"));
});

app.get("/cars", function (req, res) {
    const rawdata = fs.readFileSync('src/mockData.json')
    const cars = JSON.parse(rawdata)
    console.log("I am sending cars: ", cars)
    res.json({cars})
});

app.post("/saveCars", function (req, res) {

    const rawdata = fs.readFileSync('src/mockData.json')
    const cars = JSON.parse(rawdata)
    cars.push({
        name: req.body.name,
        speed: req.body.speed
    })

    let data = JSON.stringify(cars);
    console.log(data)
    fs.writeFileSync('src/mockData.json', data);
});

const httpPort = process.env.PORT || 80;
app.listen(httpPort, function () {
    console.log(`HTTP listening on port: ${httpPort}`);
});
