import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./Home.module.scss";
import SideBar from "./components/SideBar";
import TabBar from "./components/TabBar";
import EmptyHolder from "./components/EmptyHolder/EmptyHolder";
import IrEditor from "./components/IrEditor";
import classNames from "classnames";
import VmConsole from "./components/VmConsole";
import VmInspector from "./components/VmInspector";
import { useIntl } from "react-intl";
import { importIrFile } from "./components/SideBar/SideBar";

const Home: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);
    const isAllIrSaved = useAppSelector(state =>
        state.vm.vmPageStates.every(x => !x.isIrChanged)
    );

    const [isVerticalScreen, setIsVerticalScreen] = useState(
        window.innerWidth < window.innerHeight
    );

    useEffect(() => {
        window.onresize = () =>
            setIsVerticalScreen(window.innerWidth < window.innerHeight);
    }, []);

    useEffect(() => {
        window.onbeforeunload = isAllIrSaved
            ? null
            : (e: BeforeUnloadEvent) => {
                  e.preventDefault();
                  return (e.returnValue = "");
              };
    }, [isAllIrSaved]);

    return (
        <main
            className={styles.main}
            onDragEnter={e => e.preventDefault()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
                for (const file of e.dataTransfer.files) {
                    importIrFile(dispatch, intl, file);
                }
                e.preventDefault();
            }}>
            <SideBar
                vm={
                    vm.vmPageStates.length === 0
                        ? null
                        : vm.vmPageStates[vm.activeVmIndex]
                }
                vmIndex={vm.activeVmIndex}
            />
            <div className={styles.divRight}>
                <TabBar />
                <div className={styles.divVmWrapper}>
                    {vm.vmPageStates.length === 0 ? (
                        <EmptyHolder />
                    ) : (
                        // V3.0 architecture: each VM has independent editor, console and inspector
                        vm.vmPageStates.map((x, i) => (
                            <div
                                key={`vm-${x.name}`}
                                className={classNames({
                                    [styles.divVmContentHorizontal]:
                                        !isVerticalScreen,
                                    [styles.divVmContentVertical]:
                                        isVerticalScreen
                                })}
                                style={{
                                    display:
                                        i === vm.activeVmIndex ? "flex" : "none"
                                }}>
                                <section className="sectionIrEditor">
                                    <IrEditor vm={x} vmIndex={i} />
                                </section>

                                <section className="sectionVmConsole">
                                    <VmConsole vm={x} vmIndex={i} />
                                </section>

                                <section className="sectionVmInspector">
                                    <VmInspector vm={x} vmIndex={i} />
                                </section>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
};

export default Home;
