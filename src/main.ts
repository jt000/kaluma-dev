// main.ts

import { GpsProgram } from "./programs/gpsProgram";
import { programRunner } from "./runner";

var program = new GpsProgram();

programRunner.Run(program)
  .then(() => {
    console.log("<<PROGRAM EXITED>>")
  });