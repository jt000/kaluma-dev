import { type GPIO } from 'gpio';

export class Lcd1602A {
  constructor (private readonly e: GPIO, private readonly rs: GPIO, private readonly rw: GPIO, private readonly data: GPIO[]) {
  }
}
