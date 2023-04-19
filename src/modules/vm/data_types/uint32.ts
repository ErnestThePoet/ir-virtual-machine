import { Aint32 } from "./aint32";

export class Uint32 extends Aint32 {
    // Automatic truncation
    private buffer: Uint32Array;

    constructor(numberValue: number) {
        super("UINT32");
        this.buffer = new Uint32Array(1);
        this.buffer[0] = numberValue;
    }

    get value(): number {
        return this.buffer[0];
    }
}
