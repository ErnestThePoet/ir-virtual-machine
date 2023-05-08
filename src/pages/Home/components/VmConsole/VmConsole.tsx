import React, { useEffect, useRef } from "react";
import styles from "./VmConsole.module.scss";
import { useAppDispatch } from "@/store/hooks";
import OutputBlock from "./OutputBlock/OutputBlock";
import InputBlock from "./InputBlock/InputBlock";
import {
    setConsoleInput,
    setConsoleInputPrompt,
    clearConsoleOutputs,
    setShouldIndicateCurrentLineNumber,
    syncVmState,
    addConsoleOutputs,
    SingleVmPageState
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType } from "@/modules/vm/vm";
import ControlPanel from "./ControlPanel/ControlPanel";

interface VmConsoleProps {
    vmIndex: number;
    vm: SingleVmPageState;
}

const VmConsole: React.FC<VmConsoleProps> = (props: VmConsoleProps) => {
    const dispatch = useAppDispatch();

    let inputResolve: ((_: string) => void) | null = null;

    const divVmConsole = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (props.vm.state === "WAIT_INPUT") {
            // Restore the resolve that current VM is awaiting
            inputResolve = vmContainer.resolvesAt(props.vmIndex);
        
            document.getElementById("inConsole")?.focus();
        } else {
            vmContainer.at(props.vmIndex).setReadConsoleFn(prompt => {
                dispatch(setConsoleInputPrompt(prompt));

                // When we click continously run and encounter a read,
                // this will get the page display updated.
                syncVmState(dispatch, props.vm.id);

                // Auto focus input
                document.getElementById("inConsole")?.focus();

                return new Promise(resolve => {
                    inputResolve = resolve;
                    vmContainer.setResolveAt(props.vmIndex, resolve);
                });
            });
        }
        
        divVmConsole.current?.scrollTo(0, divVmConsole.current.scrollHeight);
        
    }, [props.vmIndex, props.vm.id]);

    return (
        <div className={styles.divVmConsoleWrapper}>
            <ControlPanel
                onRunClick={async () => {
                    if (!vmContainer.at(props.vmIndex).canContinueExecution) {
                        if (
                            vmContainer.at(props.vmIndex).state === "WAIT_INPUT"
                        ) {
                            document.getElementById("inConsole")?.focus();
                        }
                        return;
                    }
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    await vmContainer.at(props.vmIndex).execute();
                    syncVmState(dispatch, props.vm.id);
                }}
                onRunStepClick={async () => {
                    if (!vmContainer.at(props.vmIndex).canContinueExecution) {
                        if (
                            vmContainer.at(props.vmIndex).state === "WAIT_INPUT"
                        ) {
                            document.getElementById("inConsole")?.focus();
                        }
                        return;
                    }
                    dispatch(setShouldIndicateCurrentLineNumber(true));
                    await vmContainer.at(props.vmIndex).executeSingleStep();
                    syncVmState(dispatch, props.vm.id);
                }}
                onResetClick={() => {
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    dispatch(setConsoleInputPrompt([]));
                    dispatch(setConsoleInput(""));
                    vmContainer.at(props.vmIndex).reset();
                    syncVmState(dispatch, props.vm.id);
                }}
                onClearClick={() => {
                    dispatch(clearConsoleOutputs());
                    dispatch(setConsoleInput(""));
                    if (props.vm.state === "WAIT_INPUT") {
                        document.getElementById("inConsole")?.focus();
                    }
                }}
            />

            <div
                ref={divVmConsole}
                id="divVmConsole"
                className={styles.divVmConsole}>
                {props.vm.consoleOutputs.map((x, i) => (
                    <OutputBlock key={i} message={x} />
                ))}
                <InputBlock
                    prompt={props.vm.consoleInputPrompt}
                    value={props.vm.consoleInput}
                    onChange={e => dispatch(setConsoleInput(e))}
                    onEnter={() => {
                        if (inputResolve !== null) {
                            inputResolve(props.vm.consoleInput);
                        }

                        dispatch(
                            addConsoleOutputs([
                                [
                                    { key: "CONSOLE_ARROW", type: "ARROW" },
                                    ...props.vm.consoleInputPrompt.map(x => ({
                                        ...x,
                                        type: "PROMPT" as ConsoleMessageType
                                    })),
                                    {
                                        key: "READ_INPUT",
                                        values: {
                                            value: props.vm.consoleInput
                                        },
                                        type: "NORMAL"
                                    }
                                ]
                            ])
                        );

                        dispatch(setConsoleInputPrompt([]));
                        dispatch(setConsoleInput(""));
                    }}
                />
            </div>
        </div>
    );
};

export default VmConsole;
