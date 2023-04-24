import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIntl } from "react-intl";
import styles from "./IrEditor.module.scss";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { splitLines } from "@/modules/utils";
import { syncVmState, setIrString, setIsIrChanged } from "@/store/reducers/vm";
import LineHighlighter from "./LineHighlighter/LineHighlighter";
import classNames from "classnames";

const IrEditor: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);
    const dispatch = useAppDispatch();

    const irLines = splitLines(vm.vmPageStates[vm.activeVmIndex].irString);

    useEffect(() => {
        const currentVm = vmContainer.at(vm.activeVmIndex);
        currentVm.loadNewInstructions(irLines);
        syncVmState(dispatch, vm);
    }, [vm.vmPageStates[vm.activeVmIndex].irString]);

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
                        {i + 1 in
                            vm.vmPageStates[vm.activeVmIndex]
                                .staticErrorTable && (
                            <LineHighlighter
                                key={"highlighter" + i}
                                type="ERROR"
                                title={intl.formatMessage({
                                    id: vm.vmPageStates[vm.activeVmIndex]
                                        .staticErrorTable[i + 1]
                                })}
                            />
                        )}
                        {i + 1}
                    </label>
                ))}
            </div>

            <div className={styles.divIrWrapper}>
                <textarea
                    // line-height*lineCount
                    style={{
                        height: `${20 * irLines.length}px`
                    }}
                    spellCheck={false}
                    className={styles.taIr}
                    value={vm.vmPageStates[vm.activeVmIndex].irString}
                    onChange={e => {
                        dispatch(setIrString(e.currentTarget.value));
                        dispatch(setIsIrChanged(true));
                    }}
                />
            </div>
        </div>
    );
};

export default IrEditor;
