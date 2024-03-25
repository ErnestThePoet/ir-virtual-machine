import fs from "fs";
import readline from "readline";
import { createIntl, createIntlCache, type IntlShape } from "@formatjs/intl";
import locales from "../../src/locales/index";
import {
    ConsoleMessageType,
    Vm,
    VmExecutionState
} from "../../src/modules/vm/vm";
import { splitLines } from "../../src/modules/utils";

if (process.argv.length !== 3 && process.argv.length !== 4) {
    console.log("Usage:\nnode irvm.cjs <ir-file> [--en]");
    process.exit(1);
}

const intlCache = createIntlCache();
let intl: IntlShape;

if (process.argv.length === 4 && process.argv[3] === "--en") {
    intl = createIntl(
        {
            locale: "en",
            messages: locales[1].locale
        },
        intlCache
    );
} else {
    intl = createIntl(
        {
            locale: "zh-cn",
            messages: locales[0].locale
        },
        intlCache
    );
}

const readlineInterface = readline.createInterface({
    input: process.stdin
});

let irString: string;
try {
    irString = fs.readFileSync(process.argv[2], {
        encoding: "utf-8"
    });
} catch (e) {
    console.error(e);
    process.exit(1);
}

const vm = new Vm();

vm.configure({
    maxExecutionStepCount: 0
});

let vmInputResolve: ((_: string) => void) | null = null;

vm.setReadConsoleFn(prompt => {
    readlineInterface.on("line", line => {
        vmInputResolve?.(line);
    });

    return new Promise(resolve => {
        vmInputResolve = resolve;
    });
});

vm.loadNewInstructions(splitLines(irString));
await vm.execute();

vm.flushWriteBuffer(messageParts => {
    for (const line of messageParts) {
        let hasWritten: boolean = false;
        for (const part of line) {
            if (
                part.type === ConsoleMessageType.OUTPUT ||
                part.type === ConsoleMessageType.ERROR
            ) {
                process.stdout.write(
                    intl.formatMessage({ id: part.key }, part.values)
                );

                hasWritten = true;
            }
        }

        if (hasWritten) {
            process.stdout.write("\n");
        }
    }
});

switch (vm.state) {
    case VmExecutionState.EXITED_NORMALLY:
        process.exit(0);
    case VmExecutionState.EXITED_ABNORMALLY:
        process.exit(vm.returnValue);
    case VmExecutionState.STATIC_CHECK_FAILED:
    case VmExecutionState.RUNTIME_ERROR:
        process.exit(1);
}
