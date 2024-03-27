import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./SideBar.module.scss";
import {
    FileAddOutlined,
    BulbOutlined,
    FolderOpenOutlined,
    SaveOutlined,
    InfoCircleOutlined,
    TranslationOutlined,
    EyeOutlined,
    StarOutlined
} from "@ant-design/icons";
import {
    message,
    Dropdown,
    Space,
    Modal,
    Button,
    Menu,
    List,
    Avatar
} from "antd";
import type { MenuProps } from "antd";
import SideBarIcon from "./SideBarIcon";
import vmContainer from "@/modules/vmContainer";
import {
    SingleVmPageState,
    addVmPageState,
    setIsIrChanged
} from "@/store/reducers/vm";
import { Vm, VmOptionsPartial } from "@/modules/vm/vm";
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

interface DemoListGroup {
    groupName: string;
    demos: {
        name: string;
        irUrl: string;
        remark: string;
        vmOptions?: VmOptionsPartial;
    }[];
}

const exampleListUrl = "demos.json";

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

const importIr = (
    dispatch: AppDispatch,
    vmName: string,
    irString: string,
    options?: VmOptionsPartial
) => {
    const newVm = new Vm();
    if (options !== undefined) {
        newVm.configure(options);
    }

    newVm.loadAndDecodeNewInstructions(splitLines(irString));

    vmContainer.add(newVm);

    dispatch(
        addVmPageState({
            name: vmName,
            irPath: "",
            isIrChanged: false,
            irString: irString,

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

            staticErrors: newVm.staticErrors,
            runtimeErrors: newVm.runtimeErrors,
            currentLineNumber: newVm.currentLineNumber,
            shouldIndicateCurrentLineNumber: false,

            localVariableTablePageIndex: 1
        })
    );
};

export const importIrFile = (
    dispatch: AppDispatch,
    intl: IntlShape,
    file: File
) => {
    if (!file.name.endsWith(".ir")) {
        message.error(
            intl.formatMessage(
                {
                    id: "NOT_AN_IR_FILE"
                },
                { fileName: file.name }
            )
        );
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

        importIr(dispatch, file.name, res.target.result as string);
    };
};

const SideBar: React.FC<SideBarProps> = (props: SideBarProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const nextVmName = useAppSelector(state =>
        getNextUntitledVmName(state.vm.vmPageStates.map(x => x.name))
    );

    const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
    const [isDemosModalOpen, setIsDemosModalOpen] = useState(false);
    const [demosData, setDemosData] = useState<MenuProps["items"]>([]);

    useEffect(() => {
        if (!isDemosModalOpen) {
            return;
        }

        fetch(exampleListUrl)
            .then(res => {
                if (!res.ok) {
                    return Promise.reject();
                }
                return res.text();
            })
            .catch(() => {
                message.error(
                    intl.formatMessage(
                        {
                            id: "FETCH_FAILED"
                        },
                        { url: exampleListUrl }
                    )
                );
            })
            .then(res => {
                if (!res) {
                    return;
                }

                const demoListGroups: DemoListGroup[] = JSON.parse(res);

                setDemosData(
                    demoListGroups.map((x, i) => ({
                        key: `g${i}`,
                        icon: <StarOutlined />,
                        label: `${x.groupName} (${x.demos.length})`,
                        children: [
                            {
                                key: `g${i}i`,
                                label: (
                                    <List
                                        itemLayout="horizontal"
                                        size="small"
                                        dataSource={x.demos}
                                        renderItem={item => (
                                            <List.Item
                                                onClick={() => {
                                                    fetch(item.irUrl)
                                                        .then(res => {
                                                            if (!res.ok) {
                                                                return Promise.reject();
                                                            }
                                                            return res.text();
                                                        })
                                                        .catch(() => {
                                                            message.error(
                                                                intl.formatMessage(
                                                                    {
                                                                        id: "FETCH_FAILED"
                                                                    },
                                                                    {
                                                                        url: item.irUrl
                                                                    }
                                                                )
                                                            );
                                                        })
                                                        .then(res => {
                                                            if (!res) {
                                                                return;
                                                            }

                                                            importIr(
                                                                dispatch,
                                                                item.irUrl
                                                                    .split("/")
                                                                    .at(
                                                                        -1
                                                                    ) as string,
                                                                res,
                                                                item.vmOptions
                                                            );
                                                            setIsDemosModalOpen(
                                                                false
                                                            );
                                                        });
                                                }}>
                                                <List.Item.Meta
                                                    avatar={
                                                        <Avatar
                                                            icon={
                                                                <BulbOutlined />
                                                            }
                                                        />
                                                    }
                                                    title={item.name}
                                                    description={item.remark}
                                                />
                                            </List.Item>
                                        )}
                                    />
                                )
                            }
                        ]
                    }))
                );
            });
    }, [isDemosModalOpen]);

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

                                staticErrors: newVm.staticErrors,
                                runtimeErrors: newVm.runtimeErrors,
                                currentLineNumber: newVm.currentLineNumber,
                                shouldIndicateCurrentLineNumber: false,

                                localVariableTablePageIndex: 1
                            })
                        );
                    }}
                />
                <SideBarIcon
                    icon={<BulbOutlined />}
                    label={intl.formatMessage({ id: "DEMOS" })}
                    onClick={() => setIsDemosModalOpen(true)}
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

                    <p>
                        <div>April 🌼 2023</div>
                        <div>V3.0 March 🌸 2024</div>
                    </p>

                    <p>
                        <div>🎉 感谢陈鄞、单丽莉老师的大力支持</div>
                        <div>㊙️ 虚拟机的说明请见仓库首页的文档</div>
                        <div>⚙️ 仓库中的CLI版本可用于自动化测试</div>
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

            <Modal
                open={isDemosModalOpen}
                title={
                    <span>
                        {intl.formatMessage({
                            id: "DEMOS"
                        })}

                        <a
                            className={styles.aDemoSources}
                            href="https://github.com/ErnestThePoet/ir-virtual-machine/tree/master/public/demos">
                            (
                            {intl.formatMessage({
                                id: "DEMO_SOURCES"
                            })}
                            )
                        </a>
                    </span>
                }
                centered
                closable
                onCancel={() => setIsDemosModalOpen(false)}
                footer>
                <Menu
                    className={styles.menuDemos}
                    mode="inline"
                    selectable={false}
                    items={demosData}
                />
            </Modal>
        </aside>
    );
};

export default SideBar;
