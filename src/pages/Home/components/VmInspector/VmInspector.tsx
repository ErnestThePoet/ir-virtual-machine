import React, { useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { InputNumber, Pagination, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import styles from "./VmInspector.module.scss";
import { useIntl } from "react-intl";
import classNames from "classnames";
import { VmExecutionState, vmOptionLimits } from "@/modules/vm/vm";
import {
    setLocalVariableTablesPagination,
    syncVmState
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import MemoryUsage from "./MemoryUsage";
import VariableTable from "./VariableTable";
import type { AppLocaleKey } from "@/locales";

type VmExecutionStateNotClosed = Exclude<
    VmExecutionState,
    VmExecutionState.CLOSED
>;

interface VmInspectorProps {
    vmIndex: number;
}

function getVmStateLocaleKey(state: VmExecutionStateNotClosed): AppLocaleKey {
    switch (state) {
        case VmExecutionState.BUSY:
            return "STATE_BUSY";
        case VmExecutionState.EXITED_ABNORMALLY:
            return "STATE_EXITED_ABNORMALLY";
        case VmExecutionState.EXITED_NORMALLY:
            return "STATE_EXITED_NORMALLY";
        case VmExecutionState.FREE:
            return "STATE_FREE";
        case VmExecutionState.INITIAL:
            return "STATE_INITIAL";
        case VmExecutionState.MAX_STEP_REACHED:
            return "STATE_MAX_STEP_REACHED";
        case VmExecutionState.RUNTIME_ERROR:
            return "STATE_RUNTIME_ERROR";
        case VmExecutionState.STATIC_CHECK_FAILED:
            return "STATE_STATIC_CHECK_FAILED";
        case VmExecutionState.WAIT_INPUT:
            return "STATE_WAIT_INPUT";
    }
}

const VmInspector: React.FC<VmInspectorProps> = ({
    vmIndex
}: VmInspectorProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const vmState = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].state
    );
    const vmStateCount = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].stepCount
    );
    const vmOptions = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].options
    );
    const vmMemoryUsage = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].memoryUsage
    );
    const vmPeakMemoryUsage = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].peakMemoryUsage
    );
    const vmGlobalVariableDetails = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].globalVariableDetails
    );
    const vmLocalVariableDetailsStack = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].localVariableDetailsStack
    );
    const vmLocalVariableTablesPagination = useAppSelector(
        state => state.vm.vmPageStates[vmIndex].localVariableTablesPagination
    );

    const [showBoxShadow, setShowBoxShadow] = useState(false);

    const divVmInspectorWrapper = useRef<HTMLDivElement>(null);

    const currentVm = vmContainer.at(vmIndex);

    return (
        <div
            ref={divVmInspectorWrapper}
            className={classNames(
                styles.divVmInspectorWrapper,
                showBoxShadow && styles.divVmInspectorWrapperBoxShadow
            )}
            onScroll={e => {
                if (e.currentTarget.scrollTop > 0 && !showBoxShadow) {
                    setShowBoxShadow(true);
                } else if (e.currentTarget.scrollTop <= 0 && showBoxShadow) {
                    setShowBoxShadow(false);
                }
            }}>
            <div className={styles.divStepStateCard}>
                <div className={styles.divStepStateWrapper}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STEP_COUNT" })}
                    </label>
                    <div className={styles.divStepCount}>
                        {intl.formatMessage(
                            { id: "STEP_COUNT_NUMBER" },
                            { stepCount: vmStateCount }
                        )}
                    </div>
                </div>

                <div className={styles.divStepStateWrapper}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STATE" })}
                    </label>
                    <div
                        className={classNames({
                            [styles.divStateInitial]:
                                vmState === VmExecutionState.INITIAL,
                            [styles.divStateBusy]:
                                vmState === VmExecutionState.BUSY,
                            [styles.divStateWaitInput]:
                                vmState === VmExecutionState.WAIT_INPUT,
                            [styles.divStateFree]:
                                vmState === VmExecutionState.FREE,
                            [styles.divStateStaticCheckFailed]:
                                vmState ===
                                VmExecutionState.STATIC_CHECK_FAILED,
                            [styles.divStateRuntimeError]:
                                vmState === VmExecutionState.RUNTIME_ERROR,
                            [styles.divStateMaxStepReached]:
                                vmState === VmExecutionState.MAX_STEP_REACHED,
                            [styles.divStateExitedNormally]:
                                vmState === VmExecutionState.EXITED_NORMALLY,
                            [styles.divStateExitedAbnormally]:
                                vmState === VmExecutionState.EXITED_ABNORMALLY
                        })}>
                        {intl.formatMessage({
                            id: getVmStateLocaleKey(
                                vmState as VmExecutionStateNotClosed
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className={styles.divOptionsCard}>
                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "MAX_EXECUTION_STEP_COUNT" })}

                        <Tooltip
                            title={intl.formatMessage({
                                id: "SET_0_MEANS_NO_STEP_LIMIT"
                            })}>
                            <InfoCircleOutlined
                                className={styles.iconOptionInfo}
                            />
                        </Tooltip>
                    </label>
                    <InputNumber
                        className={styles.inOptionValue}
                        disabled={vmState !== VmExecutionState.INITIAL}
                        min={vmOptionLimits.maxExecutionStepCount.min}
                        max={vmOptionLimits.maxExecutionStepCount.max}
                        value={vmOptions.maxExecutionStepCount}
                        onChange={e => {
                            currentVm.configure({
                                maxExecutionStepCount: e ?? undefined
                            });
                            dispatch(syncVmState());
                        }}
                    />
                </div>

                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "MEMORY_SIZE" })}
                    </label>
                    <InputNumber
                        className={styles.inOptionValue}
                        disabled={vmState !== VmExecutionState.INITIAL}
                        min={vmOptionLimits.memorySize.min}
                        max={vmOptionLimits.memorySize.max}
                        value={vmOptions.memorySize}
                        onChange={e => {
                            currentVm.configure({
                                memorySize: e ?? undefined
                            });
                            dispatch(syncVmState());
                        }}
                    />
                </div>

                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "STACK_SIZE" })}
                    </label>
                    <InputNumber
                        className={styles.inOptionValue}
                        disabled={vmState !== VmExecutionState.INITIAL}
                        min={vmOptionLimits.stackSize.min}
                        max={vmOptionLimits.stackSize.max}
                        value={vmOptions.stackSize}
                        onChange={e => {
                            currentVm.configure({
                                stackSize: e ?? undefined
                            });
                            dispatch(syncVmState());
                        }}
                    />
                </div>
            </div>

            <div className={styles.divMemoryUsageCard}>
                <MemoryUsage
                    title={intl.formatMessage({ id: "TOTAL_MEMORY_USAGE" })}
                    usedBytes={vmMemoryUsage.used}
                    totalBytes={vmMemoryUsage.total}
                    peakBytes={vmPeakMemoryUsage.total}
                />

                <MemoryUsage
                    title={intl.formatMessage({ id: "STACK_MEMORY_USAGE" })}
                    usedBytes={vmMemoryUsage.stackUsed}
                    totalBytes={vmMemoryUsage.stackTotal}
                    peakBytes={vmPeakMemoryUsage.stack}
                />

                <MemoryUsage
                    title={intl.formatMessage({
                        id: "GLOBAL_VARIABLE_MEMORY_USAGE"
                    })}
                    usedBytes={vmMemoryUsage.globalVariableUsed}
                    totalBytes={vmMemoryUsage.globalVariableTotal}
                    peakBytes={vmPeakMemoryUsage.globalVariable}
                />
            </div>

            <div className={styles.divGlobalVariableTableCard}>
                <label className="title">
                    {intl.formatMessage({ id: "GLOBAL_VARIABLE_TABLE" })}
                </label>
                <VariableTable variables={vmGlobalVariableDetails} />
            </div>

            <div className={styles.divLocalVariableTableCard}>
                <label className="title">
                    {intl.formatMessage({ id: "LOCAL_VARIABLE_TABLE" })}
                </label>

                {vmLocalVariableDetailsStack.length === 0 ? (
                    <div className="emptyHolder">
                        {intl.formatMessage({ id: "EMPTY_VATIABLE_TABLE" })}
                    </div>
                ) : (
                    <div className={styles.divLocalVariableTableWrapper}>
                        {vmLocalVariableDetailsStack
                            .slice(
                                vmLocalVariableTablesPagination.size *
                                    (vmLocalVariableTablesPagination.currentIndex -
                                        1),
                                vmLocalVariableTablesPagination.size *
                                    vmLocalVariableTablesPagination.currentIndex
                            )
                            .map(x => (
                                <div
                                    key={`${x.functionName}${x.stackDepth}`}
                                    className={styles.divLocalVariableTable}>
                                    <div className="titleWrapper">
                                        <label className="functionName">
                                            {x.functionName}
                                        </label>
                                        <label className="callStackDepth">
                                            (
                                            {intl.formatMessage(
                                                { id: "CALL_STACK_DEPTH" },
                                                { depth: x.stackDepth }
                                            )}
                                            )
                                        </label>
                                    </div>

                                    <VariableTable variables={x.details} />
                                </div>
                            ))}
                        <Pagination
                            className={styles.paginationLocalVariableTable}
                            current={
                                vmLocalVariableTablesPagination.currentIndex
                            }
                            onChange={(currentIndex, size) =>
                                dispatch(
                                    setLocalVariableTablesPagination({
                                        currentIndex,
                                        size
                                    })
                                )
                            }
                            defaultPageSize={
                                vmLocalVariableTablesPagination.size
                            }
                            pageSizeOptions={[10, 20, 30, 50, 100]}
                            showSizeChanger
                            hideOnSinglePage
                            total={vmLocalVariableDetailsStack.length}
                            size="small"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VmInspector;
