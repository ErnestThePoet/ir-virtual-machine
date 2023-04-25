import React, { useEffect, useRef } from "react";
import styles from "./VmConsole.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import OutputBlock from "./OutputBlock/OutputBlock";
import InputBlock from "./InputBlock/InputBlock";
import {
    addConsoleOutput,
    setConsoleInput,
    setConsoleInputPrompt,
    clearConsoleOutputs,
    setShouldIndicateCurrentLineNumber,
    syncVmState
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType } from "@/modules/vm/vm";
import ControlPanel from "./ControlPanel/ControlPanel";

const VmConsole: React.FC = () => {
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);

    const inputResolve = useRef<((_: string) => void) | null>(null);

    useEffect(() => {
        vmContainer.at(vm.activeVmIndex).setIoFns(
            message => dispatch(addConsoleOutput(message)),
            prompt => {
                dispatch(setConsoleInputPrompt(prompt));

                // When we click continously run and encounter a read,
                // this will get the page display updated.
                syncVmState(dispatch, vm);

                // Auto focus input
                document.getElementById("inConsole")?.focus();

                return new Promise(resolve => {
                    inputResolve.current = resolve;
                });
            }
        );
    }, [vm.activeVmIndex]);

    return (
        <div className={styles.divVmConsoleWrapper}>
            <ControlPanel
                onRunClick={async () => {
                    if (
                        !vmContainer.at(vm.activeVmIndex).canContinueExecution
                    ) {
                        return;
                    }
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    await vmContainer.at(vm.activeVmIndex).execute();
                    syncVmState(dispatch, vm);
                }}
                onRunStepClick={async () => {
                    if (
                        !vmContainer.at(vm.activeVmIndex).canContinueExecution
                    ) {
                        return;
                    }
                    dispatch(setShouldIndicateCurrentLineNumber(true));
                    await vmContainer.at(vm.activeVmIndex).executeSingleStep();
                    syncVmState(dispatch, vm);
                }}
                onResetClick={() => {
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    dispatch(setConsoleInputPrompt([]));
                    dispatch(setConsoleInput(""));
                    vmContainer.at(vm.activeVmIndex).reset();
                    syncVmState(dispatch, vm);
                }}
                onClearClick={() => {
                    dispatch(clearConsoleOutputs());
                    dispatch(setConsoleInput(""));
                }}
            />

            <div className={styles.divVmConsole}>
                {vm.vmPageStates[vm.activeVmIndex].consoleOutputs.map(
                    (x, i) => (
                        <OutputBlock key={i} message={x} />
                    )
                )}
                <InputBlock
                    prompt={
                        vm.vmPageStates[vm.activeVmIndex].consoleInputPrompt
                    }
                    value={vm.vmPageStates[vm.activeVmIndex].consoleInput}
                    onChange={e => dispatch(setConsoleInput(e))}
                    onEnter={() => {
                        if (inputResolve.current !== null) {
                            inputResolve.current(
                                vm.vmPageStates[vm.activeVmIndex].consoleInput
                            );
                        }

                        dispatch(
                            addConsoleOutput([
                                { key: "CONSOLE_ARROW", type: "ARROW" },
                                ...vm.vmPageStates[
                                    vm.activeVmIndex
                                ].consoleInputPrompt.map(x => ({
                                    ...x,
                                    type: "PROMPT" as ConsoleMessageType
                                })),
                                {
                                    key: "READ_INPUT",
                                    values: {
                                        value: vm.vmPageStates[vm.activeVmIndex]
                                            .consoleInput
                                    },
                                    type: "NORMAL"
                                }
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
