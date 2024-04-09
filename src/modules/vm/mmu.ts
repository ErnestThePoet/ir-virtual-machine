import { i32 } from "./alu";

/* eslint-disable no-unused-vars */

export enum MmuLoadStatus {
    SUCCESS,
    OUT_OF_BOUND
}

export interface MmuLoadResult {
    value: number | null;
    status: MmuLoadStatus;
}

export enum MmuStoreStatus {
    SUCCESS,
    OUT_OF_BOUND
}

/* eslint-enable no-unused-vars */

/**
 * Oh our MMU is so simple--only responsible for loading and storing data into memory!
 * For performance concerns, MMU is not implemented as a class.
 */

/**
 * Read 4 bytes from given address and return the truncated result.
 * @param addrss - The memory address, must have been truncated.
 * @param memory - The memory.
 * @returns Load result, in which the `value` is truncated.
 * @public
 */
export function load32(address: number, memory: Uint8Array): MmuLoadResult {
    if (address < 0 || address + 4 > memory.length) {
        return {
            value: null,
            status: MmuLoadStatus.OUT_OF_BOUND
        };
    }

    // Little endian
    return {
        value: i32(
            memory[address] |
                (memory[address + 1] << 8) |
                (memory[address + 2] << 16) |
                (memory[address + 3] << 24)
        ),
        status: MmuLoadStatus.SUCCESS
    };
}

/**
 * Write 4 bytes to given address.
 * @param value - The value to be stored, must have been truncated.
 * @param addrss - The memory address, must have been truncated.
 * @param memory - The memory.
 * @returns Store status
 * @public
 */
export function store32(
    value: number,
    address: number,
    memory: Uint8Array
): MmuStoreStatus {
    if (address < 0 || address + 4 > memory.length) {
        return MmuStoreStatus.OUT_OF_BOUND;
    }

    memory[address] = value & 0x000000ff;
    memory[address + 1] = (value & 0x0000ff00) >>> 8;
    memory[address + 2] = (value & 0x00ff0000) >>> 16;
    memory[address + 3] = (value & 0xff000000) >>> 24;

    return MmuStoreStatus.SUCCESS;
}
