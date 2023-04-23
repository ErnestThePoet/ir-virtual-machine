import React from "react"
import { useIntl } from "react-intl"
import styles from "./ControlPanel.module.scss"
import type { VmExecutionState, VmOptions } from "@/modules/vm/vm";

interface ControlPanelProps{
    onRunClick: () => void;
    onRunStepClick: () => void;
    onResetClick: () => void;
    onConfigureClick: (_: VmOptions) => void;
    vmState: VmExecutionState;
    vmOptions: VmOptions;
}

const ControlPanel: React.FC<ControlPanelProps> = (props: ControlPanelProps) => {
    const intl = useIntl();

    return (<div className={styles.divControlPanelWrapper}>
        
    </div>)
}

export default ControlPanel;
