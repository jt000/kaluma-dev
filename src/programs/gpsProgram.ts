import { I2C } from "i2c";
import { PA1010D } from "../pa1010d";
import { type IProgram } from "../runner";
import { delayAsync } from "../async";
import { DisplayMode, FunctionSet, Lcd1602A } from "../lcd1602A";


export class GpsProgram implements IProgram {
    
    private gps: PA1010D = new PA1010D(new I2C(0, { sda: 16, scl: 17 }));
    private readonly lcd: Lcd1602A = new Lcd1602A(15, 14, 13, [12, 11, 10, 9, 8, 7, 6, 5]);

    setup(): void {
        this.lcd.initialize(FunctionSet.DataLength8Bit | FunctionSet.TwoLineMode, DisplayMode.DisplayOn);
        this.lcd.setLine1("GPS PROGRAM");
    }

    async loop(): Promise<boolean> {
        await this.gps.updateAsync();

        if (this.gps.isOnline) {
            this.lcd.setLine1(`GPS OK | ${Math.floor(this.gps.mslFeet)}'`);
        } else {
            this.lcd.setLine1("GPS !!");
        }

        

        await delayAsync(1000);

        return true;
    }

}