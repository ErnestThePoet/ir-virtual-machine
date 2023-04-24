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
import { message } from "antd";
import SideBarIcon from "./SideBarIcon";
import vmContainer from "@/modules/vmContainer";
import { addVmPageState } from "@/store/reducers/vm";
import { Vm } from "@/modules/vm/vm";
import { getNextUntitledVmName } from "@/modules/utils";
import { useIntl } from "react-intl";

const SideBar: React.FC = () => {
    const intl = useIntl();
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

                        const newVm = new Vm();

                        vmContainer.add(newVm);
                        dispatch(
                            addVmPageState({
                                name: vmName,
                                irPath: "",
                                isIrChanged: false,
                                irString: "",

                                state: newVm.state,
                                globalVariableDetails:
                                    newVm.globalVariableDetails,
                                localVariableDetailsStack:
                                    newVm.localVariableDetailsStack,
                                options: newVm.currentOptions,
                                stepCount: newVm.stepCount,
                                memoryUsage: newVm.memoryUsage,

                                consoleOutputs: [],
                                consoleInputPrompt: [],
                                consoleInput: "",

                                staticErrorTable: newVm.staticErrorTable,
                                runtimeErrorTable: newVm.runtimeErrorTable,
                                currentLineNumber: newVm.currentLineNumber,
                                shouldIndicateCurrentLineNumber: false
                            })
                        );
                    }}
                />
                <SideBarIcon
                    icon={<FolderOpenOutlined />}
                    label={locale.IMPORT}
                    onClick={() => {
                        document.getElementById("inImportIr")?.click();
                    }}
                />
                <input
                    id="inImportIr"
                    style={{ display: "none" }}
                    type="file"
                    accept=".ir"
                    multiple
                    onChange={e => {
                        if (
                            e.currentTarget === null ||
                            e.currentTarget.files === null ||
                            e.currentTarget.files.length === 0
                        ) {
                            return;
                        }

                        for (const file of e.target.files!) {
                            const fileReader = new FileReader();

                            fileReader.readAsText(file);

                            fileReader.onload = res => {
                                if (res.target === null) {
                                    message.error(
                                        intl.formatMessage({
                                            id: "IR_IMPORT_FAILED"
                                        })
                                    );

                                    (
                                        document.getElementById(
                                            "inImportIr"
                                        ) as HTMLInputElement
                                    ).value = "";

                                    return;
                                }

                                const newVm = new Vm();

                                vmContainer.add(newVm);
                                dispatch(
                                    addVmPageState({
                                        name: file.name,
                                        irPath: "",
                                        isIrChanged: false,
                                        irString: res.target.result as string,

                                        state: newVm.state,
                                        globalVariableDetails:
                                            newVm.globalVariableDetails,
                                        localVariableDetailsStack:
                                            newVm.localVariableDetailsStack,
                                        options: newVm.currentOptions,
                                        stepCount: newVm.stepCount,
                                        memoryUsage: newVm.memoryUsage,

                                        consoleOutputs: [],
                                        consoleInputPrompt: [],
                                        consoleInput: "",

                                        staticErrorTable:
                                            newVm.staticErrorTable,
                                        runtimeErrorTable:
                                            newVm.runtimeErrorTable,
                                        currentLineNumber:
                                            newVm.currentLineNumber,
                                        shouldIndicateCurrentLineNumber: false
                                    })
                                );
                            };
                        }

                        // clear file value to ensure onchange will be triggered again
                        // if we load the same file next time.
                        (
                            document.getElementById(
                                "inImportIr"
                            ) as HTMLInputElement
                        ).value = "";
                    }}
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
