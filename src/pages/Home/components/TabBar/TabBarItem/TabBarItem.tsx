import React, { useState, useEffect } from "react";
import styles from "./TabBarItem.module.scss";
import classNames from "classnames";
import { CloseOutlined } from "@ant-design/icons";
import VmOutlined from "./Icons/VmOutlined";
import { truncateString } from "@/modules/utils";
import Dot from "./Icons/Dot";
import { useAppSelector } from "@/store/hooks";

interface TabBarItemProps {
    title: string;
    isActive: boolean;
    isChanged: boolean;
    onClick: () => void;
    onCloseClick: () => void;
    onRename: (e: string) => void;
}

const TabBarItem: React.FC<TabBarItemProps> = (props: TabBarItemProps) => {
    const locale = useAppSelector(state => state.locale.currentLocale);

    const [isRename, setIsRename] = useState(false);
    const [newName, setNewName] = useState(props.title);

    useEffect(() => {
        if (isRename) {
            const inVmRename = document.getElementById("inVmRename");
            if (inVmRename !== null) {
                inVmRename.focus();
                (inVmRename as HTMLInputElement).select();
            }
        }
    }, [isRename]);

    return (
        <div
            className={classNames({
                [styles.divTabBarItemWrapperActive]: props.isActive,
                [styles.divTabBarItemWrapperInactive]: !props.isActive
            })}
            onClick={e => {
                e.stopPropagation();
                props.onClick();
            }}
            title={props.title}
            onDoubleClick={() => {
                setNewName(props.title);
                setIsRename(true);
            }}>
            <div className={styles.divIconTitleWrapper}>
                <VmOutlined className={styles.iconVm} />
                {isRename ? (
                    <input
                        id="inVmRename"
                        className={styles.inVmRename}
                        value={newName}
                        onChange={e => setNewName(e.currentTarget.value)}
                        onKeyDown={e => {
                            if (e.key === "Enter") {
                                props.onRename(newName);
                                setIsRename(false);
                            }
                        }}
                        onBlur={() => {
                            props.onRename(newName);
                            setIsRename(false);
                        }}
                    />
                ) : (
                    <label className={styles.lblTitle}>
                        {truncateString(props.title)}
                    </label>
                )}
            </div>

            {props.isChanged ? (
                <div
                    className={styles.divCloseWrapperChanged}
                    onClick={e => {
                        e.stopPropagation();
                        props.onCloseClick();
                    }}
                    title={locale.CLOSE}>
                    <Dot className={styles.iconDot} />
                    <CloseOutlined className={styles.iconClose} />
                </div>
            ) : (
                <div className={styles.divCloseWrapper} title={locale.CLOSE}>
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
