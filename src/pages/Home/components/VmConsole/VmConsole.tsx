import React, { useEffect } from "react";
import styles from "./VmConsole.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIntl } from "react-intl";
import OutputBlock from "./OutputBlock/OutputBlock";
import InputBlock from "./InputBlock/InputBlock";
import {
    addConsoleOutput,
    setConsoleInput,
    setConsoleInputPrompt,
    clearConsoleOutputs,
    setState,
    setGlobalVariableDetails,
    setLocalVariableDetailsStack,
    setStepCount,
    setMemoryUsage,
    setStaticErrorTable,
    setCurrentLineNumber,
    setShouldIndicateCurrentLineNumber
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType } from "@/modules/vm/vm";
import ControlPanel from "./ControlPanel/ControlPanel";

const VmConsole: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);

    const fetchVmState = () => {
        dispatch(setState(vmContainer.at(vm.activeVmIndex).state));
        dispatch(
            setGlobalVariableDetails(
                vmContainer.at(vm.activeVmIndex).globalVariableDetails
            )
        );
        dispatch(
            setLocalVariableDetailsStack(
                vmContainer.at(vm.activeVmIndex).localVariableDetailsStack
            )
        );
        dispatch(setStepCount(vmContainer.at(vm.activeVmIndex).stepCount));
        dispatch(setMemoryUsage(vmContainer.at(vm.activeVmIndex).memoryUsage));
        dispatch(
            setStaticErrorTable(
                vmContainer.at(vm.activeVmIndex).staticErrorTable
            )
        );
        dispatch(
            setCurrentLineNumber(
                vmContainer.at(vm.activeVmIndex).currentLineNumber
            )
        );
    };

    let inputResolve: ((_: string) => void) | null = null;

    useEffect(() => {
        vmContainer.at(vm.activeVmIndex).setIoFns(
            message => dispatch(addConsoleOutput(message)),
            prompt => {
                dispatch(setConsoleInputPrompt(prompt));

                return new Promise(resolve => {
                    inputResolve = resolve;
                });
            }
        );
    }, [vm.activeVmIndex]);

    return (
        <div className={styles.divVmConsoleWrapper}>
            <ControlPanel
                onRunClick={async () => {
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    await vmContainer.at(vm.activeVmIndex).execute();
                    fetchVmState();
                }}
                onRunStepClick={async () => {
                    dispatch(setShouldIndicateCurrentLineNumber(true));
                    await vmContainer.at(vm.activeVmIndex).executeSingleStep();
                    fetchVmState();
                }}
                onResetClick={() => {
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    vmContainer.at(vm.activeVmIndex).reset();
                    fetchVmState();
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
                        if (inputResolve !== null) {
                            inputResolve(
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

                        dispatch(setConsoleInput(""));
                    }}
                />
            </div>
        </div>
    );
};

export default VmConsole;
