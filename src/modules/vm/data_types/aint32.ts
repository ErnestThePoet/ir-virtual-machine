type Int32Type = "INT32" | "UINT32";

/**
 * The presence of signed and unsigned Int32 types 
 * makes value truncation automatic.
 * All subclasses are immutable.
 */
export abstract class Aint32 {
    type: Int32Type;

    constructor(type: Int32Type) {
        this.type = type;
    }

    abstract get value(): number;
}
