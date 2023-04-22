import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./TabBar.module.scss";
import TabBarItem from "./TabBarItem";
import { setActiveVmIndex } from "@/store/reducers/vm";

const TabBar: React.FC = () => {
    const vm = useAppSelector(state => state.vm);
    const dispatch = useAppDispatch();

    return (
        <div className={styles.divTabBarWrapper}>
            {vm.vmPageStates.map((x, i) => (
                <TabBarItem
                    key={i}
                    title={x.name}
                    isActive={i === vm.activeVmIndex}
                    isChanged={x.isIrChanged}
                    onClick={() => dispatch(setActiveVmIndex(i))}
                    onCloseClick={() => {}}
                />
            ))}
        </div>
    );
};

export default TabBar;
