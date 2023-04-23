import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import styles from "./Home.module.scss";
import SideBar from "./components/SideBar";
import TabBar from "./components/TabBar";
import EmptyHolder from "./components/EmptyHolder/EmptyHolder";
import IrEditor from "./components/IrEditor/IrEditor";
import classNames from "classnames";

const Home: React.FC = () => {
    const vmStates = useAppSelector(state => state.vm.vmPageStates);

    const [isVerticalScreen, setIsVerticalScreen] = useState(
        window.innerWidth < window.innerHeight
    );

    useEffect(() => {
        window.onresize = () =>
            setIsVerticalScreen(window.innerWidth < window.innerHeight);
    }, []);

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
                    {vmStates.length === 0 ? (
                        <EmptyHolder />
                    ) : (
                        <>
                            <section className="sectionIr">
                                <IrEditor />
                            </section>

                            <section className="sectionConsole"></section>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
