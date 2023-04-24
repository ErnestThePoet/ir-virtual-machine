import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import styles from "./VmInspector.module.scss";
import { useIntl } from "react-intl";
import classNames from "classnames";

const VmInspector: React.FC = () => {
    const intl = useIntl();
    const vm = useAppSelector(state => state.vm);
    return (
        <div className={styles.divVmInspectorWrapper}>
            <div className={styles.divStepStateWrapper}>
                <div className={styles.divStepState}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STEP_COUNT" })}
                    </label>
                    <div className={styles.divStepCount}>
                        {vm.vmPageStates[vm.activeVmIndex].stepCount}
                    </div>
                </div>

                <div className={styles.divStepState}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STATE" })}
                    </label>
                    <div
                        className={classNames({
                            [styles.divStateInitial]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "INITIAL",
                            [styles.divStateBusy]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "BUSY",
                            [styles.divStateWaitInput]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "WAIT_INPUT",
                            [styles.divStateFree]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "FREE",
                            [styles.divStateStaticCheckFailed]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "STATIC_CHECK_FAILED",
                            [styles.divStateRuntimeError]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "RUNTIME_ERROR",
                            [styles.divStateMaxStepReached]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "MAX_STEP_REACHED",
                            [styles.divStateExitedNormally]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "EXITED_NORMALLY",
                            [styles.divStateExitedAbnormally]:
                                vm.vmPageStates[vm.activeVmIndex].state ===
                                "EXITED_ABNORMALLY"
                        })}>
                        {intl.formatMessage({
                            id:
                                "STATE_" +
                                vm.vmPageStates[vm.activeVmIndex].state
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VmInspector;
