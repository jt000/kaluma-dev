import { StdIn, StdOut } from "stream";

export class Serial {

    static write(text: string): number {
        let stdOut = new StdOut();
        let encoder = new TextEncoder("utf-8");

        let buffer = encoder.encode(text);
        return stdOut.write(buffer);
    }

    static read(): string | null {
        let stdIn = new StdIn();
        let decoder = new TextDecoder("utf-8");

        let buffer = stdIn.read();
        if (!buffer || buffer.length === 0)
            return null;

        if (buffer[0] === 0x0D && buffer[buffer.length-1] === 0x0D) {
            // Kaluma CLI starts & ends with \r characters
            return null;
        }

        return decoder.decode(buffer).trim();
    }
}