import { test, expect } from "@jest/globals";
import {
    MmuLoadStatus,
    MmuStoreStatus,
    load32,
    store32
} from "../../src/modules/vm/mmu";
import { i32 } from "../../src/modules/vm/alu";

const memory = new Uint8Array(8);

test("Normal write-read", () => {
    expect(store32(i32(0xff000000), 0, memory)).toEqual(MmuStoreStatus.SUCCESS);

    expect(load32(0, memory)).toEqual({
        status: MmuLoadStatus.SUCCESS,
        value: i32(0xff000000)
    });

    expect(load32(3, memory)).toEqual({
        status: MmuLoadStatus.SUCCESS,
        value: i32(0x000000ff)
    });

    expect(store32(i32(0xff000000), 4, memory)).toEqual(MmuStoreStatus.SUCCESS);

    expect(load32(4, memory)).toEqual({
        status: MmuLoadStatus.SUCCESS,
        value: i32(0xff000000)
    });
});

test("Write and read out of bound", () => {
    expect(store32(i32(0xff000000), i32(-1), memory)).toEqual(
        MmuStoreStatus.OUT_OF_BOUND
    );

    expect(store32(i32(0xff000000), 5, memory)).toEqual(
        MmuStoreStatus.OUT_OF_BOUND
    );

    expect(load32(-1, memory)).toEqual({
        status: MmuLoadStatus.OUT_OF_BOUND,
        value: null
    });

    expect(load32(5, memory)).toEqual({
        status: MmuLoadStatus.OUT_OF_BOUND,
        value: null
    });
});
