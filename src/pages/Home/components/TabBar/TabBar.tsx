import React from "react";
import { useAppSelector } from "@/store/hooks";
import styles from "./TabBar.module.scss";
import TabBarItem from "./TabBarItem";

const TabBar: React.FC = () => {
    const vm = useAppSelector(state => state.vm);

    return (
        <div className={styles.divTabBarWrapper}>
            {new Array(10).fill("杨丛语杨丛语杨丛语").map((x, i) => (
                <TabBarItem
                    title={x.toString()}
                    isActive={i % 3 === 0}
                    isChanged={i % 4 === 0}
                    onClick={() => {}}
                    onCloseClick={() => {}}
                />
            ))}
        </div>
    );
};

export default TabBar;
