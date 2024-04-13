import React, { useEffect, useRef, useState } from "react";
import styles from "./VmConsole.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import InputBlock from "./InputBlock/InputBlock";
import {
    setConsoleInput,
    setConsoleInputPrompt,
    clearConsoleOutputs,
    setShouldIndicateCurrentLineNumber,
    syncVmState,
    addConsoleOutputs,
    setLocalVariableTablesPagination
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { ConsoleMessageType, VmExecutionState } from "@/modules/vm/vm";
import ControlPanel from "./ControlPanel/ControlPanel";
import classNames from "classnames";
import { splitStreamInputs } from "@/modules/utils";
import OutputBlocks from "./OutputBlocks/OutputBlocks";

interface VmConsoleProps {
    vmIndex: number;
}

const VmConsole: React.FC<VmConsoleProps> = ({ vmIndex }: VmConsoleProps) => {
    const dispatch = useAppDispatch();

    const [showBoxShadow, setShowBoxShadow] = useState(false);

    const vmConsoleInput = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].consoleInput
    );
    const vmConsoleInputPrompt = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].consoleInputPrompt
    );
    const vmConsoleOutputs = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].consoleOutputs
    );

    // eslint-disable-next-line no-unused-vars
    const inputResolve = useRef<((_: string) => void) | null>(null);
    const inputBuffer = useRef<{ buffer: string[]; nextInputIndex: number }>({
        buffer: [],
        nextInputIndex: 0
    });

    const clearInputBuffer = () => {
        inputBuffer.current.buffer = [];
        inputBuffer.current.nextInputIndex = 0;
    };

    const divVmConsole = useRef<HTMLDivElement>(null);
    const inVmInput = useRef<HTMLInputElement>(null);

    const isContinuousExecution = useRef<boolean>(false);

    const currentVm = vmContainer.at(vmIndex);

    useEffect(() => {
        currentVm.setReadConsoleFn(prompt => {
            // When we encounter a read during continuous run or
            // single step run, this will get the page display updated.
            if (!isContinuousExecution.current) {
                dispatch(setShouldIndicateCurrentLineNumber(true));
            }
            dispatch(syncVmState());

            // Auto focus input
            inVmInput.current?.focus();

            if (
                inputBuffer.current.nextInputIndex <
                inputBuffer.current.buffer.length
            ) {
                dispatch(
                    addConsoleOutputs([
                        [
                            {
                                key: "CONSOLE_ARROW",
                                type: ConsoleMessageType.ARROW
                            },
                            ...prompt.map(x => ({
                                ...x,
                                type: ConsoleMessageType.PROMPT
                            })),
                            {
                                key: "READ_INPUT",
                                values: {
                                    value: vmConsoleInput
                                },
                                type: ConsoleMessageType.INPUT
                            }
                        ]
                    ])
                );

                return Promise.resolve(
                    inputBuffer.current.buffer[
                        inputBuffer.current.nextInputIndex++
                    ]
                );
            } else {
                dispatch(setConsoleInputPrompt(prompt));

                return new Promise(resolve => {
                    inputResolve.current = resolve;
                });
            }
        });

        return () => {
            // When VM is closed when waiting for input,
            // release the hung context
            if (inputResolve.current !== null) {
                inputResolve.current("");
                inputResolve.current = null;
            }
        };
    }, []);

    useEffect(() => {
        divVmConsole.current?.scrollTo(0, divVmConsole.current.scrollHeight);
    }, [vmConsoleInput, vmConsoleInputPrompt, vmConsoleOutputs]);

    const runVm = async () => {
        if (!currentVm.canContinueExecution) {
            if (currentVm.state === VmExecutionState.WAIT_INPUT) {
                inVmInput.current?.focus();
            }
            return;
        }

        isContinuousExecution.current = true;

        dispatch(setShouldIndicateCurrentLineNumber(false));
        await currentVm.executeContinuously();

        // VM has been closed when waiting for input.
        // Tabbar first set VM state to CLOSED,
        // then useEffect cleanup resolves VM's input Promise,
        // then the above await returns and control flow reaches here.
        if (currentVm.state === VmExecutionState.CLOSED) {
            return;
        }

        clearInputBuffer();
        dispatch(syncVmState());
    };

    const runVmSingleStep = async () => {
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
                clearInputBuffer();
                dispatch(setShouldIndicateCurrentLineNumber(false));
                break;
            // VM has been closed when waiting for input.
            // Same explanation as in runVm() above.
            case VmExecutionState.CLOSED:
                return;
        }
        dispatch(syncVmState());
    };

    const resetVm = () => {
        dispatch(setShouldIndicateCurrentLineNumber(false));
        dispatch(setConsoleInputPrompt([]));
        dispatch(setConsoleInput(""));
        dispatch(
            setLocalVariableTablesPagination({
                currentIndex: 1
            })
        );
        currentVm.reset();
        currentVm.decodeInstructions(true);

        // When VM is reset when waiting for input,
        // release the hung context
        if (inputResolve.current !== null) {
            inputResolve.current("");
            inputResolve.current = null;
        }

        clearInputBuffer();

        dispatch(syncVmState());
    };

    const clearConsole = () => {
        dispatch(clearConsoleOutputs());
        dispatch(setConsoleInput(""));
        if (currentVm.state === VmExecutionState.WAIT_INPUT) {
            inVmInput.current?.focus();
        }
    };

    return (
        <div
            className={styles.divVmConsoleWrapper}
            tabIndex={0}
            onKeyDown={e => {
                if (
                    e.key !== "F2" &&
                    e.key !== "F8" &&
                    e.key !== "F9" &&
                    e.key !== "F10"
                ) {
                    return;
                }

                e.preventDefault();

                switch (e.key) {
                    case "F2":
                        runVm();
                        break;
                    case "F8":
                        runVmSingleStep();
                        break;
                    case "F9":
                        resetVm();
                        break;
                    case "F10":
                        clearConsole();
                        break;
                }
            }}>
            <ControlPanel
                onRunClick={runVm}
                onRunStepClick={runVmSingleStep}
                onResetClick={resetVm}
                onClearClick={clearConsole}
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
                <OutputBlocks messages={vmConsoleOutputs} />

                <InputBlock
                    inputRef={inVmInput}
                    prompt={vmConsoleInputPrompt}
                    value={vmConsoleInput}
                    onChange={e => dispatch(setConsoleInput(e))}
                    onEnter={() => {
                        if (
                            currentVm.state === VmExecutionState.WAIT_INPUT ||
                            // Actually onEnter won't happen when VM is busy
                            currentVm.state === VmExecutionState.BUSY ||
                            // Also write input buffer when pausing in single step run
                            currentVm.state === VmExecutionState.FREE
                        ) {
                            const inputParts =
                                splitStreamInputs(vmConsoleInput);
                            inputBuffer.current.buffer.push(...inputParts);
                            // VM is waiting for input
                            if (
                                inputResolve.current !== null &&
                                inputBuffer.current.nextInputIndex <
                                    inputBuffer.current.buffer.length
                            ) {
                                inputResolve.current(
                                    inputBuffer.current.buffer[
                                        inputBuffer.current.nextInputIndex++
                                    ]
                                );
                                inputResolve.current = null;
                            }
                        }

                        dispatch(
                            addConsoleOutputs([
                                [
                                    {
                                        key: "CONSOLE_ARROW",
                                        type: ConsoleMessageType.ARROW
                                    },
                                    ...vmConsoleInputPrompt.map(x => ({
                                        ...x,
                                        type: ConsoleMessageType.PROMPT
                                    })),
                                    {
                                        key: "READ_INPUT",
                                        values: {
                                            value: vmConsoleInput
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

                <div
                    className={styles.divConsoleBlankArea}
                    onClick={() => inVmInput.current?.focus()}
                />
            </div>
        </div>
    );
};

export default VmConsole;
