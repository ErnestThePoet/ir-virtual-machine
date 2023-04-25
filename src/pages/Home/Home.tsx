import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import styles from "./Home.module.scss";
import SideBar from "./components/SideBar";
import TabBar from "./components/TabBar";
import EmptyHolder from "./components/EmptyHolder/EmptyHolder";
import IrEditor from "./components/IrEditor";
import classNames from "classnames";
import VmConsole from "./components/VmConsole";
import VmInspector from "./components/VmInspector";

const Home: React.FC = () => {
    const vm = useAppSelector(state => state.vm);

    const [isVerticalScreen, setIsVerticalScreen] = useState(
        window.innerWidth < window.innerHeight
    );

    useEffect(() => {
        window.onresize = () =>
            setIsVerticalScreen(window.innerWidth < window.innerHeight);
    }, []);

    useEffect(() => {
        document.getElementById("taIr")?.focus();
    }, [vm.activeVmIndex]);

    return (
        <main className={styles.main}>
            <SideBar />
            <div className={styles.divRight}>
                <TabBar />
                <div
                    className={classNames({
                        [styles.divVmWrapperHorizontal]: !isVerticalScreen,
                        [styles.divVmWrapperVertical]: isVerticalScreen
                    })}>
                    {vm.vmPageStates.length === 0 ? (
                        <EmptyHolder />
                    ) : (
                        <>
                            <section className="sectionIrEditor">
                                <IrEditor />
                            </section>

                            <section className="sectionVmConsole">
                                <VmConsole />
                            </section>

                            <section className="sectionVmInspector">
                                <VmInspector />
                            </section>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
