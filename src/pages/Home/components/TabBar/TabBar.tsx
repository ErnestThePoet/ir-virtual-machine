import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./TabBar.module.scss";
import TabBarItem from "./TabBarItem";
import {
    setActiveVmIndex,
    deleteVmPageState,
    setName
} from "@/store/reducers/vm";
import { Button, Modal } from "antd";
import { useIntl } from "react-intl";
import vmContainer from "@/modules/vmContainer/vmContainer";
import { saveIr } from "../SideBar/SideBar";

const TabBar: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);

    const dispatch = useAppDispatch();

    const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] =
        useState(false);

    const [currentCloseVmIndex, setCurrentCloseVmIndex] = useState(0);

    const deleteVm = (index: number) => {
        dispatch(deleteVmPageState(index));
        vmContainer.delete(index);
    };

    return (
        <nav className={styles.navTabBarWrapper}>
            {vm.vmPageStates.map((x, i) => (
                <TabBarItem
                    key={x.id}
                    title={x.name}
                    isActive={i === vm.activeVmIndex}
                    isChanged={x.isIrChanged}
                    onClick={() => dispatch(setActiveVmIndex(i))}
                    onCloseClick={() => {
                        if (!x.isIrChanged) {
                            deleteVm(i);
                            return;
                        }

                        setCurrentCloseVmIndex(i);
                        setIsCloseConfirmModalOpen(true);
                    }}
                    onRename={e => {
                        if (e === "") {
                            return;
                        }

                        dispatch(setName({ index: i, newName: e }));
                    }}
                />
            ))}

            <Modal
                open={isCloseConfirmModalOpen}
                title={intl.formatMessage(
                    {
                        id: "CONFIRM_UNSAVED_CLOSE"
                    },
                    {
                        name: vm.vmPageStates[currentCloseVmIndex]?.name
                    }
                )}
                onCancel={() => setIsCloseConfirmModalOpen(false)}
                footer={[
                    <Button onClick={() => setIsCloseConfirmModalOpen(false)}>
                        {intl.formatMessage({
                            id: "CANCEL"
                        })}
                    </Button>,
                    <Button
                        danger
                        onClick={() => {
                            deleteVm(currentCloseVmIndex);
                            setIsCloseConfirmModalOpen(false);
                        }}>
                        {intl.formatMessage({
                            id: "UNSAVE_CLOSE"
                        })}
                    </Button>,
                    <Button
                        type="primary"
                        onClick={() => {
                            saveIr(
                                vm.vmPageStates[vm.activeVmIndex].name,
                                vm.vmPageStates[vm.activeVmIndex].irString
                            );

                            deleteVm(currentCloseVmIndex);

                            setIsCloseConfirmModalOpen(false);
                        }}>
                        {intl.formatMessage({ id: "SAVE_CLOSE" })}
                    </Button>
                ]}
            />
        </nav>
    );
};

export default TabBar;
