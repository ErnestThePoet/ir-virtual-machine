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
import {
    SingleVmPageState,
    addVmPageState,
    setIsIrChanged
} from "@/store/reducers/vm";
import { Vm } from "@/modules/vm/vm";
import { getNextUntitledVmName, splitLines } from "@/modules/utils";
import { IntlShape, useIntl } from "react-intl";
import locales from "@/locales";
import { setLocale } from "@/store/reducers/locale";
import { setTheme } from "@/store/reducers/theme";
import themes from "@/themes";
import { AppDispatch } from "@/store";

interface SideBarProps {
    vmIndex: number;
    vm: SingleVmPageState | null;
}

export const saveIr = (name: string, irString: string) => {
    const stringUrl = URL.createObjectURL(
        new Blob([irString], { type: "text/plain" })
    );

    const anchor = document.createElement("a");
    anchor.href = stringUrl;
    anchor.download = name.endsWith(".ir") ? name : `${name}.ir`;

    anchor.click();

    URL.revokeObjectURL(stringUrl);
};

export const importIrFile = (
    dispatch: AppDispatch,
    intl: IntlShape,
    file: File
) => {
    if (!file.name.endsWith(".ir")) {
        message.error(`${file.name}不是一个ir文件`);
        return;
    }

    const fileReader = new FileReader();

    fileReader.readAsText(file);

    fileReader.onload = res => {
        if (res.target === null) {
            message.error(
                intl.formatMessage(
                    {
                        id: "IR_IMPORT_FAILED"
                    },
                    { fileName: file.name }
                )
            );

            (document.getElementById("inImportIr") as HTMLInputElement).value =
                "";

            return;
        }

        const newVm = new Vm();

        vmContainer.add(newVm);

        const irLines = splitLines(res.target.result as string);
        vmContainer.at(vmContainer.length - 1).loadNewInstructions(irLines);

        dispatch(
            addVmPageState({
                name: file.name,
                irPath: "",
                isIrChanged: false,
                irString: res.target.result as string,
                irSelection: {
                    start: 0,
                    end: 0
                },

                state: newVm.state,
                globalVariableDetails: newVm.globalVariableDetails,
                localVariableDetailsStack: newVm.localVariableDetailsStack,
                options: newVm.currentOptions,
                stepCount: newVm.stepCount,
                memoryUsage: newVm.memoryUsage,
                peakMemoryUsage: newVm.currentPeakMemoryUsage,

                consoleOutputs: [],
                consoleInputPrompt: [],
                consoleInput: "",

                staticErrorTable: newVm.staticErrorTable,
                runtimeErrorTable: newVm.runtimeErrorTable,
                currentLineNumber: newVm.currentLineNumber,
                shouldIndicateCurrentLineNumber: false,

                scrollHeights: {
                    irEditor: 0,
                    vmInspector: 0
                }
            })
        );
    };
};

const SideBar: React.FC<SideBarProps> = (props: SideBarProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const nextVmName = useAppSelector(state =>
        getNextUntitledVmName(state.vm.vmPageStates.map(x => x.name))
    );

    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

    return (
        <aside className={styles.asideSideBarWrapper}>
            <div className={styles.divIconWrapperUpper}>
                <SideBarIcon
                    icon={<FileAddOutlined />}
                    label={intl.formatMessage({ id: "ADD" })}
                    onClick={() => {
                        const newVm = new Vm();

                        vmContainer.add(newVm);
                        dispatch(
                            addVmPageState({
                                name: nextVmName,
                                irPath: "",
                                isIrChanged: false,
                                irString: "",
                                irSelection: {
                                    start: 0,
                                    end: 0
                                },

                                state: newVm.state,
                                globalVariableDetails:
                                    newVm.globalVariableDetails,
                                localVariableDetailsStack:
                                    newVm.localVariableDetailsStack,
                                options: newVm.currentOptions,
                                stepCount: newVm.stepCount,
                                memoryUsage: newVm.memoryUsage,
                                peakMemoryUsage: newVm.currentPeakMemoryUsage,

                                consoleOutputs: [],
                                consoleInputPrompt: [],
                                consoleInput: "",

                                staticErrorTable: newVm.staticErrorTable,
                                runtimeErrorTable: newVm.runtimeErrorTable,
                                currentLineNumber: newVm.currentLineNumber,
                                shouldIndicateCurrentLineNumber: false,

                                scrollHeights: {
                                    irEditor: 0,
                                    vmInspector: 0
                                }
                            })
                        );
                    }}
                />
                <SideBarIcon
                    icon={<FolderOpenOutlined />}
                    label={intl.formatMessage({ id: "IMPORT" })}
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
                            importIrFile(dispatch, intl, file);
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
                    label={intl.formatMessage({ id: "SAVE" })}
                    onClick={() => {
                        if (props.vm === null) {
                            return;
                        }

                        saveIr(props.vm.name, props.vm.irString);

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
                            label={intl.formatMessage({ id: "THEME" })}
                        />
                    </Space>
                </Dropdown>

                <SideBarIcon
                    icon={<InfoCircleOutlined />}
                    label={intl.formatMessage({ id: "ABOUT" })}
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
                onCancel={() => setIsAboutModalOpen(false)}
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

                    <p>
                        <div>🎉 感谢陈鄞、单丽莉老师的大力支持</div>
                        <div>㊙️ 虚拟机的说明请见仓库首页的文档</div>
                    </p>

                    <p className="info">
                        <a href="https://ernestthepoet.github.io/ir-virtual-machine/">
                            Github Pages镜像
                        </a>
                        ·
                        <a href="https://ecui.gitee.io/ir-virtual-machine/">
                            Gitee Pages镜像
                        </a>
                    </p>

                    <p className="info">
                        <a href="https://github.com/ErnestThePoet/ir-virtual-machine">
                            Github仓库
                        </a>
                        ·
                        <a href="https://gitee.com/ecui/ir-virtual-machine">
                            Gitee仓库
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
