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
import { addVmPageState } from "@/store/reducers/vm";
import { Vm } from "@/modules/vm/vm";
import { getNextUntitledVmName } from "@/modules/utils";

const SideBar: React.FC = () => {
    const dispatch = useAppDispatch();
    const locale = useAppSelector(state => state.locale.currentLocale);
    const vm = useAppSelector(state => state.vm);

    return (
        <aside className={styles.asideSideBarWrapper}>
            <div className={styles.divIconWrapperUpper}>
                <SideBarIcon
                    icon={<FileAddOutlined />}
                    label={locale.ADD}
                    onClick={() => {
                        const vmName = getNextUntitledVmName(
                            vm.vmPageStates.map(x => x.name)
                        );

                        vmContainer.add(new Vm());
                        dispatch(
                            addVmPageState({
                                name: vmName,
                                irPath: "",
                                isIrChanged: false,
                                irString: "",
                                consoleOutputs: [],
                                consoleInputPrompt: [],
                                consoleInput: ""
                            })
                        );
                    }}
                />
                <SideBarIcon
                    icon={<FolderOpenOutlined />}
                    label={locale.IMPORT}
                    onClick={() => {}}
                />
                <SideBarIcon
                    icon={<SaveOutlined />}
                    label={locale.SAVE}
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
                    label={locale.THEME}
                    onClick={() => {}}
                />
                <SideBarIcon
                    icon={<InfoCircleOutlined />}
                    label={locale.ABOUT}
                    onClick={() => {}}
                />
            </div>
        </aside>
    );
};

export default SideBar;
