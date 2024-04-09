import React, { useState, useEffect } from "react";
import styles from "./TabBarItem.module.scss";
import classNames from "classnames";
import { CloseOutlined } from "@ant-design/icons";
import VmOutlined from "./Icons/VmOutlined";
import { truncateString } from "@/modules/utils";
import Dot from "./Icons/Dot";
import { useIntl } from "react-intl";

interface TabBarItemProps {
    title: string;
    isActive: boolean;
    isChanged: boolean;
    onClick: () => void;
    onCloseClick: () => void;
    // eslint-disable-next-line no-unused-vars
    onRename: (e: string) => void;
}

const TabBarItem: React.FC<TabBarItemProps> = (props: TabBarItemProps) => {
    const intl = useIntl();

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

            <div
                className={classNames({
                    [styles.divCloseWrapperChanged]: props.isChanged,
                    [styles.divCloseWrapper]: !props.isChanged
                })}
                title={intl.formatMessage({ id: "CLOSE" })}
                onClick={e => {
                    e.stopPropagation();
                    props.onCloseClick();
                }}>
                {props.isChanged && <Dot className={styles.iconDot} />}
                <CloseOutlined className={styles.iconClose} />
            </div>
        </div>
    );
};

export default TabBarItem;
