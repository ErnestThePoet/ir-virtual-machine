import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./SideBar.module.scss";
import { FileAddOutlined } from "@ant-design/icons";

const SideBar: React.FC = () => {
    const theme = useAppSelector(state => state.theme.currentTheme);

    return (
        <div className={styles.divSideBarWrapper}>
            <FileAddOutlined />
        </div>
    );
};

export default SideBar;
