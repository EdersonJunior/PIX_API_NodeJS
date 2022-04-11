const axios = require("axios")
const https = require("https")
const fs = require("fs")
const path = require("path")
const cert = fs.readFileSync(path.resolve(__dirname, `../certs/producao-376561-motoeasyprd.p12`))
const CLIENT_ID = "Client_Id_b2b8b109b5fb3cc78de2cd3257d37efb25a444ec"
const CLIENT_SECRET = "Client_Secret_4c7d63e049c7218e635afab89390d46a31286e13"
const agent = new https.Agent({pfx: cert, passphrase: ""})
const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const url = "https://api-pix.gerencianet.com.br/oauth/token"

axios({
    method: "POST",
    url: url,
    headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type" : "application/json",
        httpsAgent: agent
    },
    data: {
        grand_type: "client_credentials"
    }
}).then(console.log)

console.log(cert);
console.log("PIX Server is Running...");