import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./Home.module.scss";
import SideBar from "./components/SideBar";
import TabBar from "./components/TabBar";

const Home: React.FC = () => {
    return (
        <main className={styles.mainPc}>
            <SideBar />
            <TabBar />
        </main>
    );
};

export default Home;
