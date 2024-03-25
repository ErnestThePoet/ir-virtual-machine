import React, { useEffect, useRef, useState } from "react";
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
    SingleVmPageState,
    setLocalVariableTablePageIndex
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType, VmExecutionState } from "@/modules/vm/vm";
import ControlPanel from "./ControlPanel/ControlPanel";
import { useEffectDeep } from "@/modules/hooks/useEffectDeep";
import classNames from "classnames";

interface VmConsoleProps {
    vmIndex: number;
    vm: SingleVmPageState;
}

const VmConsole: React.FC<VmConsoleProps> = (props: VmConsoleProps) => {
    const dispatch = useAppDispatch();

    const [showBoxShadow, setShowBoxShadow] = useState(false);

    const inputResolve = useRef<((_: string) => void) | null>(null);

    const divVmConsole = useRef<HTMLDivElement>(null);
    const inVmInput = useRef<HTMLInputElement>(null);

    const isContinuousExecution = useRef<boolean>(false);

    const currentVm = vmContainer.at(props.vmIndex);

    useEffect(() => {
        currentVm.setReadConsoleFn(prompt => {
            dispatch(setConsoleInputPrompt(prompt));

            // When we encounter a read during continuous run or
            // single step run, this will get the page display updated.
            if (!isContinuousExecution.current) {
                dispatch(setShouldIndicateCurrentLineNumber(true));
            }
            syncVmState(dispatch, props.vm.id);

            // Auto focus input
            inVmInput.current?.focus();

            return new Promise(resolve => {
                inputResolve.current = resolve;
            });
        });
    }, []);

    useEffectDeep(() => {
        divVmConsole.current?.scrollTo(0, divVmConsole.current.scrollHeight);
    }, [
        props.vm.consoleInput,
        props.vm.consoleInputPrompt,
        props.vm.consoleOutputs
    ]);

    return (
        <div className={styles.divVmConsoleWrapper}>
            <ControlPanel
                onRunClick={async () => {
                    if (!currentVm.canContinueExecution) {
                        if (currentVm.state === VmExecutionState.WAIT_INPUT) {
                            inVmInput.current?.focus();
                        }
                        return;
                    }

                    isContinuousExecution.current = true;

                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    await currentVm.execute();
                    syncVmState(dispatch, props.vm.id);
                }}
                onRunStepClick={async () => {
                    if (!currentVm.canContinueExecution) {
                        if (currentVm.state === VmExecutionState.WAIT_INPUT) {
                            inVmInput.current?.focus();
                        }
                        return;
                    }

                    isContinuousExecution.current = false;

                    await currentVm.executeSingleStep();
                    switch (currentVm.state) {
                        case VmExecutionState.FREE:
                            dispatch(setShouldIndicateCurrentLineNumber(true));
                            break;
                        case VmExecutionState.EXITED_NORMALLY:
                        case VmExecutionState.EXITED_ABNORMALLY:
                            dispatch(setShouldIndicateCurrentLineNumber(false));
                            break;
                    }
                    syncVmState(dispatch, props.vm.id);
                }}
                onResetClick={() => {
                    dispatch(setShouldIndicateCurrentLineNumber(false));
                    dispatch(setConsoleInputPrompt([]));
                    dispatch(setConsoleInput(""));
                    dispatch(setLocalVariableTablePageIndex(1));
                    currentVm.reset();
                    currentVm.decodeInstructions(true);
                    syncVmState(dispatch, props.vm.id);
                }}
                onClearClick={() => {
                    dispatch(clearConsoleOutputs());
                    dispatch(setConsoleInput(""));
                    if (props.vm.state === VmExecutionState.WAIT_INPUT) {
                        inVmInput.current?.focus();
                    }
                }}
            />

            <div
                ref={divVmConsole}
                className={classNames(
                    styles.divVmConsole,
                    showBoxShadow && styles.divVmConsoleBoxShadow
                )}
                onScroll={e => {
                    if (e.currentTarget.scrollTop > 0 && !showBoxShadow) {
                        setShowBoxShadow(true);
                    } else if (
                        e.currentTarget.scrollTop <= 0 &&
                        showBoxShadow
                    ) {
                        setShowBoxShadow(false);
                    }
                }}>
                {props.vm.consoleOutputs.map((x, i) => (
                    <OutputBlock key={i} message={x} />
                ))}
                <InputBlock
                    inputRef={inVmInput}
                    prompt={props.vm.consoleInputPrompt}
                    value={props.vm.consoleInput}
                    onChange={e => dispatch(setConsoleInput(e))}
                    onEnter={() => {
                        if (inputResolve.current !== null) {
                            inputResolve.current(props.vm.consoleInput);
                        }

                        dispatch(
                            addConsoleOutputs([
                                [
                                    {
                                        key: "CONSOLE_ARROW",
                                        type: ConsoleMessageType.ARROW
                                    },
                                    ...props.vm.consoleInputPrompt.map(x => ({
                                        ...x,
                                        type: ConsoleMessageType.PROMPT
                                    })),
                                    {
                                        key: "READ_INPUT",
                                        values: {
                                            value: props.vm.consoleInput
                                        },
                                        type: ConsoleMessageType.INPUT
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
