import { Lcd1602A, FunctionSet, DisplayMode, TextAlign } from "../lcd1602A";
import { type IProgram } from "../runner";


export class LcdTestProgram implements IProgram {

    private readonly lcd: Lcd1602A = new Lcd1602A(15, 14, 13, [12, 11, 10, 9, 8, 7, 6, 5]);
    private position = 0;
    private positionTime = 0;
    private lastTime = 0;

    setup(): void | Promise<void> {
        this.lcd.initialize(FunctionSet.DataLength8Bit | FunctionSet.TwoLineMode, DisplayMode.DisplayOn);
        
        this.lastTime = micros();
        this.positionTime = micros();
    }

    loop(): boolean | Promise<boolean> | void {
        
        const px = this.position;
        function p(idx: number): string {
            return px % 5 === idx ? "|" : " ";
        }
    
        const thisTime = micros();
        const fps = 1e+6/(thisTime - this.lastTime);

        if (thisTime - this.positionTime > 1e+6) {
            this.position = (this.position + 1) % 5;
            this.positionTime = thisTime;
        }

        var buffer = `[${p(0)}${p(1)}${p(2)}${p(3)}${p(4)}]\n${Math.floor(fps)} fps`;
        
        this.lcd.setText(buffer, TextAlign.Center);

        this.lastTime = thisTime;

        return true;
    }
}
