import { test, expect } from "@jest/globals";
import { Alu } from "../../src/modules/vm/alu";
import { Uint32, Int32 } from "../../src/modules/vm/data_types";

const alu = new Alu();

//// eq
// Int32-Int32
test("(int32)1===(int32)1", () => {
    expect(alu.eq(new Int32(1), new Int32(1))).toBeTruthy();
});

test("(int32)0===(int32)0", () => {
    expect(alu.eq(new Int32(0), new Int32(0))).toBeTruthy();
});

test("(int32)-1===(int32)-1", () => {
    expect(alu.eq(new Int32(-1), new Int32(-1))).toBeTruthy();
});

test("(int32)1!==(int32)-1", () => {
    expect(alu.eq(new Int32(1), new Int32(-1))).toBeFalsy();
});

// Uint32-Uint32
test("(uint32)1===(uint32)1", () => {
    expect(alu.eq(new Uint32(1), new Uint32(1))).toBeTruthy();
});

test("(uint32)0===(uint32)0", () => {
    expect(alu.eq(new Uint32(0), new Uint32(0))).toBeTruthy();
});

test("(uint32)-1===(uint32)-1", () => {
    expect(alu.eq(new Uint32(-1), new Uint32(-1))).toBeTruthy();
});

test("(uint32)1!==(uint32)-1", () => {
    expect(alu.eq(new Uint32(1), new Uint32(-1))).toBeFalsy();
});

test("(uint32)4294967295===(uint32)-1", () => {
    expect(alu.eq(new Uint32(4294967295), new Uint32(-1))).toBeTruthy();
});

// Int32-Uint32
test("(int32)1===(uint32)1", () => {
    expect(alu.eq(new Int32(1), new Uint32(1))).toBeTruthy();
});

test("(int32)0===(uint32)0", () => {
    expect(alu.eq(new Int32(0), new Uint32(0))).toBeTruthy();
});

test("(int32)-1===(uint32)-1", () => {
    expect(alu.eq(new Int32(-1), new Uint32(-1))).toBeTruthy();
});

test("(int32)1!==(uint32)-1", () => {
    expect(alu.eq(new Int32(1), new Uint32(-1))).toBeFalsy();
});

test("(int32)-1===(uint32)4294967295", () => {
    expect(alu.eq(new Int32(-1), new Uint32(4294967295))).toBeTruthy();
});

//// gt,ge
// Int32
test("(int32)-1!>(int32)1", () => {
    expect(alu.gtInt32(new Int32(-1), new Int32(1))).toBeFalsy();
});

test("(int32)0!>(int32)0", () => {
    expect(alu.gtInt32(new Int32(0), new Int32(0))).toBeFalsy();
});

test("(int32)1>(int32)-1", () => {
    expect(alu.gtInt32(new Int32(1), new Int32(-1))).toBeTruthy();
});

test("(int32)-1!>=(int32)1", () => {
    expect(alu.geInt32(new Int32(-1), new Int32(1))).toBeFalsy();
});

test("(int32)0>=(int32)0", () => {
    expect(alu.geInt32(new Int32(0), new Int32(0))).toBeTruthy();
});

test("(int32)1>=(int32)-1", () => {
    expect(alu.geInt32(new Int32(1), new Int32(-1))).toBeTruthy();
});

// Uint32
test("(uint32)1>(uint32)0", () => {
    expect(alu.gtUint32(new Uint32(1), new Uint32(0))).toBeTruthy();
});

test("(uint32)0!>(uint32)0", () => {
    expect(alu.gtUint32(new Uint32(0), new Uint32(0))).toBeFalsy();
});

test("(uint32)0!>(uint32)1", () => {
    expect(alu.gtUint32(new Uint32(0), new Uint32(1))).toBeFalsy();
});

test("(uint32)0>=(uint32)0", () => {
    expect(alu.geUint32(new Uint32(0), new Uint32(0))).toBeTruthy();
});

test("(uint32)0!>=(uint32)1", () => {
    expect(alu.geUint32(new Uint32(0), new Uint32(1))).toBeFalsy();
});

test("(uint32)1>=(uint32)0", () => {
    expect(alu.geUint32(new Uint32(1), new Uint32(0))).toBeTruthy();
});

//// lt,le
// Int32
test("(int32)-1<(int32)1", () => {
    expect(alu.ltInt32(new Int32(-1), new Int32(1))).toBeTruthy();
});

test("(int32)0!<(int32)0", () => {
    expect(alu.ltInt32(new Int32(0), new Int32(0))).toBeFalsy();
});

test("(int32)1!<(int32)-1", () => {
    expect(alu.ltInt32(new Int32(1), new Int32(-1))).toBeFalsy();
});

test("(int32)-1<=(int32)1", () => {
    expect(alu.leInt32(new Int32(-1), new Int32(1))).toBeTruthy();
});

test("(int32)0<=(int32)0", () => {
    expect(alu.leInt32(new Int32(0), new Int32(0))).toBeTruthy();
});

test("(int32)1!<=(int32)-1", () => {
    expect(alu.leInt32(new Int32(1), new Int32(-1))).toBeFalsy();
});

// Uint32
test("(uint32)1!<(uint32)0", () => {
    expect(alu.ltUint32(new Uint32(1), new Uint32(0))).toBeFalsy();
});

test("(uint32)0!<(uint32)0", () => {
    expect(alu.ltUint32(new Uint32(0), new Uint32(0))).toBeFalsy();
});

test("(uint32)0<(uint32)1", () => {
    expect(alu.ltUint32(new Uint32(0), new Uint32(1))).toBeTruthy();
});

test("(uint32)0<=(uint32)0", () => {
    expect(alu.leUint32(new Uint32(0), new Uint32(0))).toBeTruthy();
});

test("(uint32)0<=(uint32)1", () => {
    expect(alu.leUint32(new Uint32(0), new Uint32(1))).toBeTruthy();
});

test("(uint32)1!<=(uint32)0", () => {
    expect(alu.leUint32(new Uint32(1), new Uint32(0))).toBeFalsy();
});

//// Special cases
test("(int32)-2147483649!<(int32)1", () => {
    expect(alu.ltInt32(new Int32(-2147483649), new Int32(0))).toBeFalsy();
});

test("(uint32)-1!<(uint32)1", () => {
    expect(alu.ltUint32(new Uint32(-1), new Uint32(1))).toBeFalsy();
});
