import { test, expect } from "@jest/globals";
import { i32, i32Add, i32Sub, i32Mul, i32Div } from "../../src/modules/vm/alu";

test("(int32)0===0", () => {
    expect(i32(0)).toEqual(0);
});

test("(int32)1===1", () => {
    expect(i32(1)).toEqual(1);
});

test("(int32)-1===-1", () => {
    expect(i32(-1)).toEqual(-1);
});

test("(int32)2147483647===2147483647", () => {
    expect(i32(2147483647)).toEqual(2147483647);
});

test("(int32)2147483648===-2147483648", () => {
    expect(i32(2147483648)).toEqual(-2147483648);
});

test("(int32)-2147483648===-2147483648", () => {
    expect(i32(-2147483648)).toEqual(-2147483648);
});

test("(int32)-2147483649===2147483647", () => {
    expect(i32(-2147483649)).toEqual(2147483647);
});

// i32Add
test("(int32)5+(int32)7===(int32)12", () => {
    expect(i32Add(i32(5), i32(7))).toEqual(i32(12));
});

test("(int32)-5+(int32)-7===(int32)-12", () => {
    expect(i32Add(i32(-5), i32(-7))).toEqual(i32(-12));
});

test("(int32)5+(int32)-7===(int32)-2", () => {
    expect(i32Add(i32(5), i32(-7))).toEqual(i32(-2));
});

test("(int32)2147483647+(int32)1===(int32)-2147483648", () => {
    expect(i32Add(i32(2147483647), i32(1))).toEqual(i32(-2147483648));
});

test("(int32)-2147483648+(int32)-1===(int32)2147483647", () => {
    expect(i32Add(i32(-2147483648), i32(-1))).toEqual(i32(2147483647));
});

// i32Sub
test("(int32)5-(int32)7===(int32)-2", () => {
    expect(i32Sub(i32(5), i32(7))).toEqual(i32(-2));
});

test("(int32)-5-(int32)-7===(int32)2", () => {
    expect(i32Sub(i32(-5), i32(-7))).toEqual(i32(2));
});

test("(int32)5-(int32)-7===(int32)-2", () => {
    expect(i32Sub(i32(5), i32(-7))).toEqual(i32(12));
});

test("(int32)2147483647-(int32)-1===(int32)-2147483648", () => {
    expect(i32Sub(i32(2147483647), i32(-1))).toEqual(i32(-2147483648));
});

test("(int32)-2147483648-(int32)1===(int32)2147483647", () => {
    expect(i32Sub(i32(-2147483648), i32(1))).toEqual(i32(2147483647));
});

// i32Mul
test("(int32)0*(int32)7===(int32)0", () => {
    expect(i32Mul(i32(0), i32(7))).toEqual(i32(0));
});

test("(int32)5*(int32)7===(int32)35", () => {
    expect(i32Mul(i32(5), i32(7))).toEqual(i32(35));
});

test("(int32)50000*(int32)70000===(int32)-794967296", () => {
    expect(i32Mul(i32(50000), i32(70000))).toEqual(i32(-794967296));
});

test("(int32)-50000*(int32)70000===(int32)794967296", () => {
    expect(i32Mul(i32(-50000), i32(70000))).toEqual(i32(794967296));
});

test("(int32)-50000*(int32)-70000===(int32)-794967296", () => {
    expect(i32Mul(i32(-50000), i32(-70000))).toEqual(i32(-794967296));
});

// i32Div
test("(int32)0/(int32)7===(int32)0", () => {
    expect(i32Div(i32(0), i32(7))).toEqual(i32(0));
});

test("(int32)5/(int32)7===(int32)0", () => {
    expect(i32Div(i32(5), i32(7))).toEqual(i32(0));
});

test("(int32)-5/(int32)7===(int32)0", () => {
    expect(i32Div(i32(-5), i32(7))).toEqual(i32(0));
});

test("(int32)5/(int32)5===(int32)1", () => {
    expect(i32Div(i32(5), i32(5))).toEqual(i32(1));
});

test("(int32)7/(int32)5===(int32)1", () => {
    expect(i32Div(i32(7), i32(5))).toEqual(i32(1));
});

test("(int32)7/(int32)-5===(int32)-1", () => {
    expect(i32Div(i32(7), i32(-5))).toEqual(i32(-1));
});

test("(int32)-5/(int32)-5===(int32)1", () => {
    expect(i32Div(i32(-5), i32(-5))).toEqual(i32(1));
});

test("(int32)12/(int32)5===(int32)2", () => {
    expect(i32Div(i32(12), i32(5))).toEqual(i32(2));
});
