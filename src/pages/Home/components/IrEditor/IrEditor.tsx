import React, { useEffect, useRef } from "react";
import "./IrEditor.scss";
import styles from "./IrEditor.module.scss";
import { useAppDispatch } from "@/store/hooks";
import { useIntl } from "react-intl";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { splitLines } from "@/modules/utils";
import {
    syncVmState,
    setIrString,
    setIsIrChanged,
    SingleVmPageState,
    setShouldIndicateCurrentLineNumber,
    setConsoleInputPrompt,
    setConsoleInput,
    setLocalVariableTablePageIndex
} from "@/store/reducers/vm";
import { Editor, Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import { registerIr } from "@/modules/ir/registerIr";
import { useEffectDeep } from "@/modules/hooks/useEffectDeep";

interface IrEditorProps {
    vmIndex: number;
    vm: SingleVmPageState;
}

const DECODE_INTERVAL_MS = 100;

const IrEditor: React.FC<IrEditorProps> = (props: IrEditorProps) => {
    const intl = useIntl();

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

    const irLines = useRef<string[]>([]);

    const dispatch = useAppDispatch();

    const currentVm = vmContainer.at(props.vmIndex);

    useEffectDeep(() => {
        if (
            monacoRef.current !== null &&
            editorRef.current !== null &&
            editorRef.current.getModel() !== null
        ) {
            monacoRef.current.editor.setModelMarkers(
                editorRef.current.getModel()!,
                "IR Decoder",
                props.vm.staticErrors.map(x => ({
                    startLineNumber: x.startLineNumber,
                    endLineNumber: x.endLineNumber,
                    startColumn: x.startColumn,
                    endColumn: x.endColumn + 1,
                    message: intl.formatMessage(
                        { id: x.message.key },
                        x.message.values
                    ),
                    severity: monacoRef.current!.MarkerSeverity.Error
                }))
            );
        }
        // make sure changing locale when there are already markers
        // will change marker messages
    }, [props.vm.staticErrors, intl.messages]);

    useEffectDeep(() => {
        if (runtimeErrorDecorations.current !== null) {
            runtimeErrorDecorations.current.clear();
        }

        if (
            monacoRef.current !== null &&
            editorRef.current !== null &&
            editorRef.current.getModel() !== null
        ) {
            // Avoid scrolling to line -1 when runtime errors are cleared
            if (props.vm.runtimeErrors.length > 0) {
                editorRef.current.revealLineInCenterIfOutsideViewport(
                    props.vm.currentLineNumber
                );
            }
            runtimeErrorDecorations.current =
                editorRef.current.createDecorationsCollection(
                    props.vm.runtimeErrors.map(x => ({
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
                                )
                            }
                        }
                    }))
                );
        }
    }, [props.vm.runtimeErrors, intl.messages]);

    useEffect(() => {
        if (currentLineDecorations.current !== null) {
            currentLineDecorations.current.clear();
        }

        if (
            !props.vm.shouldIndicateCurrentLineNumber ||
            currentVm.instructions[props.vm.currentLineNumber - 1] === undefined
        ) {
            return;
        }

        if (monacoRef.current !== null && editorRef.current !== null) {
            editorRef.current.revealLineInCenterIfOutsideViewport(
                props.vm.currentLineNumber
            );
            currentLineDecorations.current =
                editorRef.current.createDecorationsCollection([
                    {
                        range: new monacoRef.current.Range(
                            props.vm.currentLineNumber,
                            1,
                            props.vm.currentLineNumber,
                            currentVm.instructions[
                                props.vm.currentLineNumber - 1
                            ].length + 1
                        ),
                        options: {
                            isWholeLine: true,
                            className: "rangeCurrentLine",
                            marginClassName: "rangeCurrentLine"
                        }
                    }
                ]);
        }
    }, [props.vm.currentLineNumber, props.vm.shouldIndicateCurrentLineNumber]);

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
                    syncVmState(dispatch, props.vm.id);
                }, DECODE_INTERVAL_MS)
            };
        }

        const newIrLines = splitLines(newIr);

        irLines.current = newIrLines;

        currentVm.loadNewInstructions(newIrLines);

        dispatch(setShouldIndicateCurrentLineNumber(false));
        dispatch(setConsoleInputPrompt([]));
        dispatch(setConsoleInput(""));
        dispatch(setLocalVariableTablePageIndex(1));
        dispatch(setIrString(newIr));
        dispatch(setIsIrChanged(true));

        syncVmState(dispatch, props.vm.id);
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
                    editor.setValue(props.vm.irString);
                }}
                onChange={e => onIrChange(e)}
                options={{
                    minimap: {
                        enabled: false
                    }
                }}
            />
        </div>
    );
};

export default IrEditor;
