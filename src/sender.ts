import { parsePhoneNumber, isValidNumber } from "libphonenumber-js"
import { create, Whatsapp, Message, SocketState } from "venom-bot"

export type QRCode = {
    base64Qr: string,
    asciiQR: string,
    attempts: number,
    urlCode: string | undefined
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

        const options = {
            folderNameToken: 'tokens', //folder name when saving tokens
            mkdirFolderToken: '', //folder directory tokens, just inside the venom folder, example:  { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
            headless: true, // Headless chrome
            devtools: false, // Open devtools by default
            useChrome: true, // If false will use Chromium instance
            debug: false, // Opens a debug session
            logQR: true, // Logs QR automatically in terminal
            browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'], // Parameters to be added into the chrome browser instance
            disableSpins: true, // Will disable Spinnies animation, useful for containers (docker) for a better log
            disableWelcome: true, // Will disable the welcoming message which appears in the beginning
            updates: true, // Logs info updates automatically in terminal
            autoClose: 60000, // Automatically closes the venom-bot only when scanning the QR code (default 60 seconds, if you want to turn it off, assign 0 or false)
          }

        const qr = (base64Qr: string, asciiQR: string, attempts: number, urlCode: string | undefined) => {
            this.qr = { base64Qr, asciiQR, attempts, urlCode: urlCode || "" }
        }

        //Statusfind is not working.
        const status = (statusSession: string) => {
            console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
            // Create session wss return "serverClose" case server for close
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

        create({session: 'api-artigotas-dev', multidevice: false, catchQR: qr})
            .then((client) => start(client))
            .catch((error) => console.error(error))
    }

}

export default Sender