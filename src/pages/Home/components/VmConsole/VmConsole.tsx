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
    clearConsoleOutputs
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType } from "@/modules/vm/vm";
import ControlPanel from "./ControlPanel/ControlPanel";

const VmConsole: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);

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
    }, []);

    return (
        <div className={styles.divVmConsoleWrapper}>
            <ControlPanel
                onRunClick={() => {
                    vmContainer.at(vm.activeVmIndex).execute();
                }}
                onRunStepClick={() => {
                    vmContainer.at(vm.activeVmIndex).executeSingleStep();
                }}
                onResetClick={() => {
                    vmContainer.at(vm.activeVmIndex).reset();
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
