import { test, expect } from "@jest/globals";
import { Mmu } from "../../src/modules/vm/mmu";
import { Uint32 } from "../../src/modules/vm/data_types";

const mmu = new Mmu();

const memory = new Uint8Array(8);

test("Normal write-read", () => {
    expect(mmu.store32(new Uint32(0xff000000), new Uint32(0), memory)).toEqual({
        status: "SUCCESS"
    });

    expect(mmu.load32(new Uint32(0), memory)).toEqual({
        status: "SUCCESS",
        value: new Uint32(0xff000000)
    });

    expect(mmu.load32(new Uint32(3), memory)).toEqual({
        status: "SUCCESS",
        value: new Uint32(0x000000ff)
    });

    expect(mmu.store32(new Uint32(0xff000000), new Uint32(4), memory)).toEqual({
        status: "SUCCESS"
    });

    expect(mmu.load32(new Uint32(4), memory)).toEqual({
        status: "SUCCESS",
        value: new Uint32(0xff000000)
    });
});

test("Write and read out of bound", () => {
    expect(mmu.store32(new Uint32(0xff000000), new Uint32(-1), memory)).toEqual(
        {
            status: "OUT_OF_BOUND"
        }
    );

    expect(mmu.store32(new Uint32(0xff000000), new Uint32(5), memory)).toEqual({
        status: "OUT_OF_BOUND"
    });

    expect(mmu.load32(new Uint32(-1), memory)).toEqual({
        status: "OUT_OF_BOUND"
    });

    expect(mmu.load32(new Uint32(5), memory)).toEqual({
        status: "OUT_OF_BOUND"
    });
});
