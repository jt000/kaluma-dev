// main.ts

import { LED } from "led";
import { DisplayMode, FunctionSet, Lcd1602A, TextAlign } from "./lcd1602A";

const ledPin = 28;

const led = new LED(ledPin);
led.off();

let lcd: Lcd1602A;
lcd = new Lcd1602A(15, 14, 13, [12, 11, 10, 9, 8, 7, 6, 5]);
lcd.initialize(FunctionSet.DataLength8Bit | FunctionSet.TwoLineMode, DisplayMode.DisplayOn);

timedAction("STARTUP", () => {
  lcd.setCustomChar(3, [0b00000, 
                        0b01010,
                        0b11111,
                        0b11111,
                        0b11111,
                        0b01110,
                        0b00100,
                        0b00000]);
  
  lcd.setText("I love you,\nDanelle! \x03", TextAlign.Center);  
});

timedAction("Update 1", () => {
  lcd.setText("Lorem ipsum\ndolor sit amet", TextAlign.Center);  
});

timedAction("Update 2", () => {
  lcd.setText("Lorem ipsum\ndolor sit amet", TextAlign.Right);  
});

timedAction("Update 3", () => {
  lcd.setText("[|    ]", TextAlign.Center);  
});

timedAction("Update 4", () => {
  lcd.setText("[||   ]", TextAlign.Center);  
});

timedAction("Update 5", () => {
  lcd.setText("[|||  ]", TextAlign.Center);  
});

timedAction("Update 6", () => {
  lcd.setText("[|||| ]", TextAlign.Center);  
});

timedAction("Update 7", () => {
  lcd.setText("[|||||]", TextAlign.Center);  
});

function timedAction(name: string, cb: () => void): void {
//  console.log(`${name}>>`);

  const startTime = micros();
  cb();
  const endTime = micros();

  console.log(`${name}>> Start: ${startTime}, End: ${endTime}, TOTAL: ${(endTime-startTime)/1000}ns`)
}