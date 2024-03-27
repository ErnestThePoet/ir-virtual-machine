import React from "react";
import { useIntl } from "react-intl";
import styles from "./ControlPanel.module.scss";
import {
    ForwardOutlined,
    CaretRightOutlined,
    ReloadOutlined,
    StopOutlined
} from "@ant-design/icons";
import ControlPanelIcon from "./ControlPanelIcon";
import { isMobileBrowser } from "@/modules/dom-utils";

interface ControlPanelProps {
    onRunClick: () => void;
    onRunStepClick: () => void;
    onResetClick: () => void;
    onClearClick: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = (
    props: ControlPanelProps
) => {
    const intl = useIntl();

    return (
        <div className={styles.divControlPanelWrapper}>
            <div className={styles.divSide}>
                <ControlPanelIcon
                    className={styles.iconRun}
                    icon={<ForwardOutlined />}
                    label={intl.formatMessage({ id: "RUN" })}
                    keyTooltip={isMobileBrowser() ? undefined : "F2"}
                    onClick={props.onRunClick}
                />
                <ControlPanelIcon
                    className={styles.iconStep}
                    icon={<CaretRightOutlined />}
                    label={intl.formatMessage({ id: "RUN_STEP" })}
                    keyTooltip={isMobileBrowser() ? undefined : "F8"}
                    onClick={props.onRunStepClick}
                />
                <ControlPanelIcon
                    className={styles.iconReset}
                    icon={<ReloadOutlined />}
                    label={intl.formatMessage({ id: "RESET" })}
                    keyTooltip={isMobileBrowser() ? undefined : "F9"}
                    onClick={props.onResetClick}
                />
                <ControlPanelIcon
                    className={styles.iconClear}
                    icon={<StopOutlined />}
                    label={intl.formatMessage({ id: "CLEAR_CONSOLE" })}
                    keyTooltip={isMobileBrowser() ? undefined : "F10"}
                    onClick={props.onClearClick}
                />
            </div>
            {/* <div className={styles.divSide}></div> */}
        </div>
    );
};

export default ControlPanel;
