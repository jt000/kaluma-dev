import { Lcd1602A, FunctionSet, DisplayMode, TextAlign } from "../lcd1602A";
import { type IProgram } from "../runner";


export class LoveProgram implements IProgram {

    private readonly lcd: Lcd1602A = new Lcd1602A(15, 14, 13, [12, 11, 10, 9, 8, 7, 6, 5]);
    private position = 0;
    private lastTime = 0;

    setup(): void | Promise<void> {
        this.lcd.initialize(FunctionSet.DataLength8Bit | FunctionSet.TwoLineMode, DisplayMode.DisplayOn);
        this.lcd.setCustomChar(3, [0b00000,
            0b01010,
            0b11111,
            0b11111,
            0b11111,
            0b01110,
            0b00100,
            0b00000]);

        this.lcd.setText("I love you,\nDanelle! \x03", TextAlign.Center);
    }

    loop(): boolean | Promise<boolean> {
        return false;
    }
}
