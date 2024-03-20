export function truncateString(title: string, length: number = 18) {
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

export function getNextUntitledVmName(names: string[]): string {
    for (let i = 1; ; i++) {
        const currentName = `Untitled-${i}`;
        if (names.every(x => x !== currentName)) {
            return currentName;
        }
    }
}

export function splitLines(x: string): string[] {
    return x.replace(/\r/g, "").split("\n");
}

export function toKiB(b: number): number {
    return b / 1024;
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

export function isMobileBrowser() {
    const uaLowerCase = navigator.userAgent.toLowerCase();
    return (
        uaLowerCase.includes("android") ||
        uaLowerCase.includes("harmony") ||
        uaLowerCase.includes("iphone") ||
        uaLowerCase.includes("ipad") ||
        uaLowerCase.includes("mobile")
    );
}
