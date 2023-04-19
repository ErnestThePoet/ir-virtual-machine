import { Aint32 } from "./aint32";

export class Int32 extends Aint32 {
    // Automatic truncation
    private buffer: Int32Array;

    constructor(numberValue: number) {
        super("INT32");
        this.buffer = new Int32Array(1);
        this.buffer[0] = numberValue;
    }

    get value(): number {
        return this.buffer[0];
    }
}
