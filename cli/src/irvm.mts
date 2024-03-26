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
import { splitLines, splitStreamInputs } from "../../src/modules/utils";

const argParser = new ArgumentParser({
    description: "IR Virtual Machine CLI"
});

argParser.add_argument("irFile", {
    nargs: 1,
    help: "path to IR file that will be run"
});

argParser.add_argument("-p", "--prompt", {
    action: "store_true",
    dest: "prompt",
    help: "print input prompt to stdout"
});

argParser.add_argument("-s", "--summary", {
    action: "store_true",
    dest: "summary",
    help: "print execution summary to stdout after execution finishes"
});

argParser.add_argument("-l", "--locale", {
    action: "store",
    dest: "locale",
    choices: ["en", "zh-cn"],
    default: "zh-cn",
    help: "CLI message locale, defaults to 'zh-cn'"
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
    input: process.stdin
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

const inputBuffer: string[] = [];
let nextInputIndex: number = 0;

let vmInputResolve: ((_: string) => void) | null = null;

readlineInterface.on("line", line => {
    const inputParts = splitStreamInputs(line);
    inputBuffer.push(...inputParts);
    // VM is waiting for input
    if (vmInputResolve !== null && nextInputIndex < inputBuffer.length) {
        vmInputResolve(inputBuffer[nextInputIndex++]);
        vmInputResolve = null;
    }
});

vm.setReadConsoleFn(prompt => {
    writeVmOutputs();

    if (args.prompt) {
        console.log(
            prompt.reduce(
                (p, c) => p + intl.formatMessage({ id: c.key }, c.values),
                ""
            )
        );
    }

    if (nextInputIndex < inputBuffer.length) {
        return Promise.resolve(inputBuffer[nextInputIndex++]);
    } else {
        return new Promise(resolve => {
            vmInputResolve = resolve;
        });
    }
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
