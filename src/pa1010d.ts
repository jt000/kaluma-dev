import { type I2C } from "i2c";

const PA1010D_DeviceID = 0x10;
const MAX_BUFFER = 256;

export enum PositionFixIndicator {
    NotAvailable = 0,
    GpsSpsFixValid = 1,
    DifGpsSpsFixValid = 2,
    DeadReckoningFixValid = 6
}

export class PA1010D {
    static readonly TextDecoder = new TextDecoder("ascii");

    partialBlock = "";
    sentences: string[] = [];

    constructor(private readonly i2c: I2C) {
    }

    public positionFixIndicator: PositionFixIndicator = PositionFixIndicator.NotAvailable;
    public mslFeet = 0;

    public get isOnline() {
        return this.positionFixIndicator !== PositionFixIndicator.NotAvailable;
    }

    async updateAsync(): Promise<void> {

        let next: string | null;
        while ((next = this.readNextSentence()) !== null) {
            console.log(`PA1010D: "${next}"`);
            let params = next.split(',');
            let message = this.parseOutputMessage(params.shift() ?? "");
            switch (message?.message) {
                case "GGA":
                    this.processGGA(params);
                    break;
                case "GLL":
                    break;
                case "GSA":
                    break;
                case "GSV":
                    break;
                case "MSS":
                    break;
                case "RMC":
                    break;
                case "VTG":
                    break;
                case "ZDA":
                    break;
                default:
                    console.log("UNKNOWN MESSAGE: ", message?.message ?? "<NULL>")
            }
        }
    }

    private readNextSentence(): string | null {
        if (this.sentences.length === 0) {
            this.read();
        }

        return this.sentences.shift() ?? null;
    }

    private read(): void {
        let buffer = this.i2c.read(MAX_BUFFER, PA1010D_DeviceID);
        if (buffer === null || buffer.length === 0) {
            return;
        }

        let block = this.partialBlock + this.removeAllNewlines(PA1010D.TextDecoder.decode(buffer));
        this.sentences = this.sentences.concat(block.split('\r'));
        this.partialBlock = this.sentences.pop() ?? "";
    }

    // alternative to replaceAll which does not exist in es2017
    private removeAllNewlines(text: string): string {
        return text.replace(/\n/g, "");
    }

    private parseOutputMessage(text: string): { talkerId: string, message: string } | null {
        let messageFormat = /^\$([A-Z]{2})([A-Z]{3})$/;
        let result = text.match(messageFormat);
        if (!result) {
            return null;
        }

        return {
            talkerId: result[1],
            message: result[2]
        };
    }

    private processGGA(params: string[]): void {
        let [utcTime, lat, ns, log, ew, pfi, sat, hdop, msl, mslUnits, geoid, geoidUnits, age, station, chksum] = params;
        if (pfi) {
            this.positionFixIndicator = parseInt(pfi);
        }

        if (this.isOnline) {
            this.mslFeet = parseInt(msl) * 3.28084;
            if (mslUnits !== "M") {
                throw new Error(`Unknown units '${mslUnits}'`);
            }
        } else {
            this.mslFeet = 0;
        }
    }
}
