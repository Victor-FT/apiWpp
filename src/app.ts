import express, { Request, Response } from 'express'
import { connected, send } from 'process';

import Sender from "./sender";

const sender = new Sender()

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: false}))

app.get('/status', (req: Request, res: Response) => {
    return res.send({
        qr_code: sender.qrCode,
        connected: sender.isConnected
    })
}) 

app.post('/send', async (req: Request, res: Response) => {

    const { fname, phone } = req.body
    if (!phone || !fname) return  res.status(400).json({status: "Error", message: "Erro no envio da mensagem."})
    if (phone.length < 15) return res.status(400).json({status: "Error", message: "Erro no envio da mensagem."}) 
    
    try {
        const resSender = sender.sendText(phone, fname)
        if (!resSender) return  res.status(400).json({status: "Error", message: "Erro no envio da mensagem."})

        return res.status(200).json({status: "Ok", message: "Mensagem enviada com sucesso."})
    }
    catch ( error ) { 
        console.log("ERROR:" + error)
        res.status(500).json({status: "Error", message: error})
    }
})

app.listen(3000, () => { console.log("Server Running") })