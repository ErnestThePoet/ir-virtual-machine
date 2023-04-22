import React from "react";
import { useAppSelector } from "@/store/hooks";
import styles from "./TabBar.module.scss"

const TabBar: React.FC = () => {
    const vm = useAppSelector(state => state.vm);

    return <div className={styles.divTabBarWrapper}>
        {
            new Array(100).fill(132)
        }
    </div>;
}

export default TabBar;
