import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./TabBar.module.scss";
import TabBarItem from "./TabBarItem";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { setActiveVmIndex, deleteVmPageState } from "@/store/reducers/vm";
import { Modal } from "antd";
import { useIntl } from "react-intl";
import vmContainer from "@/modules/vmContainer/vmContainer";

const { confirm } = Modal;

const TabBar: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);
    const dispatch = useAppDispatch();

    return (
        <nav className={styles.navTabBarWrapper}>
            {vm.vmPageStates.map((x, i) => (
                <TabBarItem
                    key={i}
                    title={x.name}
                    isActive={i === vm.activeVmIndex}
                    isChanged={x.isIrChanged}
                    onClick={() => dispatch(setActiveVmIndex(i))}
                    onCloseClick={() => {
                        const deleteCurrentVm = () => {
                            dispatch(deleteVmPageState(i));
                            vmContainer.delete(i);
                        };

                        if (!x.isIrChanged) {
                            deleteCurrentVm();
                            return;
                        }

                        confirm({
                            title: intl.formatMessage(
                                {
                                    id: "CONFIRM_UNSAVED_CLOSE"
                                },
                                {
                                    name: x.name
                                }
                            ),
                            icon: <ExclamationCircleFilled />,
                            okText: intl.formatMessage({ id: "SAVE_CLOSE" }),
                            okType: "primary",
                            cancelText: intl.formatMessage({
                                id: "UNSAVE_CLOSE"
                            }),
                            closable: true,
                            onOk: () => {
                                // TODO: Save
                                deleteCurrentVm();
                            },
                            onCancel: () => {
                                deleteCurrentVm();
                            }
                        });
                    }}
                />
            ))}
        </nav>
    );
};

export default TabBar;
