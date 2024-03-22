/**
 * Offers arithmetic and logic computation functionalties.
 * For performance concerns, MMU is not implemented as a class,
 * and most ordinary operations are performed in place
 * instead of with ALU functions.
 */

const bufferInt32: Int32Array = new Int32Array(1);

/**
 * Truncate the input number into 32-bit signed integer and return the result.
 * @param a - The input number.
 * @returns (int32)a
 */
export function i32(a: number): number {
    bufferInt32[0] = a;
    return bufferInt32[0];
}

/**
 * Performs 32-bit integer addition operation on given operands.
 * @param a - The left operand, must have been truncated.
 * @param b - The right operand, must have been truncated.
 * @returns (int32)((int32)a + (int32)b)
 */
export function i32Add(a: number, b: number): number {
    return i32(a + b);
}

/**
 * Performs 32-bit integer subtraction operation on given operands.
 * @param a - The left operand, must have been truncated.
 * @param b - The right operand, must have been truncated.
 * @returns (int32)((int32)a - (int32)b)
 */
export function i32Sub(a: number, b: number): number {
    return i32(a - b);
}

/**
 * Performs 32-bit integer multiplication operation on given operands.
 * @param a - The left operand, must have been truncated.
 * @param b - The right operand, must have been truncated.
 * @returns (int32)((int32)a * (int32)b)
 */
export function i32Mul(a: number, b: number): number {
    // We must limit each step of our calculation within 2^53 to
    // avoid precision loss. So we perform 16bit multiplication.
    // a*b
    // = (ah*2^16+al)*(bh*2^16+bl)
    // = (ah*bh*2^32)+(ah*bl*2^16)+(al*bh*2^16)+(al*bl)
    //   [64bit, lowest 32bit are 0s]
    //   [48bit, lowest 16bit are 0s]
    //   [48bit, lowest 16bit are 0s]
    //   [32bit]
    // = (ah*bl*2^16)+(al*bh*2^16)+(al*bl)
    // = (ah*bl+al*bh)*2^16+al*bl
    const ah = (a & 0xffff0000) >>> 16;
    const al = a & 0x0000ffff;
    const bh = (b & 0xffff0000) >>> 16;
    const bl = b & 0x0000ffff;
    return i32(((ah * bl + al * bh) << 16) + al * bl);
}

/**
 * Performs 32-bit signed integer division operation on given operands.
 * @param a - The left operand, must have been truncated.
 * @param b - The right operand, must have been truncated.
 * @returns (int32)((int32)a / (int32)b)
 */
export function i32Div(a: number, b: number): number {
    return i32(a / b);
}
