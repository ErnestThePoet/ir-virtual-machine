import React, { useEffect, useRef } from "react";
import "./IrEditor.scss";
import styles from "./IrEditor.module.scss";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIntl } from "react-intl";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { splitLines } from "@/modules/utils";
import {
    syncVmState,
    setIrString,
    setIsIrChanged,
    setShouldIndicateCurrentLineNumber,
    setConsoleInputPrompt,
    setConsoleInput,
    setLocalVariableTablePageIndex
} from "@/store/reducers/vm";
import { Editor, Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import { registerIr } from "@/modules/ir/registerIr";

interface IrEditorProps {
    vmIndex: number;
}

const DECODE_INTERVAL_MS = 100;

const IrEditor: React.FC<IrEditorProps> = ({ vmIndex }: IrEditorProps) => {
    const intl = useIntl();

    const vmStaticErrors = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].staticErrors
    );
    const vmRuntimeErrors = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].runtimeErrors
    );
    const vmCurrentLineNumber = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].currentLineNumber
    );
    const vmShouldIndicateCurrentLineNumber = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].shouldIndicateCurrentLineNumber
    );
    const vmIrString: string | undefined = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].irString
    );

    const monacoRef = useRef<Monaco | null>(null);
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(
        null
    );

    const runtimeErrorDecorations =
        useRef<monacoEditor.editor.IEditorDecorationsCollection | null>(null);

    const currentLineDecorations =
        useRef<monacoEditor.editor.IEditorDecorationsCollection | null>(null);

    const pendingDecode = useRef<{
        time: number;
        timeoutId: ReturnType<typeof setTimeout>;
    } | null>(null);

    const dispatch = useAppDispatch();

    const currentVm = vmContainer.at(vmIndex);

    const syncStaticErrors = () => {
        if (
            monacoRef.current !== null &&
            editorRef.current !== null &&
            editorRef.current.getModel() !== null
        ) {
            monacoRef.current.editor.setModelMarkers(
                editorRef.current.getModel()!,
                "IR Decoder",
                vmStaticErrors.map(x => ({
                    startLineNumber: x.startLineNumber,
                    endLineNumber: x.endLineNumber,
                    startColumn: x.startColumn,
                    endColumn: x.endColumn + 1,
                    message: intl.formatMessage(
                        { id: x.message.key },
                        x.message.values
                    ) as string,
                    severity: monacoRef.current!.MarkerSeverity.Error
                }))
            );
        }
    };

    // make sure changing locale when there are already markers
    // will change marker messages
    useEffect(syncStaticErrors, [vmStaticErrors, intl.messages]);

    useEffect(() => {
        if (runtimeErrorDecorations.current !== null) {
            runtimeErrorDecorations.current.clear();
        }

        if (
            monacoRef.current !== null &&
            editorRef.current !== null &&
            editorRef.current.getModel() !== null
        ) {
            // Avoid scrolling to line -1 when runtime errors are cleared
            if (vmRuntimeErrors.length > 0) {
                editorRef.current.revealLineInCenterIfOutsideViewport(
                    vmCurrentLineNumber
                );
            }
            runtimeErrorDecorations.current =
                editorRef.current.createDecorationsCollection(
                    vmRuntimeErrors.map(x => ({
                        range: new monacoRef.current!.Range(
                            x.startLineNumber,
                            x.startColumn,
                            x.endLineNumber,
                            x.endColumn
                        ),
                        options: {
                            isWholeLine: true,
                            className: "rangeError",
                            marginClassName: "rangeError",
                            hoverMessage: {
                                value: intl.formatMessage(
                                    { id: x.message.key },
                                    x.message.values
                                ) as string
                            }
                        }
                    }))
                );
        }
    }, [vmRuntimeErrors, intl.messages]);

    useEffect(() => {
        if (currentLineDecorations.current !== null) {
            currentLineDecorations.current.clear();
        }

        if (
            !vmShouldIndicateCurrentLineNumber ||
            currentVm.instructions[vmCurrentLineNumber - 1] === undefined
        ) {
            return;
        }

        if (monacoRef.current !== null && editorRef.current !== null) {
            editorRef.current.revealLineInCenterIfOutsideViewport(
                vmCurrentLineNumber
            );
            currentLineDecorations.current =
                editorRef.current.createDecorationsCollection([
                    {
                        range: new monacoRef.current.Range(
                            vmCurrentLineNumber,
                            1,
                            vmCurrentLineNumber,
                            currentVm.instructions[vmCurrentLineNumber - 1]
                                .length + 1
                        ),
                        options: {
                            isWholeLine: true,
                            className: "rangeCurrentLine",
                            marginClassName: "rangeCurrentLine"
                        }
                    }
                ]);
        }
    }, [vmCurrentLineNumber, vmShouldIndicateCurrentLineNumber]);

    const onIrChange = (newIr: string | undefined) => {
        if (newIr === undefined) {
            return;
        }

        const nowTimeMs = new Date().getTime();
        if (
            pendingDecode.current === null ||
            pendingDecode.current.time < nowTimeMs
        ) {
            pendingDecode.current = {
                time: nowTimeMs + DECODE_INTERVAL_MS,
                timeoutId: setTimeout(() => {
                    currentVm.decodeInstructions(true);
                    dispatch(syncVmState());
                }, DECODE_INTERVAL_MS)
            };
        }

        currentVm.loadNewInstructions(splitLines(newIr));

        dispatch(setShouldIndicateCurrentLineNumber(false));
        dispatch(setConsoleInputPrompt([]));
        dispatch(setConsoleInput(""));
        dispatch(setLocalVariableTablePageIndex(1));
        dispatch(setIrString(newIr));
        dispatch(setIsIrChanged(true));

        dispatch(syncVmState());
    };

    return (
        <div className={styles.divMonacoEditorWrapper}>
            <Editor
                language="ir"
                theme="ir-theme"
                beforeMount={monaco => {
                    monacoRef.current = monaco;
                    registerIr(monaco);
                }}
                onMount={editor => {
                    editorRef.current = editor;
                    editor.setValue(vmIrString);
                    // The useEffect that calls syncStaticErrors at initial
                    // render will see monacoRef.current and editorRef.current
                    // null, so we manually syncStaticErrors here.
                    // synvVmState isn't necessary because initial
                    // VM states are already synced in addVmPageState
                    syncStaticErrors();
                }}
                onChange={e => onIrChange(e)}
                options={{
                    scrollbar: {
                        verticalScrollbarSize: 13,
                        horizontalScrollbarSize: 13
                    },
                    minimap: {
                        enabled: false
                    }
                }}
            />
        </div>
    );
};

export default IrEditor;
