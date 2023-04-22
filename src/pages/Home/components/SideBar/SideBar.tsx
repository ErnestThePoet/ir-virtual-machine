import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./SideBar.module.scss";
import {
    FileAddOutlined,
    FolderOpenOutlined,
    SaveOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import SideBarIcon from "./SideBarIcon";

const SideBar: React.FC = () => {
    return (
        <div className={styles.divSideBarWrapper}>
            <SideBarIcon
                icon={<FileAddOutlined />}
                label="新建"
                onClick={() => {}}
            />
            <SideBarIcon
                icon={<FolderOpenOutlined />}
                label="导入"
                onClick={() => {}}
            />
            <SideBarIcon
                icon={<SaveOutlined />}
                label="保存"
                onClick={() => {}}
            />

            <SideBarIcon
                icon={<InfoCircleOutlined />}
                label="关于"
                onClick={() => {}}
            />
        </div>
    );
};

export default SideBar;
