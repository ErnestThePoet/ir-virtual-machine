import { toUint32 } from "./alu";

type MmuLoadStatus = "SUCCESS" | "OUT_OF_BOUND";
type MmuStoreStatus = "SUCCESS" | "OUT_OF_BOUND";

interface MmuLoadResult {
    status: MmuLoadStatus;
    value: number;
}

interface MmuStoreResult {
    status: MmuStoreStatus;
}

/**
 * Oh our MMU is so simple--only responsible for loading and storing data into memory!
 */
export class Mmu {
    /**
     * Read 4 bytes from given address and return the result as uint32.
     * @param addrss - The memory address.
     * @param memory - The memory.
     * @returns Load result. If unsuccessful, value=`0`
     * @public
     */
    load32(address: number, memory: Uint8Array): MmuLoadResult {
        if (address < 0 || address + 4 > memory.length) {
            return {
                status: "OUT_OF_BOUND",
                value: 0
            };
        }

        // Little endian
        return {
            status: "SUCCESS",
            value: toUint32(
                memory[address] |
                    (memory[address + 1] << 8) |
                    (memory[address + 2] << 16) |
                    (memory[address + 3] << 24)
            )
        };
    }

    /**
     * Write 4 bytes to given address.
     * @param value - The value to be stored.
     * @param addrss - The memory address.
     * @param memory - The memory.
     * @returns Store result
     * @public
     */
    store32(
        value: number,
        address: number,
        memory: Uint8Array
    ): MmuStoreResult {
        if (address < 0 || address + 4 > memory.length) {
            return {
                status: "OUT_OF_BOUND"
            };
        }

        memory[address] = value & 0x000000ff;
        memory[address + 1] = (value & 0x0000ff00) >>> 8;
        memory[address + 2] = (value & 0x00ff0000) >>> 16;
        memory[address + 3] = (value & 0xff000000) >>> 24;

        return {
            status: "SUCCESS"
        };
    }
}
