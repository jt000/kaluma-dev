import { Lcd1602A, FunctionSet, DisplayMode, TextAlign } from "../lcd1602A";
import { IProgram } from "../runner";
import { Serial } from "../serial";

export class SerialToLcdProgram implements IProgram {

    private readonly lcd: Lcd1602A = new Lcd1602A(15, 14, 13, [12, 11, 10, 9, 8, 7, 6, 5]);
    private textToWrite = "Hello World!";

    setup(): void | Promise<void> {
        this.lcd.initialize(FunctionSet.DataLength8Bit | FunctionSet.TwoLineMode, DisplayMode.DisplayOn);
    }

    loop(): boolean | Promise<boolean> {

        var usbText = Serial.read();
        if (usbText) {
            this.textToWrite = usbText;
        }

        this.lcd.setText(this.textToWrite, TextAlign.Center);

        return true;
    }
}
