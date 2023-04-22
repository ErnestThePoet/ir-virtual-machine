import React from "react";
import styles from "./SideBarIcon.module.scss";

interface SideBarIconProps {
    icon: React.ReactNode;
    label?: string;
    onClick: () => void;
}

const SideBarIcon: React.FC<SideBarIconProps> = (props: SideBarIconProps) => {
    return (
        <div
            className={styles.divIconWrapper}
            onClick={e => {
                e.stopPropagation();
                props.onClick();
            }}>
            {props.icon}
            {props.label !== undefined && <label>{props.label}</label>}
        </div>
    );
};

export default SideBarIcon;
