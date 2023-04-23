import { Uint32 } from "./vm/data_types";

export function toHex(value: Uint32): string {
    return `0x${value.value.toString(16).toUpperCase()}`;
}

export function truncateString(title: string, length: number = 10) {
    let stringLengthAtDisplayLength = 0;
    let displayLength = 0;
    for (let i = 0; i < title.length; i++) {
        if (title[i].match(/^[\x00-\x7F]*$/) !== null) {
            displayLength++;
        } else {
            displayLength += 2;
        }

        if (displayLength > length) {
            stringLengthAtDisplayLength = i;
            break;
        }
    }

    if (displayLength <= length) {
        return title;
    }
    return title.substring(0, stringLengthAtDisplayLength) + "...";
}

export function splitLines(x: string): string[] {
    return x.replace("\r", "").split("\n");
}
