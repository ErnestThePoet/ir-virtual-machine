import React, { useState } from "react";
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
import { message, Dropdown, Space, Modal, Button } from "antd";
import SideBarIcon from "./SideBarIcon";
import vmContainer from "@/modules/vmContainer";
import { VmState, addVmPageState, setIsIrChanged } from "@/store/reducers/vm";
import { Vm } from "@/modules/vm/vm";
import { getNextUntitledVmName } from "@/modules/utils";
import { IntlShape, useIntl } from "react-intl";
import locales from "@/locales";
import { setLocale } from "@/store/reducers/locale";
import { setTheme } from "@/store/reducers/theme";
import themes from "@/themes";
import { AppDispatch } from "@/store";

export const saveIr = (name: string, irString: string) => {
    const stringUrl = URL.createObjectURL(
        new Blob([irString], { type: "text/plain" })
    );

    const anchor = document.createElement("a");
    anchor.href = stringUrl;
    anchor.download = `${name}.ir`;

    anchor.click();

    URL.revokeObjectURL(stringUrl);
};

export const importIrFile = (
    dispatch: AppDispatch,
    vm: VmState,
    intl: IntlShape,
    file: File
) => {
    const fileReader = new FileReader();

    fileReader.readAsText(file);

    fileReader.onload = res => {
        if (res.target === null) {
            message.error(
                intl.formatMessage({
                    id: "IR_IMPORT_FAILED"
                })
            );

            (document.getElementById("inImportIr") as HTMLInputElement).value =
                "";

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
                globalVariableDetails: newVm.globalVariableDetails,
                localVariableDetailsStack: newVm.localVariableDetailsStack,
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
    };
};

const SideBar: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const locale = useAppSelector(state => state.locale.currentLocale);
    const vm = useAppSelector(state => state.vm);

    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

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
                            importIrFile(dispatch, vm, intl, file);
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
                    onClick={() => {
                        if (vm.vmPageStates[vm.activeVmIndex] === undefined) {
                            return;
                        }

                        saveIr(
                            vm.vmPageStates[vm.activeVmIndex].name,
                            vm.vmPageStates[vm.activeVmIndex].irString
                        );

                        dispatch(setIsIrChanged(false));
                    }}
                />
            </div>

            <div className={styles.divIconWrapperLower}>
                <Dropdown
                    menu={{
                        items: locales.map((x, i) => ({
                            key: i,
                            label: x.name
                        })),
                        onClick: e => {
                            dispatch(
                                setLocale(locales[parseInt(e.key)].locale)
                            );
                            document.title =
                                locales[parseInt(e.key)].locale.APP_TITLE;
                        }
                    }}
                    placement="topLeft">
                    <Space>
                        <SideBarIcon
                            icon={<TranslationOutlined />}
                            label="Lang"
                        />
                    </Space>
                </Dropdown>

                <Dropdown
                    menu={{
                        items: themes.map((x, i) => ({
                            key: i,
                            label: x.name
                        })),
                        onClick: e => {
                            dispatch(
                                setTheme(themes[parseInt(e.key)].className)
                            );
                        }
                    }}
                    placement="topLeft">
                    <Space>
                        <SideBarIcon
                            icon={<EyeOutlined />}
                            label={locale.THEME}
                        />
                    </Space>
                </Dropdown>

                <SideBarIcon
                    icon={<InfoCircleOutlined />}
                    label={locale.ABOUT}
                    onClick={() => setIsAboutModalOpen(true)}
                />
            </div>

            <Modal
                open={isAboutModalOpen}
                title={intl.formatMessage({
                    id: "ABOUT"
                })}
                centered
                closable={false}
                footer={[
                    <Button onClick={() => setIsAboutModalOpen(false)}>
                        {intl.formatMessage({ id: "OK" })}
                    </Button>
                ]}>
                <article className={styles.articleAbout}>
                    <p className="title">IR虚拟机💎IR Virtual Machine</p>
                    <p>
                        <div>哈尔滨工业大学 120L021615 崔子健</div>
                        <div>Ernest Cui, Harbin Institute of Technology</div>
                    </p>
                    <p>April 🌼 2023</p>
                    <p className="info">
                        <a href="https://github.com/ErnestThePoet/IR-Virtual-Machine">
                            Github
                        </a>
                        ·
                        <a href="https://gitee.com/ecui/IR-Virtual-Machine">
                            Gitee
                        </a>
                        ·
                        <a href="mailto: ecuiships@126.com">
                            ecuiships@126.com
                        </a>
                    </p>
                </article>
            </Modal>
        </aside>
    );
};

export default SideBar;
