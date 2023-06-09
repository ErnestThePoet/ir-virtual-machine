import { Aint32, Int32, Uint32 } from "./data_types";

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
    addInt32(a: Int32, b: Int32): Int32 {
        return new Int32(a.value + b.value);
    }

    /**
     * Performs int32 subtracton operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)((int32)a - (int32)b)
     * @public
     */
    subInt32(a: Int32, b: Int32): Int32 {
        return new Int32(a.value - b.value);
    }

    /**
     * Performs int32 multiplication operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)((int32)a * (int32)b)
     * @public
     */
    mulInt32(a: Int32, b: Int32): Int32 {
        return new Int32(
            this.mulUint32(new Uint32(a.value), new Uint32(b.value)).value
        );
    }

    /**
     * Performs int32 division operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand. Vm checks whether b===0
     * @returns (int32)((int32)a / (int32)b)
     * @public
     */
    divInt32(a: Int32, b: Int32): Int32 {
        return new Int32(a.value / b.value);
    }

    /**
     * Performs uint32 addition operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a + (uint32)b)
     * @public
     */
    addUint32(a: Uint32, b: Uint32): Uint32 {
        return new Uint32(a.value + b.value);
    }

    /**
     * Performs uint32 subtracton operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a - (uint32)b)
     * @public
     */
    subUint32(a: Uint32, b: Uint32): Uint32 {
        return new Uint32(a.value - b.value);
    }

    /**
     * Performs uint32 multiplication operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)((uint32)a * (uint32)b)
     * @public
     */
    mulUint32(a: Uint32, b: Uint32): Uint32 {
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
        const ah = (a.value & 0xffff0000) >>> 16;
        const al = a.value & 0x0000ffff;
        const bh = (b.value & 0xffff0000) >>> 16;
        const bl = b.value & 0x0000ffff;
        return new Uint32(((ah * bl + al * bh) << 16) + al * bl);
    }

    /**
     * Performs uint32 division operation on given operands.
     * @param a - The left operand.
     * @param b - The right operand. Vm checks whether b===0
     * @returns (uint32)((uint32)a / (uint32)b)
     * @public
     */
    divUint32(a: Uint32, b: Uint32): Uint32 {
        return new Uint32(a.value / b.value);
    }

    /**
     * Performs integer eq test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a==(uint32)b
     * @public
     */
    eq(a: Aint32, b: Aint32): boolean {
        return new Uint32(a.value).value === new Uint32(b.value).value;
    }

    /**
     * Performs integer ne test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a!=(uint32)b
     * @public
     */
    ne(a: Aint32, b: Aint32): boolean {
        return new Uint32(a.value).value !== new Uint32(b.value).value;
    }

    /**
     * Performs signed integer gt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a>(int32)b
     * @public
     */
    gtInt32(a: Int32, b: Int32): boolean {
        return a.value > b.value;
    }

    /**
     * Performs signed integer ge test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a>=(int32)b
     * @public
     */
    geInt32(a: Int32, b: Int32): boolean {
        return a.value >= b.value;
    }

    /**
     * Performs signed integer lt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a<(int32)b
     * @public
     */
    ltInt32(a: Int32, b: Int32): boolean {
        return a.value < b.value;
    }

    /**
     * Performs signed integer le test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (int32)a<=(int32)b
     * @public
     */
    leInt32(a: Int32, b: Int32): boolean {
        return a.value <= b.value;
    }

    /**
     * Performs unsigned integer gt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a>(uint32)b
     * @public
     */
    gtUint32(a: Uint32, b: Uint32): boolean {
        return a.value > b.value;
    }

    /**
     * Performs unsigned integer ge test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a>=(uint32)b
     * @public
     */
    geUint32(a: Uint32, b: Uint32): boolean {
        return a.value >= b.value;
    }

    /**
     * Performs unsigned integer lt test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a<(uint32)b
     * @public
     */
    ltUint32(a: Uint32, b: Uint32): boolean {
        return a.value < b.value;
    }

    /**
     * Performs unsigned integer le test on given operands.
     * @param a - The left operand.
     * @param b - The right operand.
     * @returns (uint32)a<=(uint32)b
     * @public
     */
    leUint32(a: Uint32, b: Uint32): boolean {
        return a.value <= b.value;
    }
}
