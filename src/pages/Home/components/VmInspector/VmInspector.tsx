import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { InputNumber } from "antd";
import styles from "./VmInspector.module.scss";
import { useIntl } from "react-intl";
import classNames from "classnames";
import { vmOptionLimits } from "@/modules/vm/vm";
import { syncVmState } from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import MemoryUsage from "./MemoryUsage";
import VariableTable from "./VariableTable";

const VmInspector: React.FC = () => {
    const intl = useIntl();
    const dispatch = useAppDispatch();
    const vm = useAppSelector(state => state.vm);

    return (
        <div className={styles.divVmInspectorWrapper}>
            <div className={styles.divStepStateCard}>
                <div className={styles.divStepStateWrapper}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STEP_COUNT" })}
                    </label>
                    <div className={styles.divStepCount}>
                        {vm.vmPageStates[vm.activeVmIndex].stepCount}
                    </div>
                </div>

                <div className={styles.divStepStateWrapper}>
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

            <div className={styles.divOptionsCard}>
                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "MAX_EXECUTION_STEP_COUNT" })}
                    </label>
                    <InputNumber
                        disabled={
                            vm.vmPageStates[vm.activeVmIndex].state !==
                            "INITIAL"
                        }
                        min={vmOptionLimits.maxExecutionStepCount.min}
                        max={vmOptionLimits.maxExecutionStepCount.max}
                        value={
                            vm.vmPageStates[vm.activeVmIndex].options
                                .maxExecutionStepCount
                        }
                        onChange={e => {
                            vmContainer.at(vm.activeVmIndex).configure({
                                maxExecutionStepCount: e ?? undefined
                            });
                            syncVmState(dispatch, vm);
                        }}
                    />
                </div>

                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "MEMORY_SIZE" })}
                    </label>
                    <InputNumber
                        disabled={
                            vm.vmPageStates[vm.activeVmIndex].state !==
                            "INITIAL"
                        }
                        min={vmOptionLimits.memorySize.min}
                        max={vmOptionLimits.memorySize.max}
                        value={
                            vm.vmPageStates[vm.activeVmIndex].options.memorySize
                        }
                        onChange={e => {
                            vmContainer.at(vm.activeVmIndex).configure({
                                memorySize: e ?? undefined
                            });
                            syncVmState(dispatch, vm);
                        }}
                    />
                </div>

                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "STACK_SIZE" })}
                    </label>
                    <InputNumber
                        disabled={
                            vm.vmPageStates[vm.activeVmIndex].state !==
                            "INITIAL"
                        }
                        min={vmOptionLimits.stackSize.min}
                        max={vmOptionLimits.stackSize.max}
                        value={
                            vm.vmPageStates[vm.activeVmIndex].options.stackSize
                        }
                        onChange={e => {
                            vmContainer.at(vm.activeVmIndex).configure({
                                stackSize: e ?? undefined
                            });
                            syncVmState(dispatch, vm);
                        }}
                    />
                </div>
            </div>

            <div className={styles.divMemoryUsageCard}>
                <MemoryUsage
                    title={intl.formatMessage({ id: "TOTAL_MEMORY_USAGE" })}
                    usedBytes={
                        vm.vmPageStates[vm.activeVmIndex].memoryUsage.used
                    }
                    totalBytes={
                        vm.vmPageStates[vm.activeVmIndex].memoryUsage.total
                    }
                />

                <MemoryUsage
                    title={intl.formatMessage({ id: "STACK_MEMORY_USAGE" })}
                    usedBytes={
                        vm.vmPageStates[vm.activeVmIndex].memoryUsage.stackUsed
                    }
                    totalBytes={
                        vm.vmPageStates[vm.activeVmIndex].memoryUsage.stackTotal
                    }
                />

                <MemoryUsage
                    title={intl.formatMessage({
                        id: "GLOBAL_VARIABLE_MEMORY_USAGE"
                    })}
                    usedBytes={
                        vm.vmPageStates[vm.activeVmIndex].memoryUsage
                            .globalVariableUsed
                    }
                    totalBytes={
                        vm.vmPageStates[vm.activeVmIndex].memoryUsage
                            .globalVariableTotal
                    }
                />
            </div>

            <div className={styles.divGlobalVariableTableCard}>
                <label className="title">
                    {intl.formatMessage({ id: "GLOBAL_VARIABLE_TABLE" })}
                </label>
                <VariableTable
                    variables={
                        vm.vmPageStates[vm.activeVmIndex].globalVariableDetails
                    }
                />
            </div>

            <div className={styles.divLocalVariableTableCard}>
                <label className="title">
                    {intl.formatMessage({ id: "LOCAL_VARIABLE_TABLE" })}
                </label>

                {vm.vmPageStates[vm.activeVmIndex].localVariableDetailsStack
                    .length === 0 ? (
                    <div className="emptyHolder">
                        {intl.formatMessage({ id: "EMPTY_VATIABLE_TABLE" })}
                    </div>
                ) : (
                    <div className={styles.divLocalVariableTableWrapper}>
                        {vm.vmPageStates[
                            vm.activeVmIndex
                        ].localVariableDetailsStack.map((x, i) => (
                            <div className={styles.divLocalVariableTable}>
                                <label className="functionName">
                                    {x.functionName}
                                </label>

                                <VariableTable key={i} variables={x.details} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VmInspector;
