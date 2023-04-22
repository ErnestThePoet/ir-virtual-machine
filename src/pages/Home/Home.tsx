import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./Home.module.scss";
import SideBar from "./components/SideBar";
import TabBar from "./components/TabBar";

const Home: React.FC = () => {
    return (
        <main className={styles.main}>
            <SideBar />
            <div className={styles.divRight}>
                <TabBar />
                <div className={styles.divVmWrapper}>
                    <section className={styles.sectionIr}></section>

                    <section className={styles.sectionConsole}></section>
                </div>
            </div>
        </main>
    );
};

export default Home;
