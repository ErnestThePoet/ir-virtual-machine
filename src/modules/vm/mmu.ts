import { Uint32 } from "./data_types";

type MmuLoadStatus = "SUCCESS" | "OUT_OF_BOUND";
type MmuStoreStatus = "SUCCESS" | "OUT_OF_BOUND";

interface MmuLoadResult {
    status: MmuLoadStatus;
    value?: Uint32;
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
    load32(address: Uint32, memory: Uint8Array): MmuLoadResult {
        if (address.value + 4 > memory.length) {
            return {
                status: "OUT_OF_BOUND"
            };
        }

        // Little endian
        return {
            status: "SUCCESS",
            value: new Uint32(
                memory[address.value] |
                    (memory[address.value + 1] << 8) |
                    (memory[address.value + 2] << 16) |
                    (memory[address.value + 3] << 24)
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
        value: Uint32,
        address: Uint32,
        memory: Uint8Array
    ): MmuStoreResult {
        if (address.value + 4 > memory.length) {
            return {
                status: "OUT_OF_BOUND"
            };
        }

        memory[address.value] = value.value & 0x000000ff;
        memory[address.value + 1] = (value.value & 0x0000ff00) >>> 8;
        memory[address.value + 2] = (value.value & 0x00ff0000) >>> 16;
        memory[address.value + 3] = (value.value & 0xff000000) >>> 24;

        return {
            status: "SUCCESS"
        };
    }
}
