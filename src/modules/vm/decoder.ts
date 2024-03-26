import type { AppLocaleKey } from "@/locales";
import { i32 } from "./alu";

// Component types

export enum SingularType {
    IMM,
    ID,
    ADDRESS_ID,
    DEREF_ID
}

export interface Singular {
    type: SingularType;
    // Contract: truncated
    imm?: number;
    id?: string;
}

export enum BinaryMathOp {
    ADD,
    SUB,
    MUL,
    DIV
}

export enum BinaryRelOp {
    EQ,
    NE,
    LT,
    LE,
    GT,
    GE
}

export enum LValueType {
    ID,
    DEREF_ID
}

export interface LValue {
    type: LValueType;
    id: string;
}

export enum RValueType {
    SINGULAR,
    BINARY_MATH_OP
}

export interface RValue {
    type: RValueType;
    singular?: Singular;
    singularL?: Singular;
    binaryMathOp?: BinaryMathOp;
    singularR?: Singular;
}

export interface CondValue {
    singularL: Singular;
    binaryRelOp: BinaryRelOp;
    singularR: Singular;
}

// Various decoded instruction types

export interface DecodedFunction {
    id: string;
}

export interface DecodedAssign {
    lValue: LValue;
    rValue: RValue;
}

export interface DecodedDec {
    id: string;
    // Contract: truncated
    size: number;
}

export interface DecodedGlobalDec {
    id: string;
    // Contract: truncated
    size: number;
}

export interface DecodedLabel {
    id: string;
}

export interface DecodedGoto {
    id: string;
}

export interface DecodedIf {
    condition: CondValue;
    gotoId: string;
}

export interface DecodedArg {
    value: Singular;
}

export interface DecodedCall {
    id: string;
}

export interface DecodedAssignCall {
    lValue: LValue;
    functionId: string;
}

export interface DecodedLabel {
    id: string;
}

export interface DecodedParam {
    id: string;
}

export interface DecodedReturn {
    value: Singular;
}

export interface DecodedRead {
    lValue: LValue;
}

export interface DecodedWrite {
    value: Singular;
}

// Decode result type
export enum InstructionType {
    FUNCTION,
    ASSIGN,
    DEC,
    GLOBAL_DEC,
    LABEL,
    GOTO,
    IF,
    ARG,
    CALL,
    ASSIGN_CALL,
    PARAM,
    RETURN,
    READ,
    WRITE,
    EMPTY,
    COMMENT,
    ERROR
}

export enum ExecutableInstructionType {
    // FUNCTION,
    ASSIGN = InstructionType.ASSIGN,
    DEC = InstructionType.DEC,
    GLOBAL_DEC = InstructionType.GLOBAL_DEC,
    // LABEL,
    GOTO = InstructionType.GOTO,
    IF = InstructionType.IF,
    ARG = InstructionType.ARG,
    CALL = InstructionType.CALL,
    ASSIGN_CALL = InstructionType.ASSIGN_CALL,
    PARAM = InstructionType.PARAM,
    RETURN = InstructionType.RETURN,
    READ = InstructionType.READ,
    WRITE = InstructionType.WRITE
    // EMPTY,
    // COMMENT,
    // ERROR
}

type InstructionValue =
    | DecodedFunction
    | DecodedAssign
    | DecodedDec
    | DecodedGlobalDec
    | DecodedLabel
    | DecodedGoto
    | DecodedIf
    | DecodedArg
    | DecodedCall
    | DecodedAssignCall
    | DecodedParam
    | DecodedReturn
    | DecodedRead
    | DecodedWrite;

export interface DecodedInstruction {
    type: InstructionType;
    value?: InstructionValue;
    messageKey?: AppLocaleKey;
}

export type DecodedExecutableInstruction = Omit<DecodedInstruction, "type"> & {
    type: ExecutableInstructionType;
};

type DecodedInstructionNoMeta = Omit<DecodedInstruction, "lineNumber">;

export const IR_KEYWORDS = [
    "FUNCTION",
    "DEC",
    "GLOBAL_DEC",
    "LABEL",
    "GOTO",
    "IF",
    "ARG",
    "PARAM",
    "CALL",
    "RETURN",
    "READ",
    "WRITE"
];

const IR_KEYWORD_SET = new Set<string>(IR_KEYWORDS);

/**
 * Decoder breaks down an IR instruction
 */
export class Decoder {
    // TODO: Named group is an ES2018 feature and we want some polyfill.
    private readonly patternId = new RegExp(/^(?<id>[a-zA-Z_]\w*)$/);

    private readonly patternSize = new RegExp(/^(?<size>\d+)$/);

    private readonly patternSingular = new RegExp(
        /^(#(?<imm>-?\d+))$|^(?<id>[a-zA-Z_]\w*)$|^(\*(?<derefId>[a-zA-Z_]\w*))$|^(&(?<addressId>[a-zA-Z_]\w*))$/
    );

    private readonly patternLValue = new RegExp(
        /^((?<id>[a-zA-Z_]\w*))$|^(\*(?<derefId>[a-zA-Z_]\w*))$/
    );

    private readonly illegalInstructionFormatError: DecodedInstructionNoMeta = {
        type: InstructionType.ERROR,
        messageKey: "ILLEGAL_INSTRUCTION_FORMAT"
    };

    private purify(instruction: string): string {
        return instruction.trim().replaceAll(/[ \t]+/g, " ");
    }

    private splitWhiteSpace(instruction: string): string[] {
        return instruction.replaceAll("\t", " ").split(" ");
    }

    /**
     * Decode the ID string into a string.
     * @param id - The ID string.
     * @returns A string, or `null` if illegal.
     */
    private decodeComponentId(id: string): string | null {
        const match = id.match(this.patternId);

        if (match === null || IR_KEYWORD_SET.has(id)) {
            return null;
        }

        return match.groups!.id;
    }

    /**
     * Decode the size string into a truncated 32-bit signed int
     * and return it.
     * @param size - The size string.
     * @returns An number, or `null` if illegal. If `size` is not a
     * safe integer, the returned number will be `Infinity`.
     */
    private decodeComponentSize(size: string): number | null {
        const match = size.match(this.patternSize);

        if (match === null) {
            return null;
        }

        const sizeValue = parseInt(match.groups!.size);

        if (!Number.isSafeInteger(sizeValue)) {
            return Infinity;
        }

        return i32(sizeValue);
    }

    /**
     * Decode the singular string into a Singular object. If the singular
     * is imm, its value in the returned Singular object is truncated.
     * @param singular - The singular string.
     * @returns A Singular object, or `null` if illegal.
     */
    private decodeComponentSingular(singular: string): Singular | null {
        const match = singular.match(this.patternSingular);

        if (match === null) {
            return null;
        }

        if (match.groups!.imm !== undefined) {
            const numberValue = parseInt(match.groups!.imm);
            if (!Number.isSafeInteger(numberValue)) {
                return {
                    type: SingularType.IMM,
                    imm: Infinity
                };
            }

            return {
                type: SingularType.IMM,
                imm: i32(numberValue)
            };
        } else if (match.groups!.id !== undefined) {
            return {
                type: SingularType.ID,
                id: match.groups!.id
            };
        } else if (match.groups!.derefId !== undefined) {
            return {
                type: SingularType.DEREF_ID,
                id: match.groups!.derefId
            };
        } else {
            return {
                type: SingularType.ADDRESS_ID,
                id: match.groups!.addressId
            };
        }
    }

    /**
     * Decode the L value string into an LValue object.
     * @param lValue - The L value string.
     * @returns An LValue object, or null if illegal.
     */
    private decodeComponentLValue(lValue: string): LValue | null {
        const match = lValue.match(this.patternLValue);

        if (match === null) {
            return null;
        }

        if (match.groups!.id !== undefined) {
            return {
                type: LValueType.ID,
                id: match.groups!.id
            };
        } else {
            return {
                type: LValueType.DEREF_ID,
                id: match.groups!.derefId
            };
        }
    }

    // The following methods decode one kind of already recognized instruction.

    private decodeFunction(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 3 || splitResult[2] !== ":") {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);

        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "FUNCTION_ILLEGAL_ID"
            };
        }

        return {
            type: InstructionType.FUNCTION,
            value: <DecodedFunction>{
                id
            }
        };
    }

    private decodeAssign(splitResult: string[]): DecodedInstructionNoMeta {
        if (
            (splitResult.length !== 3 && splitResult.length !== 5) ||
            splitResult[1] !== ":="
        ) {
            return this.illegalInstructionFormatError;
        }

        const lValue = this.decodeComponentLValue(splitResult[0]);
        if (lValue === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "ASSIGN_ILLEGAL_LEFT"
            };
        }

        const rSingular1 = this.decodeComponentSingular(splitResult[2]);
        if (rSingular1 === null) {
            return {
                type: InstructionType.ERROR,
                messageKey:
                    splitResult.length === 3
                        ? "ASSIGN_ILLEGAL_RIGHT"
                        : "ASSIGN_ILLEGAL_RIGHT_OPERAND1"
            };
        }

        if (
            rSingular1.type === SingularType.IMM &&
            !Number.isFinite(rSingular1.imm)
        ) {
            return {
                type: InstructionType.ERROR,
                messageKey:
                    splitResult.length === 3
                        ? "ASSIGN_RIGHT_IMM_TOO_LARGE"
                        : "ASSIGN_RIGHT_OPERAND1_IMM_TOO_LARGE"
            };
        }

        if (splitResult.length === 3) {
            return {
                type: InstructionType.ASSIGN,
                value: <DecodedAssign>{
                    lValue,
                    rValue: {
                        type: RValueType.SINGULAR,
                        singular: rSingular1
                    }
                }
            };
        } else {
            let operator: BinaryMathOp = BinaryMathOp.ADD;
            switch (splitResult[3]) {
                case "+":
                    operator = BinaryMathOp.ADD;
                    break;
                case "-":
                    operator = BinaryMathOp.SUB;
                    break;
                case "*":
                    operator = BinaryMathOp.MUL;
                    break;
                case "/":
                    operator = BinaryMathOp.DIV;
                    break;
                default:
                    return {
                        type: InstructionType.ERROR,
                        messageKey: "ASSIGN_ILLEGAL_RIGHT_OPERATOR"
                    };
            }

            const rSingular2 = this.decodeComponentSingular(splitResult[4]);
            if (rSingular2 === null) {
                return {
                    type: InstructionType.ERROR,
                    messageKey: "ASSIGN_ILLEGAL_RIGHT_OPERAND2"
                };
            }

            if (
                rSingular2.type === SingularType.IMM &&
                !Number.isFinite(rSingular2.imm)
            ) {
                return {
                    type: InstructionType.ERROR,
                    messageKey: "ASSIGN_RIGHT_OPERAND2_IMM_TOO_LARGE"
                };
            }

            return {
                type: InstructionType.ASSIGN,
                value: <DecodedAssign>{
                    lValue,
                    rValue: {
                        type: RValueType.BINARY_MATH_OP,
                        singularL: rSingular1,
                        singularR: rSingular2,
                        binaryMathOp: operator
                    }
                }
            };
        }
    }

    private decodeDec(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 3) {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "DEC_ILLEGAL_ID"
            };
        }

        const size = this.decodeComponentSize(splitResult[2]);
        if (size === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "DEC_ILLEGAL_SIZE_FORMAT"
            };
        }

        if (!Number.isFinite(size)) {
            return {
                type: InstructionType.ERROR,
                messageKey: "DEC_SIZE_TOO_LARGE"
            };
        }

        if (size % 4 !== 0) {
            return {
                type: InstructionType.ERROR,
                messageKey: "DEC_SIZE_NOT_4_MULTIPLE"
            };
        }

        return {
            type: InstructionType.DEC,
            value: <DecodedDec>{
                id,
                size
            }
        };
    }

    private decodeGlobalDec(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 3) {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "GLOBAL_DEC_ILLEGAL_ID"
            };
        }

        const size = this.decodeComponentSize(splitResult[2]);
        if (size === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "GLOBAL_DEC_ILLEGAL_SIZE_FORMAT"
            };
        }

        if (!Number.isFinite(size)) {
            return {
                type: InstructionType.ERROR,
                messageKey: "GLOBAL_DEC_SIZE_TOO_LARGE"
            };
        }

        if (size % 4 !== 0) {
            return {
                type: InstructionType.ERROR,
                messageKey: "GLOBAL_DEC_SIZE_NOT_4_MULTIPLE"
            };
        }

        return {
            type: InstructionType.GLOBAL_DEC,
            value: <DecodedGlobalDec>{
                id,
                size
            }
        };
    }

    private decodeLabel(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 3 || splitResult[2] !== ":") {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "LABEL_ILLEGAL_ID"
            };
        }

        return {
            type: InstructionType.LABEL,
            value: <DecodedLabel>{
                id
            }
        };
    }

    private decodeGoto(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "GOTO_ILLEGAL_ID"
            };
        }

        return {
            type: InstructionType.GOTO,
            value: <DecodedGoto>{
                id
            }
        };
    }

    private decodeIf(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 6 || splitResult[4] !== "GOTO") {
            return this.illegalInstructionFormatError;
        }

        const singular1 = this.decodeComponentSingular(splitResult[1]);
        if (singular1 === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "IF_ILLEGAL_COND_OPERAND1"
            };
        }

        if (
            singular1.type === SingularType.IMM &&
            !Number.isFinite(singular1.imm)
        ) {
            return {
                type: InstructionType.ERROR,
                messageKey: "IF_COND_OPERAND1_IMM_TOO_LARGE"
            };
        }

        let operator: BinaryRelOp = BinaryRelOp.EQ;
        switch (splitResult[2]) {
            case "==":
                operator = BinaryRelOp.EQ;
                break;
            case "!=":
                operator = BinaryRelOp.NE;
                break;
            case "<":
                operator = BinaryRelOp.LT;
                break;
            case "<=":
                operator = BinaryRelOp.LE;
                break;
            case ">":
                operator = BinaryRelOp.GT;
                break;
            case ">=":
                operator = BinaryRelOp.GE;
                break;
            default:
                return {
                    type: InstructionType.ERROR,
                    messageKey: "IF_ILLEGAL_COND_OPERATOR"
                };
        }

        const singular2 = this.decodeComponentSingular(splitResult[3]);
        if (singular2 === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "IF_ILLEGAL_COND_OPERAND2"
            };
        }

        if (
            singular2.type === SingularType.IMM &&
            !Number.isFinite(singular2.imm)
        ) {
            return {
                type: InstructionType.ERROR,
                messageKey: "IF_COND_OPERAND2_IMM_TOO_LARGE"
            };
        }

        const gotoId = this.decodeComponentId(splitResult[5]);
        if (gotoId === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "IF_ILLEGAL_GOTO_ID"
            };
        }

        return {
            type: InstructionType.IF,
            value: <DecodedIf>{
                condition: {
                    singularL: singular1,
                    singularR: singular2,
                    binaryRelOp: operator
                },
                gotoId
            }
        };
    }

    private decodeArg(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const singular = this.decodeComponentSingular(splitResult[1]);
        if (singular === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "ARG_ILLEGAL"
            };
        }

        if (
            singular.type === SingularType.IMM &&
            !Number.isFinite(singular.imm)
        ) {
            return {
                type: InstructionType.ERROR,
                messageKey: "ARG_IMM_TOO_LARGE"
            };
        }

        return {
            type: InstructionType.ARG,
            value: <DecodedArg>{
                value: singular
            }
        };
    }

    private decodeCall(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "CALL_ILLEGAL_ID"
            };
        }

        return {
            type: InstructionType.CALL,
            value: <DecodedCall>{
                id
            }
        };
    }

    private decodeAssignCall(splitResult: string[]): DecodedInstructionNoMeta {
        if (
            splitResult.length !== 4 ||
            splitResult[1] !== ":=" ||
            splitResult[2] !== "CALL"
        ) {
            return this.illegalInstructionFormatError;
        }

        const lValue = this.decodeComponentLValue(splitResult[0]);
        if (lValue === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "ASSIGN_ILLEGAL_LEFT"
            };
        }

        const id = this.decodeComponentId(splitResult[3]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "CALL_ILLEGAL_ID"
            };
        }

        return {
            type: InstructionType.ASSIGN_CALL,
            value: <DecodedAssignCall>{
                lValue,
                functionId: id
            }
        };
    }

    private decodeParam(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const id = this.decodeComponentId(splitResult[1]);
        if (id === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "PARAM_ILLEGAL_ID"
            };
        }

        return {
            type: InstructionType.PARAM,
            value: <DecodedParam>{
                id
            }
        };
    }

    private decodeReturn(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const singular = this.decodeComponentSingular(splitResult[1]);
        if (singular === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "RETURN_ILLEGAL"
            };
        }

        if (
            singular.type === SingularType.IMM &&
            !Number.isFinite(singular.imm)
        ) {
            return {
                type: InstructionType.ERROR,
                messageKey: "RETURN_IMM_TOO_LARGE"
            };
        }

        return {
            type: InstructionType.RETURN,
            value: <DecodedReturn>{
                value: singular
            }
        };
    }

    private decodeRead(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const lValue = this.decodeComponentLValue(splitResult[1]);
        if (lValue === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "READ_ILLEGAL"
            };
        }

        return {
            type: InstructionType.READ,
            value: <DecodedRead>{
                lValue
            }
        };
    }

    private decodeWrite(splitResult: string[]): DecodedInstructionNoMeta {
        if (splitResult.length !== 2) {
            return this.illegalInstructionFormatError;
        }

        const singular = this.decodeComponentSingular(splitResult[1]);
        if (singular === null) {
            return {
                type: InstructionType.ERROR,
                messageKey: "WRITE_ILLEGAL"
            };
        }

        if (
            singular.type === SingularType.IMM &&
            !Number.isFinite(singular.imm)
        ) {
            return {
                type: InstructionType.ERROR,
                messageKey: "WRITE_IMM_TOO_LARGE"
            };
        }

        return {
            type: InstructionType.WRITE,
            value: <DecodedWrite>{
                value: singular
            }
        };
    }

    /**
     * Decode the given IR instruction.
     * @param instruction - The instruction to be decoded.
     * @returns Decode result. Will have `type===InstructionType.ERROR` if instruction is illegal.
     * @public
     */
    decode(instruction: string): DecodedInstruction {
        if (instruction.match(/^[ \t]*$/)) {
            return {
                type: InstructionType.EMPTY
            };
        }

        const unrecognizedInstructionError: DecodedInstruction = {
            type: InstructionType.ERROR,
            messageKey: "UNRECOGNIZED_INSTRUCTION"
        };

        const purified = this.purify(instruction);

        if (purified.startsWith(";")) {
            return {
                type: InstructionType.COMMENT
            };
        }

        const splitResult = this.splitWhiteSpace(purified);

        if (splitResult.length < 1) {
            return unrecognizedInstructionError;
        }

        switch (splitResult[0]) {
            case "FUNCTION":
                return this.decodeFunction(splitResult);
            case "DEC":
                return this.decodeDec(splitResult);
            case "GLOBAL_DEC":
                return this.decodeGlobalDec(splitResult);
            case "LABEL":
                return this.decodeLabel(splitResult);
            case "GOTO":
                return this.decodeGoto(splitResult);
            case "IF":
                return this.decodeIf(splitResult);
            case "ARG":
                return this.decodeArg(splitResult);
            case "CALL":
                return this.decodeCall(splitResult);
            case "PARAM":
                return this.decodeParam(splitResult);
            case "RETURN":
                return this.decodeReturn(splitResult);
            case "READ":
                return this.decodeRead(splitResult);
            case "WRITE":
                return this.decodeWrite(splitResult);
            default:
                const assign = this.decodeAssign(splitResult);
                if (assign.type === InstructionType.ASSIGN) {
                    return assign;
                }

                const assignCall = this.decodeAssignCall(splitResult);
                if (assignCall.type === InstructionType.ASSIGN_CALL) {
                    return assignCall;
                }

                return assign;
        }
    }
}
