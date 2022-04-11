const express = require('express')
const app = express()
const port = 1000
const axios = require("axios")
const https = require("https")
const fs = require("fs")
const path = require("path")
const { response } = require('express')
const cert = fs.readFileSync(path.resolve(__dirname, `../certs/producao-376561-motoeasyprd.p12`))
const CLIENT_ID = "Client_Id_b2b8b109b5fb3cc78de2cd3257d37efb25a444ec"
const CLIENT_SECRET = "Client_Secret_4c7d63e049c7218e635afab89390d46a31286e13"
const agent = new https.Agent({pfx: cert, passphrase: ""})
const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
const url = "https://api-pix.gerencianet.com.br"
const pixKey = "9ffa7831-fe44-409b-8efc-77bd7c61b5be"

console.log(cert);
console.log("PIX Server is Running...");

app.post('/create-charge', async (req, res) => {
    console.log("Gerando cobrança");
    let accessToken = await requestAccessToken();
    let charge = await createCharge(accessToken);
    let paymentLink = await createPaymentLink(accessToken, charge);

    res.send(paymentLink);
})

async function requestAccessToken() {
    console.log("solicitando token");
    let accessToken = null
    await axios({
        method: "POST",
        url: `${url}/oauth/token`,
        headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type" : "application/json",
        },
        httpsAgent: agent,
        data: {
            "grant_type": "client_credentials"
        }
    }).then(function (response) {
        if (response.data && response.data.access_token) {
            accessToken = response.data.access_token
        }
      })
    
    return accessToken
}

async function createCharge(accessToken) {
    console.log("criando cobrança");
    let charge = null
    await axios({
        method: "POST",
        url: `${url}/v2/cob/`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type" : "application/json",
        },
        httpsAgent: agent,
        data: {
            "calendario": {
                "expiracao": 100000000
            },
            
            "valor": {
                "original": "0.01"
            },
            "chave": `${pixKey}`,
            "solicitacaoPagador": "Moto Easy - Confirmação de Motoboy"
        }
    }).then(function (response) {
        if (response.data && response.data.txid) {
            charge = response.data
            console.log("Cobrança gerada:\n" + JSON.stringify(charge));
        }
      })
    
    return charge
}

async function createPaymentLink(accessToken, charge) {
    console.log("criando QR CODE para o ID " + charge.loc.id);
    let paymentLink = null
    await axios({
        method: "GET",
        url: `${url}/v2/loc/${charge.loc.id}/qrcode`,
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type" : "application/json",
        },
        httpsAgent: agent,
        data: {
            "tipoCob": "cob"
        }
    }).then(function (response) {
        paymentLink = JSON.stringify(response.data)
        console.log("\n paymentLink \n" + JSON.stringify(paymentLink));
        if (paymentLink.includes("qrcode")) {
            console.log("QR Code gerado com sucesso:\n" + paymentLink);
        }
      })
    
    return paymentLink
}

app.listen(port, () => {
    console.log(`Moto Easy - PIX runnint on port ${port}`)
})