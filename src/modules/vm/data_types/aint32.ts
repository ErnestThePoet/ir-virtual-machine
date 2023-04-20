type Int32Type = "INT32" | "UINT32";

/**
 * The abstract base class of 32bit integer types Int32(signed) and Uint32(unsigned).
 * These classes make value truncation automatic.
 * All subclasses are immutable.
 */
export abstract class Aint32 {
    type: Int32Type;

    constructor(type: Int32Type) {
        this.type = type;
    }

    abstract get value(): number;
}
