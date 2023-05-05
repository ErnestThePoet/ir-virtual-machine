import React from "react";
import { useAppDispatch } from "@/store/hooks";
import { useIntl } from "react-intl";
import styles from "./IrEditor.module.scss";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { splitLines } from "@/modules/utils";
import {
    syncVmState,
    setIrString,
    setIsIrChanged,
    setPeakMemoryUsage,
    SingleVmPageState
} from "@/store/reducers/vm";
import LineHighlighter from "./LineHighlighter/LineHighlighter";
import classNames from "classnames";

interface IrEditorProps {
    vmIndex: number;
    vm: SingleVmPageState;
}

const IrEditor: React.FC<IrEditorProps> = (props: IrEditorProps) => {
    const intl = useIntl();

    const dispatch = useAppDispatch();

    const irLines = splitLines(props.vm.irString);

    return (
        <div className={styles.divIrEditorWrapper}>
            <div className={styles.divLineNumberWrapper}>
                {irLines.map((_, i) => (
                    <label
                        key={"label" + i}
                        className={classNames({
                            [styles.lblLineNumberNormal]:
                                !props.vm.shouldIndicateCurrentLineNumber ||
                                i + 1 !== props.vm.currentLineNumber,
                            [styles.lblLineNumberIndication]:
                                props.vm.shouldIndicateCurrentLineNumber &&
                                i + 1 === props.vm.currentLineNumber
                        })}>
                        {props.vm.state === "STATIC_CHECK_FAILED" &&
                            i + 1 in props.vm.staticErrorTable && (
                                <LineHighlighter
                                    key={"sehighlighter" + i}
                                    type="ERROR"
                                    title={intl.formatMessage(
                                        {
                                            id: props.vm.staticErrorTable[i + 1]
                                                .key
                                        },
                                        props.vm.staticErrorTable[i + 1].values
                                    )}
                                />
                            )}
                        {props.vm.state === "RUNTIME_ERROR" &&
                            i + 1 in props.vm.runtimeErrorTable && (
                                <LineHighlighter
                                    key={"rehighlighter" + i}
                                    type="ERROR"
                                    title={intl.formatMessage(
                                        {
                                            id: props.vm.runtimeErrorTable[
                                                i + 1
                                            ].key
                                        },
                                        props.vm.runtimeErrorTable[i + 1].values
                                    )}
                                />
                            )}
                        {i + 1}
                    </label>
                ))}
            </div>

            <div className={styles.divIrWrapper}>
                <textarea
                    id="taIr"
                    // line-height*lineCount
                    style={{
                        height: `${20 * irLines.length}px`
                    }}
                    spellCheck={false}
                    className={styles.taIr}
                    value={props.vm.irString}
                    onChange={e => {
                        const currentVm = vmContainer.at(props.vmIndex);
                        currentVm.loadNewInstructions(
                            splitLines(e.currentTarget.value)
                        );
                        syncVmState(dispatch, props.vm.id);
                        // Manually force reset peak memory usage
                        dispatch(
                            setPeakMemoryUsage({
                                total: 0,
                                stack: 0,
                                globalVariable: 0
                            })
                        );
                        dispatch(setIrString(e.currentTarget.value));
                        dispatch(setIsIrChanged(true));
                        window.onbeforeunload = (e: BeforeUnloadEvent) => {
                            e.preventDefault();
                            return (e.returnValue = "");
                        };
                    }}
                />
            </div>
        </div>
    );
};

export default IrEditor;
