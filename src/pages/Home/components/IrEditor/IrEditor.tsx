import React, { useEffect } from "react";
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

    useEffect(() => {
        const currentVm = vmContainer.at(vm.activeVmIndex);
        currentVm.loadNewInstructions(irLines);
    }, [irLines]);

    return (
        <div className={styles.divIrEditorWrapper}>
            <div className={styles.divLineNumberWrapper}>
                {irLines.map((_, i) => (
                    <label key={i} className={styles.lblLineNumber}>
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
                        dispatch(
                            setIrString(e.currentTarget.value)
                        );
                        dispatch(
                            setIsIrChanged(true)
                        );
                    }}
                />
            </div>
        </div>
    );
};

export default IrEditor;
