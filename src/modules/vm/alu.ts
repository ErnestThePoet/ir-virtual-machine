// the two typed arrays are used to facilitate integer truncations.
const int32Buffer = new Uint32Array(1);
const uint32Buffer = new Uint32Array(1);

/**
 * Truncate the given integer to 32 bit and interprete as signed integer.
 * @param x - The given integer.
 * @returns The truncated and interpreted int32 value.
 */
export function toInt32(x: number): number {
    int32Buffer[0] = x;
    return int32Buffer[0];
}

/**
 * Truncate the given integer to 32 bit and interprete as unsigned integer.
 * @param x - The given integer.
 * @returns The truncated and interpreted uint32 value.
 */
export function toUint32(x: number): number {
    uint32Buffer[0] = x;
    return int32Buffer[0];
}

/**
 * Offers arithmetic and logic computation functionalties
 */
export class Alu {
    /**
     * Performs int32 addition operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)((int32)a + (int32)b)
     * @public
     */
    addInt32(a: number, b: number): number {
        return toInt32(toInt32(a) + toInt32(b));
    }

    /**
     * Performs int32 subtracton operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)((int32)a - (int32)b)
     * @public
     */
    subInt32(a: number, b: number): number {
        return toInt32(toInt32(a) - toInt32(b));
    }

    /**
     * Performs int32 multiplication operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)((int32)a * (int32)b)
     * @public
     */
    mulInt32(a: number, b: number): number {
        return toInt32(toInt32(a) * toInt32(b));
    }

    /**
     * Performs int32 division operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)((int32)a / (int32)b)
     * @public
     */
    divInt32(a: number, b: number): number {
        return toInt32(Math.floor(toInt32(a) / toInt32(b)));
    }

    /**
     * Performs uint32 addition operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a + (uint32)b)
     * @public
     */
    addUint32(a: number, b: number): number {
        return toUint32(toUint32(a) + toUint32(b));
    }

    /**
     * Performs uint32 subtracton operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a - (uint32)b)
     * @public
     */
    subUint32(a: number, b: number): number {
        return toUint32(toUint32(a) - toUint32(b));
    }

    /**
     * Performs uint32 multiplication operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a * (uint32)b)
     * @public
     */
    mulUint32(a: number, b: number): number {
        return toUint32(toUint32(a) * toUint32(b));
    }

    /**
     * Performs uint32 division operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a / (uint32)b)
     * @public
     */
    divUint32(a: number, b: number): number {
        return toUint32(Math.floor(toUint32(a) / toUint32(b)));
    }

    /**
     * Performs integer eq test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a==(uint32)b
     * @public
     */
    eq(a: number, b: number): boolean {
        return toUint32(a) === toUint32(b);
    }

    /**
     * Performs integer ne test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a!=(uint32)b
     * @public
     */
    ne(a: number, b: number): boolean {
        return toUint32(a) !== toUint32(b);
    }

    /**
     * Performs signed integer gt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a>(int32)b
     * @public
     */
    gtInt32(a: number, b: number): boolean {
        return toInt32(a) > toInt32(b);
    }

    /**
     * Performs signed integer ge test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a>=(int32)b
     * @public
     */
    geInt32(a: number, b: number): boolean {
        return toInt32(a) >= toInt32(b);
    }

    /**
     * Performs signed integer lt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a<(int32)b
     * @public
     */
    ltInt32(a: number, b: number): boolean {
        return toInt32(a) < toInt32(b);
    }

    /**
     * Performs signed integer le test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a<=(int32)b
     * @public
     */
    leInt32(a: number, b: number): boolean {
        return toInt32(a) <= toInt32(b);
    }

    /**
     * Performs unsigned integer gt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a>(uint32)b
     * @public
     */
    gtUint32(a: number, b: number): boolean {
        return toUint32(a) > toUint32(b);
    }

    /**
     * Performs unsigned integer ge test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a>=(uint32)b
     * @public
     */
    geUint32(a: number, b: number): boolean {
        return toUint32(a) >= toUint32(b);
    }

    /**
     * Performs unsigned integer lt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a<(uint32)b
     * @public
     */
    ltUint32(a: number, b: number): boolean {
        return toUint32(a) < toUint32(b);
    }

    /**
     * Performs unsigned integer le test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a<=(uint32)b
     * @public
     */
    leUint32(a: number, b: number): boolean {
        return toUint32(a) <= toUint32(b);
    }
}
