import { type GPIO } from 'gpio';

export enum TextAlign {
  Left,
  Center,
  Right
}

export enum FunctionSet {
  DataLength8Bit = 0b10000,
  TwoLineMode = 0b01000,
  FontLength = 0b00100
}

export enum DisplayMode {
  DisplayOn = 0b100,
  CursorOn = 0b010,
  CursorBlink = 0b001
}

export class Lcd1602A {
  private readonly e: GPIO;
  private readonly rs: GPIO;
  private readonly rw: GPIO;

  /**
   * Pins are in the order d76543210. 
   */
  private readonly data: GPIO[] = [];

  private linebuffer1: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private linebuffer2: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(rsPin: number, rwPin: number, ePin: number, dataPins: number[]) {
    if (dataPins.length != 8) {
      throw new Error('Expected 8 GPIO data entries');
    }

    this.e = board.gpio(ePin, OUTPUT);
    this.rs = board.gpio(rsPin, OUTPUT);
    this.rw = board.gpio(rwPin, OUTPUT);
    dataPins.forEach((v, i) => {
      this.data[i] = board.gpio(v, INPUT);
    });
  }

  lastCommand: string = "";
  private send(rs: 0 | 1, rw: 0 | 1, bits: number, mode: number) {

    // ensure 'e' is low
    this.e.low();

    // set lcd data mode
    this.rs.write(rs);
    this.rw.write(rw);

    // set data from bits
    // bits are ordered 76543210
    for (let bit = 0; bit < 8; bit++) {
      let dMode = (mode & 1) as (0 | 1);
      this.data[bit].setMode(dMode);
      if (dMode === OUTPUT) {
        let datum = (bits & 1) as (0 | 1);
        this.data[bit].write(datum);
      }

      mode >>= 1;
      bits >>= 1;
    }

    this.e.high();
    let startUS = micros();

    // wait 100ns (.1 microseconds)
    this.wait(startUS, .1);

    // read data
    let result = 0;
    for (let bit = 7; bit >= 0; bit--) {
      result <<= 1;

      if (this.data[bit].mode === INPUT) {
        result |= this.data[bit].read();
      }
    }

    // E (enable) pin must remain on for 120ns with no changes to addresses
    this.wait(startUS, .120);
    this.e.low();

    // Must be 1200ns between commands
    this.wait(startUS, 1.2);

    // console.log(`send(${rs}${rw}, ${origBits.toString(2).padStart(8, '0')}) => ${result.toString(2).padStart(8, '0')}`)
    return result;
  }

  private wait(startT: number, usTime: number): void {
    while (micros() - startT < usTime) {
      continue;
    }
  }

  private waitForReady(): void {
    let previousCommand = this.lastCommand;

    let count = 10;
    let isBusy = this.readIsBusy();
    while (isBusy && count-- > 0) {
      delayMicroseconds(1);
      isBusy = this.readIsBusy();
    }

    if (count <= 0) {
      console.log(`WAIT EXCEEDED -- PREV COMMAND: ${previousCommand}`)
    }
  }

  private readIsBusy(): boolean {
    return (this.send(0, 1, 0, 0) & 0b10000000) !== 0;
  }

  private clearDisplay(): void {
    this.lastCommand = "clearDisplay";
    this.send(0, 0, 0b00000001, 0b11111111);
    this.waitForReady();
  }

  private setFunctionSet(functionSet: FunctionSet): void {
    this.lastCommand = "setFunctionSet";
    this.send(0, 0, 0b00100000 | functionSet, 0b11111111);
  }

  private setDisplayMode(displayMode: DisplayMode): void {
    this.lastCommand = "setDisplayMode";
    this.send(0, 0, 0b00001000 | displayMode, 0b11111111);
  }

  private returnHome(): void {
    this.lastCommand = "returnHome";
    this.send(0, 0, 0b00000010, 0b11111111);
    this.waitForReady();
  }

  private setDDRAMAddress(addr: number): void {
    this.lastCommand = `setDDRAMAddress(${addr.toString(2).padStart(8, "0")})`;
    this.send(0, 0, 0b10000000 | addr, 0b11111111);
  }

  private setCGRAMAddress(addr: number): void {
    this.lastCommand = "setCGRAMAddress";
    this.send(0, 0, 0b01000000 | addr, 0b11111111);
  }

  private writeData(data: number): void {
    this.lastCommand = "writeData";
    this.send(1, 0, data, 0b11111111);
  }

  private updateDDRAM(buffer: number[], text: string, offset: number) {
    let currentAddress = -1;
    for (let x = 0; x < 16; x++) {
      let charCode = text.charCodeAt(x);
      if (charCode != buffer[x]) {
        let expectedAddr = x+offset;
        if (currentAddress != expectedAddr) {
          this.setDDRAMAddress(expectedAddr);
        }

        this.writeData(charCode);
        buffer[x] = charCode;
        currentAddress = expectedAddr + 1;
      }
    }
  }

  setText(text: string, alignment: TextAlign = TextAlign.Left) {
    let lines = text.split('\n');
    this.setLine1(lines.shift() ?? '', alignment)
    this.setLine2(lines.shift() ?? '', alignment)
  }

  setLine1(text: string, alignment: TextAlign = TextAlign.Left) {
    let line = align(text ?? '', alignment);
    this.updateDDRAM(this.linebuffer1, line, 0);    
  }

  setLine2(text: string, alignment: TextAlign = TextAlign.Left) {
    let line = align(text ?? '', alignment);
    this.updateDDRAM(this.linebuffer2, line, 0x40);      
  }

  initialize(functionSet: FunctionSet, displayMode: DisplayMode): void {
    this.setFunctionSet(functionSet);
    this.setDisplayMode(displayMode);
    this.clearDisplay();
  }

  setCustomChar(idx: number, data: number[]) {
    if (idx < 0 || idx > 7)
      throw new Error(`Custom char index must be between 0-7. Actual ${idx}`);

    if (data.length !== 8)
      throw new Error(`Bytes length must be exactly 8. Actual ${data.length}`);

    let addr = idx << 3;
    this.setCGRAMAddress(addr);

    for (let x = 0; x < 8; x++) {
      this.writeData(data[x]);
    }
  }
}

function align(text: string, alignment: TextAlign): string {
  switch (alignment) {
    case TextAlign.Left:
      text = text.substring(0, 16);
      return text.padEnd(16, ' ');

    case TextAlign.Right:
      text = text.substring(0, 16);
      return text.padStart(16, ' ');

    case TextAlign.Center:
      text = text.substring(0, 16);
      return text.padStart(text.length + Math.floor((16-text.length) / 2), ' ').padEnd(16, ' ');
  }
}

