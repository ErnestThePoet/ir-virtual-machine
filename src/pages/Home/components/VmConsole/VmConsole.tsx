import React, { useEffect } from "react";
import styles from "./VmConsole.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIntl } from "react-intl";
import OutputBlock from "./OutputBlock/OutputBlock";
import InputBlock from "./InputBlock/InputBlock";
import {
    setConsoleInput,
    setConsoleInputPrompt,
    setConsoleOutputs
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType } from "@/modules/vm/vm";

const VmConsole: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);

    let inputResolve: ((_: string) => void) | null = null;

    useEffect(() => {
        vmContainer.at(vm.activeVmIndex).setIoFns(
            message =>
                dispatch(
                    setConsoleOutputs([
                        ...vm.vmPageStates[vm.activeVmIndex].consoleOutputs,
                        message
                    ])
                ),
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
            {vm.vmPageStates[vm.activeVmIndex].consoleOutputs.map((x, i) => (
                <OutputBlock key={i} message={x} />
            ))}
            <InputBlock
                prompt={vm.vmPageStates[vm.activeVmIndex].consoleInputPrompt}
                value={vm.vmPageStates[vm.activeVmIndex].consoleInput}
                onChange={e => dispatch(setConsoleInput(e))}
                onEnter={() => {
                    if (inputResolve !== null) {
                        inputResolve(
                            vm.vmPageStates[vm.activeVmIndex].consoleInput
                        );
                    }

                    dispatch(
                        setConsoleOutputs([
                            ...vm.vmPageStates[vm.activeVmIndex].consoleOutputs,
                            [
                                { key: "INPUT_PREFIX", type: "PROMPT" },
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
                            ]
                        ])
                    );

                    dispatch(setConsoleInput(""));
                }}
            />
        </div>
    );
};

export default VmConsole;
