import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIntl } from "react-intl";
import styles from "./IrEditor.module.scss";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { splitLines } from "@/modules/utils";
import { syncVmState, setIrString, setIsIrChanged, setPeakMemoryUsage } from "@/store/reducers/vm";
import LineHighlighter from "./LineHighlighter/LineHighlighter";
import classNames from "classnames";

const IrEditor: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);
    const dispatch = useAppDispatch();

    const irLines = splitLines(vm.vmPageStates[vm.activeVmIndex].irString);

    return (
        <div className={styles.divIrEditorWrapper}>
            <div className={styles.divLineNumberWrapper}>
                {irLines.map((_, i) => (
                    <label
                        key={"label" + i}
                        className={classNames({
                            [styles.lblLineNumberNormal]:
                                !vm.vmPageStates[vm.activeVmIndex]
                                    .shouldIndicateCurrentLineNumber ||
                                i + 1 !==
                                    vm.vmPageStates[vm.activeVmIndex]
                                        .currentLineNumber,
                            [styles.lblLineNumberIndication]:
                                vm.vmPageStates[vm.activeVmIndex]
                                    .shouldIndicateCurrentLineNumber &&
                                i + 1 ===
                                    vm.vmPageStates[vm.activeVmIndex]
                                        .currentLineNumber
                        })}>
                        {vm.vmPageStates[vm.activeVmIndex].state ===
                            "STATIC_CHECK_FAILED" &&
                            i + 1 in
                                vm.vmPageStates[vm.activeVmIndex]
                                    .staticErrorTable && (
                                <LineHighlighter
                                    key={"sehighlighter" + i}
                                    type="ERROR"
                                    title={intl.formatMessage(
                                        {
                                            id: vm.vmPageStates[
                                                vm.activeVmIndex
                                            ].staticErrorTable[i + 1].key
                                        },
                                        vm.vmPageStates[vm.activeVmIndex]
                                            .staticErrorTable[i + 1].values
                                    )}
                                />
                            )}
                        {vm.vmPageStates[vm.activeVmIndex].state ===
                            "RUNTIME_ERROR" &&
                            i + 1 in
                                vm.vmPageStates[vm.activeVmIndex]
                                    .runtimeErrorTable && (
                                <LineHighlighter
                                    key={"rehighlighter" + i}
                                    type="ERROR"
                                    title={intl.formatMessage(
                                        {
                                            id: vm.vmPageStates[
                                                vm.activeVmIndex
                                            ].runtimeErrorTable[i + 1].key
                                        },
                                        vm.vmPageStates[vm.activeVmIndex]
                                            .runtimeErrorTable[i + 1].values
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
                    value={vm.vmPageStates[vm.activeVmIndex].irString}
                    onChange={e => {
                        const currentVm = vmContainer.at(vm.activeVmIndex);
                        currentVm.loadNewInstructions(
                            splitLines(e.currentTarget.value)
                        );
                        syncVmState(dispatch, vm);
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
