import fs from "fs";
import readline from "readline";
import { ArgumentParser } from "argparse";
import { createIntl, createIntlCache, type IntlShape } from "@formatjs/intl";
import locales from "../../src/locales/index";
import {
    ConsoleMessageType,
    Vm,
    VmExecutionState
} from "../../src/modules/vm/vm";
import { splitLines } from "../../src/modules/utils";

const argParser = new ArgumentParser({
    description: "IR Virtual Machine CLI"
});

argParser.add_argument("irFile", {
    nargs: 1,
    help: "IR file to run"
});

argParser.add_argument("--prompt", {
    action: "store_true",
    dest: "prompt",
    help: "Print input prompt to stdout"
});

argParser.add_argument("--summary", {
    action: "store_true",
    dest: "summary",
    help: "Print execution summary to stdout after execution finishes"
});

argParser.add_argument("--locale", {
    action: "store",
    dest: "locale",
    choices: ["en", "zh-cn"],
    default: "zh-cn"
});

const args = argParser.parse_args();

const intlCache = createIntlCache();
let intl: IntlShape;

switch (args.locale) {
    case "en":
        intl = createIntl(
            {
                locale: "en",
                messages: locales[1].locale
            },
            intlCache
        );
        break;
    case "zh-cn":
    default:
        intl = createIntl(
            {
                locale: "zh-cn",
                messages: locales[0].locale
            },
            intlCache
        );
        break;
}

const readlineInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let irString: string;
try {
    irString = fs.readFileSync(args.irFile[0], {
        encoding: "utf-8"
    });
} catch (e) {
    console.error(e);
    process.exit(1);
}

const vm = new Vm();

function writeVmOutputs() {
    vm.flushWriteBuffer(messageParts => {
        for (const line of messageParts) {
            let hasWritten: boolean = false;
            let writtenToStdErr: boolean = false;
            for (const part of line) {
                switch (part.type) {
                    case ConsoleMessageType.OUTPUT:
                        process.stdout.write(
                            intl.formatMessage({ id: part.key }, part.values)
                        );

                        hasWritten = true;

                        break;
                    case ConsoleMessageType.ERROR:
                        process.stderr.write(
                            intl.formatMessage({ id: part.key }, part.values)
                        );

                        hasWritten = true;
                        writtenToStdErr = true;

                        break;
                    // Exection summary
                    case ConsoleMessageType.SUCCESS:
                    case ConsoleMessageType.WARNING:
                        if (args.summary) {
                            process.stdout.write(
                                intl.formatMessage(
                                    { id: part.key },
                                    part.values
                                )
                            );

                            hasWritten = true;

                            break;
                        }
                }
            }

            if (hasWritten) {
                (writtenToStdErr ? process.stderr : process.stdout).write("\n");
            }
        }
    });
}

vm.configure({
    maxExecutionStepCount: 0
});

let vmInputResolve: ((_: string) => void) | null = null;

readlineInterface.on("line", line => {
    vmInputResolve?.(line.trim());
    if (vmInputResolve && args.prompt) {
        process.stdout.write("\n");
    }
    vmInputResolve = null;
});

vm.setReadConsoleFn(prompt => {
    writeVmOutputs();

    if (args.prompt) {
        readlineInterface.setPrompt(
            prompt.reduce(
                (p, c) => p + intl.formatMessage({ id: c.key }, c.values),
                ""
            )
        );
        readlineInterface.prompt();
    }

    return new Promise(resolve => {
        vmInputResolve = resolve;
    });
});

vm.loadNewInstructions(splitLines(irString));
await vm.execute();

writeVmOutputs();

switch (vm.state) {
    case VmExecutionState.EXITED_NORMALLY:
        process.exit(0);
    case VmExecutionState.EXITED_ABNORMALLY:
        process.exit(vm.returnValue);
    case VmExecutionState.STATIC_CHECK_FAILED:
    case VmExecutionState.RUNTIME_ERROR:
        process.exit(1);
}
