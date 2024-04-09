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
import { importIrFile } from "@/modules/operations/import-export";

const Home: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const vmCount = useAppSelector(state => state.vm.vmPageStates.length);

    const activeVmIndex = useAppSelector(state => state.vm.activeVmIndex);

    const vmIds = useAppSelector(
        state => state.vm.vmPageStates.map(x => x.id),
        (a, b) => a.length === b.length && a.every((x, i) => x === b[i])
    );

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
                  return (e.returnValue =
                      "Your unsaved changes will be lost. Sure to leave?");
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
            <SideBar vmIndex={activeVmIndex} />
            <div className={styles.divRight}>
                <TabBar />
                <div className={styles.divVmWrapper}>
                    {vmCount === 0 ? (
                        <EmptyHolder />
                    ) : (
                        // V3.0 architecture: each VM has independent editor, console and inspector
                        new Array(vmCount).fill(null).map((_, i) => (
                            <div
                                key={vmIds[i]}
                                className={classNames({
                                    [styles.divVmContentHorizontal]:
                                        !isVerticalScreen,
                                    [styles.divVmContentVertical]:
                                        isVerticalScreen
                                })}
                                style={{
                                    display:
                                        i === activeVmIndex ? "flex" : "none"
                                }}>
                                <section className="sectionIrEditor">
                                    <IrEditor vmIndex={i} />
                                </section>

                                <section className="sectionVmConsole">
                                    <VmConsole vmIndex={i} />
                                </section>

                                <section className="sectionVmInspector">
                                    <VmInspector vmIndex={i} />
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
