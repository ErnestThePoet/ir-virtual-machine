import { Uint32 } from "./vm/data_types";

export function toHex(value: Uint32): string {
    return `0x${value.value.toString(16).toUpperCase()}`;
}
