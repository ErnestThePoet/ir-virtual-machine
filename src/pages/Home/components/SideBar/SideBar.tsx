import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./SideBar.module.scss";
import {
    FileAddOutlined,
    FolderOpenOutlined,
    SaveOutlined,
    InfoCircleOutlined,
    TranslationOutlined,
    EyeOutlined
} from "@ant-design/icons";
import SideBarIcon from "./SideBarIcon";
import vmContainer from "@/modules/vmContainer";
import type { SingleVmPageState } from "@/store/reducers/vm";
import { addVmPageState, setActiveVmIndex } from "@/store/reducers/vm";
import { Vm } from "@/modules/vm/vm";

function getNextUntitledVmName(names: string[]): string {
    for (let i = 1; ; i++) {
        const currentName = `Untitled-${i}`;
        if (names.every(x => x !== currentName)) {
            return currentName;
        }
    }
}

const SideBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);

    return (
        <div className={styles.divSideBarWrapper}>
            <div className={styles.divIconWrapperUpper}>
                <SideBarIcon
                    icon={<FileAddOutlined />}
                    label="新建"
                    onClick={() => {
                        const vmName = getNextUntitledVmName(
                            vm.vmPageStates.map(x => x.name)
                        );

                        vmContainer.add(new Vm());
                        dispatch(
                            addVmPageState({
                                name: vmName,
                                irPath: "",
                                isIrChanged: false
                            } as SingleVmPageState)
                        );
                    }}
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
            </div>

            <div className={styles.divIconWrapperLower}>
                <SideBarIcon
                    icon={<TranslationOutlined />}
                    label="Lang"
                    onClick={() => {}}
                />
                <SideBarIcon
                    icon={<EyeOutlined />}
                    label="主题"
                    onClick={() => {}}
                />
                <SideBarIcon
                    icon={<InfoCircleOutlined />}
                    label="关于"
                    onClick={() => {}}
                />
            </div>
        </div>
    );
};

export default SideBar;
