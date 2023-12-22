// main.ts

import { SerialToLcdProgram } from "./programs/streamToLcdProgram";
import { programRunner } from "./runner";

var program = new SerialToLcdProgram();

programRunner.Run(program)
  .then(() => {
    console.log("<<PROGRAM EXITED>>")
  });