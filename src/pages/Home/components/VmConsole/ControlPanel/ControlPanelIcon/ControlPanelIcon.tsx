import React from "react";
import styles from "./ControlPanelIcon.module.scss";
import classNames from "classnames";

interface ControlPanelIconProps {
    className?: string;
    icon: React.ReactNode;
    label?: string;
    keyTooltip?: string;
    onClick: () => void;
}

const ControlPanelIcon: React.FC<ControlPanelIconProps> = (
    props: ControlPanelIconProps
) => {
    return (
        <div
            className={classNames(styles.divIconWrapper, props.className)}
            title={
                props.keyTooltip !== undefined
                    ? `${props.label} (${props.keyTooltip})`
                    : props.label
            }
            onClick={e => {
                e.stopPropagation();
                props.onClick();
            }}>
            {props.icon}
            {props.label !== undefined && <label>{props.label}</label>}
        </div>
    );
};

export default ControlPanelIcon;
