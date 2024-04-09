import { AppDispatch } from "@/store";
import { Vm, VmOptionsPartial } from "../vm/vm";
import { splitLines } from "../utils";
import vmContainer from "../vmContainer";
import { addVmPageState } from "@/store/reducers/vm";
import { IntlShape } from "react-intl";
import { message } from "antd";

export const saveIr = (name: string, irString: string) => {
    const stringUrl = URL.createObjectURL(
        new Blob([irString], { type: "data:attachment/plain" })
    );

    const anchor = document.createElement("a");
    anchor.href = stringUrl;
    anchor.download = name.endsWith(".ir") ? name : `${name}.ir`;

    anchor.click();

    URL.revokeObjectURL(stringUrl);
};

export const importIr = (
    dispatch: AppDispatch,
    vmName: string,
    irString: string,
    options?: VmOptionsPartial
) => {
    const newVm = new Vm();
    if (options !== undefined) {
        newVm.configure(options);
    }

    newVm.loadAndDecodeNewInstructions(splitLines(irString));

    vmContainer.add(newVm);

    dispatch(
        addVmPageState({
            name: vmName,
            irPath: "",
            isIrChanged: false,
            irString: irString,

            state: newVm.state,
            globalVariableDetails: newVm.globalVariableDetails,
            localVariableDetailsStack: newVm.localVariableDetailsStack,
            options: newVm.currentOptions,
            stepCount: newVm.stepCount,
            memoryUsage: newVm.memoryUsage,
            peakMemoryUsage: newVm.currentPeakMemoryUsage,

            consoleOutputs: [],
            consoleInputPrompt: [],
            consoleInput: "",

            staticErrors: newVm.staticErrors,
            runtimeErrors: newVm.runtimeErrors,
            currentLineNumber: newVm.currentLineNumber,
            shouldIndicateCurrentLineNumber: false,

            localVariableTablePageIndex: 1
        })
    );
};

export const importIrFile = (
    dispatch: AppDispatch,
    intl: IntlShape,
    file: File
) => {
    if (!file.name.endsWith(".ir")) {
        message.error(
            intl.formatMessage(
                {
                    id: "NOT_AN_IR_FILE"
                },
                { fileName: file.name }
            )
        );
        return;
    }

    const fileReader = new FileReader();

    fileReader.readAsText(file);

    fileReader.onload = res => {
        if (res.target === null) {
            message.error(
                intl.formatMessage(
                    {
                        id: "IR_IMPORT_FAILED"
                    },
                    { fileName: file.name }
                )
            );

            (document.getElementById("inImportIr") as HTMLInputElement).value =
                "";

            return;
        }

        importIr(dispatch, file.name, res.target.result as string);
    };
};
