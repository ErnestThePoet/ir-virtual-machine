import { KB, MB } from "./constants";

type BKBMB = "B" | "KB" | "MB";

interface ArbitraryUnitSize {
    size: number;
    unit: BKBMB;
}

interface ArbitraryUnitMemoryUsage {
    used: number;
    total: number;
    unit: BKBMB;
}

export function truncateString(title: string, length: number = 18) {
    let stringLengthAtDisplayLength = 0;
    let displayLength = 0;
    for (let i = 0; i < title.length; i++) {
        // eslint-disable-next-line no-control-regex
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

export function getNextUntitledVmName(names: string[]): string {
    for (let i = 1; ; i++) {
        const currentName = `Untitled-${i}`;
        if (names.every(x => x !== currentName)) {
            return currentName;
        }
    }
}

export function splitLines(x: string): string[] {
    return x.split(/\r\n|[\r\n]/);
}

export function splitStreamInputs(x: string): string[] {
    return x
        .trim()
        .split(/\s/)
        .filter(x => x.length > 0);
}

export function getArbitraryUnitSize(size: number): ArbitraryUnitSize {
    if (size < KB) {
        return {
            size,
            unit: "B"
        };
    } else if (size < MB) {
        return {
            size: size / KB,
            unit: "KB"
        };
    } else {
        return {
            size: size / MB,
            unit: "MB"
        };
    }
}

export function getArbitraryUnitMemoryUsage(
    used: number,
    total: number
): ArbitraryUnitMemoryUsage {
    if (total < KB) {
        return {
            used,
            total,
            unit: "B"
        };
    } else if (total < MB) {
        return {
            used: used / KB,
            total: total / KB,
            unit: "KB"
        };
    } else {
        return {
            used: used / MB,
            total: total / MB,
            unit: "MB"
        };
    }
}

export function stringCompare(a: string, b: string): number {
    if (a < b) {
        return -1;
    } else if (a === b) {
        return 0;
    } else {
        return 1;
    }
}
