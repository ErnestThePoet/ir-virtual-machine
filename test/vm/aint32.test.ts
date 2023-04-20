import { test, expect } from "@jest/globals";
import { Uint32, Int32 } from "../../src/modules/vm/data_types";

test("(int32)15", () => {
    expect(new Int32(15).value).toEqual(15);
});

test("(int32)0", () => {
    expect(new Int32(0).value).toEqual(0);
});

test("(int32)-15", () => {
    expect(new Int32(-15).value).toEqual(-15);
});

test("(int32)2147483648", () => {
    expect(new Int32(2147483648).value).toEqual(-2147483648);
});

test("(int32)-2147483649", () => {
    expect(new Int32(-2147483649).value).toEqual(2147483647);
});

test("(uint32)15", () => {
    expect(new Uint32(15).value).toEqual(15);
});

test("(uint32)0", () => {
    expect(new Uint32(0).value).toEqual(0);
});

test("(uint32)-1", () => {
    expect(new Uint32(-1).value).toEqual(4294967295);
});

test("(uint32)4294967296", () => {
    expect(new Uint32(4294967296).value).toEqual(0);
});