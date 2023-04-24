import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./TabBar.module.scss";
import TabBarItem from "./TabBarItem";
import { setActiveVmIndex, deleteVmPageState } from "@/store/reducers/vm";
import { Button, Modal } from "antd";
import { useIntl } from "react-intl";
import vmContainer from "@/modules/vmContainer/vmContainer";

const TabBar: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);
    const dispatch = useAppDispatch();

    const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] =
        useState(false);

    const [currentCloseVmName, setCurrentCloseVmName] = useState("");

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

                        setCurrentCloseVmName(x.name);
                        setIsCloseConfirmModalOpen(true);
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
                        name: currentCloseVmName
                    }
                )}
                onCancel={() => setIsCloseConfirmModalOpen(false)}
                footer={[
                    <Button onClick={() => setIsCloseConfirmModalOpen(false)}>
                        {intl.formatMessage({
                            id: "CANCEL"
                        })}
                    </Button>,
                    <Button danger onClick={() => {}}>
                        {intl.formatMessage({
                            id: "UNSAVE_CLOSE"
                        })}
                    </Button>,
                    <Button type="primary" onClick={() => {}}>
                        {intl.formatMessage({ id: "SAVE_CLOSE" })}
                    </Button>
                ]}></Modal>
        </nav>
    );
};

export default TabBar;
