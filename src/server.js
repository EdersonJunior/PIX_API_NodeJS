const axios = require("axios");
const fs = require("fs");
const path = require("path");
const cert = fs.readFileSync(path.resolve(__dirname, `../certs/producao-376561-motoeasyprd.p12`))

console.log(cert);
console.log("PIX Server is Running...");