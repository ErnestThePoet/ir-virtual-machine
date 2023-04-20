import { Int32 } from "./data_types/int32";
import { Uint32 } from "./data_types/uint32";
import type { AppLocaleKey } from "@/locales";

// Component types
interface Singular {
    type: "IMM" | "ID" | "ADDRESS_ID" | "DEREF_ID";
    imm?: Int32;
    id?: string;
}

type BinaryMathOp = "+" | "-" | "*" | "/";
type BinaryRelOp = "==" | "!=" | "<" | "<=" | ">" | ">=";

interface LValue {
    type: "ID" | "DEREF_ID";
    id: string;
}

interface RValue {
    type: "SINGULAR" | "BINARY_MATH_OP";
    singular?: Singular;
    singularL?: Singular;
    binaryMathOp?: BinaryMathOp;
    singularR?: Singular;
}

interface CondValue {
    singluarL: Singular;
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
    size: Uint32;
}

export interface DecodedGlobalDec {
    id: string;
    size: Uint32;
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
type InstructionType =
    | "FUNCTION"
    | "ASSIGN"
    | "DEC"
    | "GLOBAL_DEC"
    | "LABEL"
    | "GOTO"
    | "IF"
    | "ARG"
    | "CALL"
    | "ASSIGN_CALL"
    | "PARAM"
    | "RETURN"
    | "READ"
    | "WRITE"
    | "EMPTY"
    | "ERROR";

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
    lineNumber: number;
    messageKey?: AppLocaleKey;
    value?: InstructionValue;
}

type DecodedInstructionNoMeta = Omit<DecodedInstruction, "lineNumber">;

/**
 * Decoder breaks down an IR instruction
 */
export class Decoder {
    // Named group is an ES2018 feature and we want some polyfill.
    private readonly patternId = new RegExp(/^(?<id>[a-zA-Z_]\\w*)$/);

    private readonly patternSize = new RegExp(/^(?<size>\d+)$/);

    private readonly patternSingular = new RegExp(
        /^(#(?<imm>-?\d+))|(?<id>[a-zA-Z_]\\w*)|(\*(?<derefId>[a-zA-Z_]\\w*))|(&(?<addressId>[a-zA-Z_]\\w*))$/
    );

    private readonly patternLValue = new RegExp(
        /^((?<id>[a-zA-Z_]\\w*))|(\*(?<derefId>[a-zA-Z_]\\w*))$/
    );

    private readonly illegalInstructionFormatError: DecodedInstructionNoMeta = {
        type: "ERROR",
        messageKey: "ILLEGAL_INSTRUCTION_FORMAT"
    };

    private splitWhiteSpace(instruction: string): string[] {
        return instruction.replace("\t", " ").split(" ");
    }

    /**
     * Decode the ID string into a string.
     * @param id - The ID string.
     * @returns A string, or null if illegal.
     */
    private decodeComponentId(id: string): string | null {
        const match = id.match(this.patternId);

        if (match === null) {
            return null;
        }

        return match.groups!.id;
    }

    /**
     * Decode the size string into a Uint32.
     * @param size - The size string.
     * @returns An Uint32, or null if illegal.
     */
    private decodeComponentSize(size: string): Uint32 | null {
        const match = size.match(this.patternSize);

        if (match === null) {
            return null;
        }

        return new Uint32(parseInt(match.groups!.size));
    }

    /**
     * Decode the singular string into a Singular object.
     * @param singular - The singular string.
     * @returns A Singular object, or null if illegal.
     */
    private decodeComponentSingular(singular: string): Singular | null {
        const match = singular.match(this.patternSingular);

        if (match === null) {
            return null;
        }

        if (match.groups!.imm !== undefined) {
            return {
                type: "IMM",
                imm: new Int32(parseInt(match.groups!.imm))
            };
        } else if (match.groups!.id !== undefined) {
            return {
                type: "ID",
                id: match.groups!.id
            };
        } else if (match.groups!.derefId !== undefined) {
            return {
                type: "DEREF_ID",
                id: match.groups!.derefId
            };
        } else {
            return {
                type: "ADDRESS_ID",
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
                type: "ID",
                id: match.groups!.id
            };
        } else {
            return {
                type: "DEREF_ID",
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
                type: "ERROR",
                messageKey: "FUNCTION_ILLEGAL_ID"
            };
        }

        return {
            type: "FUNCTION",
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

        const lValue = this.decodeComponentLValue(splitResult[1]);
        if (lValue === null) {
            return {
                type: "ERROR",
                messageKey: "ASSIGN_ILLEGAL_LEFT"
            };
        }

        const rSingular1 = this.decodeComponentSingular(splitResult[2]);
        if (rSingular1 === null) {
            return {
                type: "ERROR",
                messageKey:
                    splitResult.length === 3
                        ? "ASSIGN_ILLEGAL_RIGHT"
                        : "ASSIGN_ILLEGAL_RIGHT_OPERAND1"
            };
        }

        if (splitResult.length === 3) {
            return {
                type: "FUNCTION",
                value: <DecodedAssign>{
                    lValue,
                    rValue: {
                        type: "SINGULAR",
                        singular: rSingular1
                    }
                }
            };
        } else {
            let operator: BinaryMathOp = "+";
            switch (splitResult[3]) {
                case "+":
                case "-":
                case "*":
                case "/":
                    operator = splitResult[3];
                    break;
                default:
                    return {
                        type: "ERROR",
                        messageKey: "ASSIGN_ILLEGAL_RIGHT_OPERATOR"
                    };
            }

            const rSingular2 = this.decodeComponentSingular(splitResult[4]);
            if (rSingular2 === null) {
                return {
                    type: "ERROR",
                    messageKey: "ASSIGN_ILLEGAL_RIGHT_OPERAND2"
                };
            }

            return {
                type: "ASSIGN",
                value: <DecodedAssign>{
                    lValue,
                    rValue: {
                        type: "BINARY_MATH_OP",
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
                type: "ERROR",
                messageKey: "DEC_ILLEGAL_ID"
            };
        }

        const size = this.decodeComponentSize(splitResult[2]);
        if (size === null) {
            return {
                type: "ERROR",
                messageKey: "DEC_ILLEGAL_SIZE_FORMAT"
            };
        }

        if (size.value % 4 !== 0) {
            return {
                type: "ERROR",
                messageKey: "DEC_SIZE_NOT_4_MULTIPLE"
            };
        }

        return {
            type: "DEC",
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
                type: "ERROR",
                messageKey: "GLOBAL_DEC_ILLEGAL_ID"
            };
        }

        const size = this.decodeComponentSize(splitResult[2]);
        if (size === null) {
            return {
                type: "ERROR",
                messageKey: "GLOBAL_DEC_ILLEGAL_SIZE_FORMAT"
            };
        }

        if (size.value % 4 !== 0) {
            return {
                type: "ERROR",
                messageKey: "GLOBAL_DEC_SIZE_NOT_4_MULTIPLE"
            };
        }

        return {
            type: "GLOBAL_DEC",
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
                type: "ERROR",
                messageKey: "LABEL_ILLEGAL_ID"
            };
        }

        return {
            type: "LABEL",
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
                type: "ERROR",
                messageKey: "GOTO_ILLEGAL_ID"
            };
        }

        return {
            type: "GOTO",
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
                type: "ERROR",
                messageKey: "IF_ILLEGAL_COND_OPERAND1"
            };
        }

        let operator: BinaryRelOp = "==";
        switch (splitResult[2]) {
            case "==":
            case "!=":
            case "<":
            case "<=":
            case ">":
            case ">=":
                operator = splitResult[2];
                break;
            default:
                return {
                    type: "ERROR",
                    messageKey: "IF_ILLEGAL_COND_OPERATOR"
                };
        }

        const singular2 = this.decodeComponentSingular(splitResult[3]);
        if (singular2 === null) {
            return {
                type: "ERROR",
                messageKey: "IF_ILLEGAL_COND_OPERAND2"
            };
        }

        const gotoId = this.decodeComponentId(splitResult[5]);
        if (gotoId === null) {
            return {
                type: "ERROR",
                messageKey: "IF_ILLEGAL_GOTO_ID"
            };
        }

        return {
            type: "IF",
            value: <DecodedIf>{
                condition: {
                    singluarL: singular1,
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
                type: "ERROR",
                messageKey: "ARG_ILLEGAL"
            };
        }

        return {
            type: "ARG",
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
                type: "ERROR",
                messageKey: "CALL_ILLEGAL_ID"
            };
        }

        return {
            type: "CALL",
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
                type: "ERROR",
                messageKey: "ASSIGN_ILLEGAL_LEFT"
            };
        }

        const id = this.decodeComponentId(splitResult[3]);
        if (id === null) {
            return {
                type: "ERROR",
                messageKey: "CALL_ILLEGAL_ID"
            };
        }

        return {
            type: "ASSIGN_CALL",
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
                type: "ERROR",
                messageKey: "PARAM_ILLEGAL_ID"
            };
        }

        return {
            type: "PARAM",
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
                type: "ERROR",
                messageKey: "RETURN_ILLEGAL"
            };
        }

        return {
            type: "RETURN",
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
                type: "ERROR",
                messageKey: "READ_ILLEGAL"
            };
        }

        return {
            type: "READ",
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
                type: "ERROR",
                messageKey: "WRITE_ILLEGAL"
            };
        }

        return {
            type: "WRITE",
            value: <DecodedWrite>{
                value: singular
            }
        };
    }

    /**
     * Decode the given IR instruction.
     * @param instruction - The instruction to be decoded.
     * @param lineNumber - The line number of current instruction in original instruction sequence.
     * @returns Decode result. Will have `type==="ERROR"` if instruction is illegal.
     * @public
     */
    decode(instruction: string, lineNumber: number): DecodedInstruction {
        if (instruction.match(/^[ \t]*$/)) {
            return {
                type: "EMPTY",
                lineNumber
            };
        }

        const unrecognizedInstructionError: DecodedInstruction = {
            type: "ERROR",
            lineNumber,
            messageKey: "UNRECOGNIZED_INSTRUCTION"
        };

        const splitResult = this.splitWhiteSpace(instruction);

        if (splitResult.length < 1) {
            return unrecognizedInstructionError;
        }

        const addLineNumber = (decoded: DecodedInstructionNoMeta) =>
            Object.assign(decoded, { lineNumber });

        switch (splitResult[0]) {
            case "FUNCTION":
                return addLineNumber(this.decodeFunction(splitResult));
            case "DEC":
                return addLineNumber(this.decodeDec(splitResult));
            case "GLOBAL_DEC":
                return addLineNumber(this.decodeGlobalDec(splitResult));
            case "LABEL":
                return addLineNumber(this.decodeLabel(splitResult));
            case "GOTO":
                return addLineNumber(this.decodeGoto(splitResult));
            case "IF":
                return addLineNumber(this.decodeIf(splitResult));
            case "ARG":
                return addLineNumber(this.decodeArg(splitResult));
            case "CALL":
                return addLineNumber(this.decodeCall(splitResult));
            case "PARAM":
                return addLineNumber(this.decodeParam(splitResult));
            case "RETURN":
                return addLineNumber(this.decodeReturn(splitResult));
            case "READ":
                return addLineNumber(this.decodeRead(splitResult));
            case "WRITE":
                return addLineNumber(this.decodeWrite(splitResult));
            default:
                const assign = this.decodeAssign(splitResult);
                if (assign.type === "ASSIGN") {
                    return addLineNumber(assign);
                }

                const assignCall = this.decodeAssignCall(splitResult);
                if (assignCall.type === "ASSIGN_CALL") {
                    return addLineNumber(assignCall);
                }

                return unrecognizedInstructionError;
        }
    }
}
