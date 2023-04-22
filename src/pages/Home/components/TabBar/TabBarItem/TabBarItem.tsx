import React from "react";
import styles from "./TabBarItem.module.scss";
import classNames from "classnames";
import { CloseOutlined } from "@ant-design/icons";
import VmOutlined from "./Icons/VmOutlined";
import { truncateString } from "@/modules/utils";
import Dot from "./Icons/Dot";

interface TabBarItemProps {
    title: string;
    isActive: boolean;
    isChanged: boolean;
    onClick: () => void;
    onCloseClick: () => void;
}

const TabBarItem: React.FC<TabBarItemProps> = (props: TabBarItemProps) => {
    return (
        <div
            className={classNames(styles.divTabBarItemWrapper, {
                [styles.divTabBarItemWrapperActive]: props.isActive,
                [styles.divTabBarItemWrapperInactive]: !props.isActive
            })}
            onClick={e => {
                e.stopPropagation();
                props.onClick();
            }}>
            <div className={styles.divIconTitleWrapper}>
                <VmOutlined className={styles.iconVm} />
                <label className={styles.lblTitle}>
                    {truncateString(props.title)}
                </label>
            </div>

            {props.isChanged ? (
                <div
                    className={styles.divCloseWrapperChanged}
                    onClick={e => {
                        e.stopPropagation();
                        props.onCloseClick();
                    }}>
                    <Dot className={styles.iconDot} />
                    <CloseOutlined className={styles.iconClose} />
                </div>
            ) : (
                <div className={styles.divCloseWrapper}>
                    <CloseOutlined
                        className={styles.iconClose}
                        onClick={e => {
                            e.stopPropagation();
                            props.onCloseClick();
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default TabBarItem;
