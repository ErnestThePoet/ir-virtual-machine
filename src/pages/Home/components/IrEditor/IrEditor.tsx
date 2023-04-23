import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIntl } from "react-intl";
import styles from "./IrEditor.module.scss";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { splitLines } from "@/modules/utils";
import { setIrString, setIsIrChanged } from "@/store/reducers/vm";

const IrEditor: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);
    const dispatch = useAppDispatch();

    const irLines = splitLines(vm.vmPageStates[vm.activeVmIndex].irString);

    return (
        <div className={styles.divIrEditorWrapper}>
            <div className={styles.divLineNumberWrapper}>
                {irLines.map((_, i) => (
                    <label className={styles.lblLineNumber}>{i + 1}</label>
                ))}
            </div>

            <div className={styles.divIrWrapper}>
                <textarea
                    // line-height*lineCount
                    style={{
                        height: `${20 * irLines.length}px`
                    }}
                    className={styles.taIr}
                    value={vm.vmPageStates[vm.activeVmIndex].irString}
                    onChange={e => {
                        dispatch(
                            setIrString({
                                index: vm.activeVmIndex,
                                irString: e.currentTarget.value
                            })
                        );
                        dispatch(
                            setIsIrChanged({
                                index: vm.activeVmIndex,
                                isIrChanged: true
                            })
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default IrEditor;
