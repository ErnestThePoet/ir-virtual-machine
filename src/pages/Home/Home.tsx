import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./Home.module.scss";
import SideBar from "./components/SideBar";

const Home: React.FC = () => {
    return (
        <main className={styles.mainPc}>
            <SideBar />
        </main>
    );
};

export default Home;
