import { test, expect } from "@jest/globals";
import { Alu } from "../../src/modules/vm/alu";
import { Uint32, Int32 } from "../../src/modules/vm/data_types";

const alu = new Alu();

// addInt32
test("(int32)5+(int32)7===(int32)12", () => {
    expect(alu.addInt32(new Int32(5), new Int32(7))).toEqual(new Int32(12));
});

test("(int32)-5+(int32)-7===(int32)-12", () => {
    expect(alu.addInt32(new Int32(-5), new Int32(-7))).toEqual(new Int32(-12));
});

test("(int32)5+(int32)-7===(int32)-2", () => {
    expect(alu.addInt32(new Int32(5), new Int32(-7))).toEqual(new Int32(-2));
});

test("(int32)2147483647+(int32)1===(int32)-2147483648", () => {
    expect(alu.addInt32(new Int32(2147483647), new Int32(1))).toEqual(
        new Int32(-2147483648)
    );
});

test("(int32)-2147483648+(int32)-1===(int32)2147483647", () => {
    expect(alu.addInt32(new Int32(-2147483648), new Int32(-1))).toEqual(
        new Int32(2147483647)
    );
});

// subInt32
test("(int32)5-(int32)7===(int32)-2", () => {
    expect(alu.subInt32(new Int32(5), new Int32(7))).toEqual(new Int32(-2));
});

test("(int32)-5-(int32)-7===(int32)2", () => {
    expect(alu.subInt32(new Int32(-5), new Int32(-7))).toEqual(new Int32(2));
});

test("(int32)5-(int32)-7===(int32)-2", () => {
    expect(alu.subInt32(new Int32(5), new Int32(-7))).toEqual(new Int32(12));
});

test("(int32)2147483647-(int32)-1===(int32)-2147483648", () => {
    expect(alu.subInt32(new Int32(2147483647), new Int32(-1))).toEqual(
        new Int32(-2147483648)
    );
});

test("(int32)-2147483648-(int32)1===(int32)2147483647", () => {
    expect(alu.subInt32(new Int32(-2147483648), new Int32(1))).toEqual(
        new Int32(2147483647)
    );
});

// mulInt32
test("(int32)5*(int32)7===(int32)35", () => {
    expect(alu.mulInt32(new Int32(5), new Int32(7))).toEqual(new Int32(35));
});

test("(int32)50000*(int32)70000===(int32)-794967296", () => {
    expect(alu.mulInt32(new Int32(50000), new Int32(70000))).toEqual(
        new Int32(-794967296)
    );
});

test("(int32)-50000*(int32)70000===(int32)794967296", () => {
    expect(alu.mulInt32(new Int32(-50000), new Int32(70000))).toEqual(
        new Int32(794967296)
    );
});

test("(int32)-50000*(int32)-70000===(int32)-794967296", () => {
    expect(alu.mulInt32(new Int32(-50000), new Int32(-70000))).toEqual(
        new Int32(-794967296)
    );
});

// divInt32
test("(int32)5/(int32)7===(int32)0", () => {
    expect(alu.divInt32(new Int32(5), new Int32(7))).toEqual(new Int32(0));
});

test("(int32)-5/(int32)7===(int32)0", () => {
    expect(alu.divInt32(new Int32(-5), new Int32(7))).toEqual(new Int32(0));
});

test("(int32)5/(int32)5===(int32)1", () => {
    expect(alu.divInt32(new Int32(5), new Int32(5))).toEqual(new Int32(1));
});

test("(int32)7/(int32)5===(int32)1", () => {
    expect(alu.divInt32(new Int32(7), new Int32(5))).toEqual(new Int32(1));
});

test("(int32)7/(int32)-5===(int32)-1", () => {
    expect(alu.divInt32(new Int32(7), new Int32(-5))).toEqual(new Int32(-1));
});

test("(int32)-5/(int32)-5===(int32)1", () => {
    expect(alu.divInt32(new Int32(-5), new Int32(-5))).toEqual(new Int32(1));
});

test("(int32)12/(int32)5===(int32)2", () => {
    expect(alu.divInt32(new Int32(12), new Int32(5))).toEqual(new Int32(2));
});

// addUint32
test("(uint32)0+(uint32)7===(uint32)7", () => {
    expect(alu.addUint32(new Uint32(0), new Uint32(7))).toEqual(new Uint32(7));
});

test("(uint32)5+(uint32)7===(uint32)12", () => {
    expect(alu.addUint32(new Uint32(5), new Uint32(7))).toEqual(new Uint32(12));
});

test("(uint32)-5+(uint32)-7===(uint32)4294967284", () => {
    expect(alu.addUint32(new Uint32(-5), new Uint32(-7))).toEqual(
        new Uint32(4294967284)
    );
});

test("(uint32)-5+(uint32)7===(uint32)2", () => {
    expect(alu.addUint32(new Uint32(-5), new Uint32(7))).toEqual(new Uint32(2));
});

test("(uint32)4294967295+(uint32)1===(uint32)0", () => {
    expect(alu.addUint32(new Uint32(4294967295), new Uint32(1))).toEqual(
        new Uint32(0)
    );
});
