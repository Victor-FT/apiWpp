import { parsePhoneNumber, isValidNumber } from "libphonenumber-js"
import { create, Whatsapp, Message, SocketState } from "venom-bot"

export type QRCode = {
    base64Qr: string
}


class Sender {
    private client: Whatsapp
    private connected: boolean
    private qr: QRCode;

    get isConnected() : boolean {
        return this.connected
    }

    get qrCode() : QRCode {
        return this.qr
    }
    
    constructor() {
        this.initialize()
    }

    async sendText(to: string, name: string) {
        // 5531992088778@c.us
        try {
            
            console.log(!isValidNumber(to, "BR"));
            if(!isValidNumber(to, "BR")) throw new Error('Este número é inválido.')
            
            let phoneNumber = parsePhoneNumber(to, "BR")
            .format("E.164")
            .replace('+',"")
            console.log(phoneNumber);
            
            phoneNumber = phoneNumber.includes("@c.us") 
            ? phoneNumber 
            : `${phoneNumber}@c.us`
            
            const body = `Opa, é ${name}? se sim, aqui vai o link da página com a notícia completa https://artigotas.fun/noticia/`
            
            await this.client.sendText(phoneNumber, body)
            
        } catch (err) {
            return console.log(err);
        }
    }

    private initialize() {

        const qr = (base64Qr: string) => {
            this.qr = { base64Qr }
        }

        const status = (statusSession: string) => {

            this.connected = ['isLogged', 'qrReadSuccess', "chatsAvailable"].includes(
                statusSession
            )
        }

        const start = (client : Whatsapp) => {
            this.client = client;
            
            client.onStateChange((state) => {
                this.connected = state === SocketState.CONNECTED
            })
        }

        create('api-artigotas-dev', qr, status)
            .then((client) => start(client))
            .catch((error) => console.error(error))
    }

}

export default Sender