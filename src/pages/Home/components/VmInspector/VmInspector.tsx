import React, { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { InputNumber, Pagination, Tooltip } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import styles from "./VmInspector.module.scss";
import { useIntl } from "react-intl";
import classNames from "classnames";
import { VmExecutionState, vmOptionLimits } from "@/modules/vm/vm";
import {
    SingleVmPageState,
    setLocalVariableTablePageIndex,
    syncVmState
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import MemoryUsage from "./MemoryUsage";
import VariableTable from "./VariableTable";
import type { AppLocaleKey } from "@/locales";

interface VmInspectorProps {
    vmIndex: number;
    vm: SingleVmPageState;
}

function getVmStateLocaleKey(state: VmExecutionState): AppLocaleKey {
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

const LOCAL_VARIABLE_TABLE_PAGE_SIZE = 10;

const VmInspector: React.FC<VmInspectorProps> = (props: VmInspectorProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const [showBoxShadow, setShowBoxShadow] = useState(false);

    const divVmInspectorWrapper = useRef<HTMLDivElement>(null);

    const currentVm = vmContainer.at(props.vmIndex);

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
                            { stepCount: props.vm.stepCount }
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
                                props.vm.state === VmExecutionState.INITIAL,
                            [styles.divStateBusy]:
                                props.vm.state === VmExecutionState.BUSY,
                            [styles.divStateWaitInput]:
                                props.vm.state === VmExecutionState.WAIT_INPUT,
                            [styles.divStateFree]:
                                props.vm.state === VmExecutionState.FREE,
                            [styles.divStateStaticCheckFailed]:
                                props.vm.state ===
                                VmExecutionState.STATIC_CHECK_FAILED,
                            [styles.divStateRuntimeError]:
                                props.vm.state ===
                                VmExecutionState.RUNTIME_ERROR,
                            [styles.divStateMaxStepReached]:
                                props.vm.state ===
                                VmExecutionState.MAX_STEP_REACHED,
                            [styles.divStateExitedNormally]:
                                props.vm.state ===
                                VmExecutionState.EXITED_NORMALLY,
                            [styles.divStateExitedAbnormally]:
                                props.vm.state ===
                                VmExecutionState.EXITED_ABNORMALLY
                        })}>
                        {intl.formatMessage({
                            id: getVmStateLocaleKey(props.vm.state)
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
                        disabled={props.vm.state !== VmExecutionState.INITIAL}
                        min={vmOptionLimits.maxExecutionStepCount.min}
                        max={vmOptionLimits.maxExecutionStepCount.max}
                        value={props.vm.options.maxExecutionStepCount}
                        onChange={e => {
                            currentVm.configure({
                                maxExecutionStepCount: e ?? undefined
                            });
                            syncVmState(dispatch, props.vm.id);
                        }}
                    />
                </div>

                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "MEMORY_SIZE" })}
                    </label>
                    <InputNumber
                        className={styles.inOptionValue}
                        disabled={props.vm.state !== VmExecutionState.INITIAL}
                        min={vmOptionLimits.memorySize.min}
                        max={vmOptionLimits.memorySize.max}
                        value={props.vm.options.memorySize}
                        onChange={e => {
                            currentVm.configure({
                                memorySize: e ?? undefined
                            });
                            syncVmState(dispatch, props.vm.id);
                        }}
                    />
                </div>

                <div className={styles.divOptionWrapper}>
                    <label className={styles.lblOption}>
                        {intl.formatMessage({ id: "STACK_SIZE" })}
                    </label>
                    <InputNumber
                        className={styles.inOptionValue}
                        disabled={props.vm.state !== VmExecutionState.INITIAL}
                        min={vmOptionLimits.stackSize.min}
                        max={vmOptionLimits.stackSize.max}
                        value={props.vm.options.stackSize}
                        onChange={e => {
                            currentVm.configure({
                                stackSize: e ?? undefined
                            });
                            syncVmState(dispatch, props.vm.id);
                        }}
                    />
                </div>
            </div>

            <div className={styles.divMemoryUsageCard}>
                <MemoryUsage
                    title={intl.formatMessage({ id: "TOTAL_MEMORY_USAGE" })}
                    usedBytes={props.vm.memoryUsage.used}
                    totalBytes={props.vm.memoryUsage.total}
                    peakBytes={props.vm.peakMemoryUsage.total}
                />

                <MemoryUsage
                    title={intl.formatMessage({ id: "STACK_MEMORY_USAGE" })}
                    usedBytes={props.vm.memoryUsage.stackUsed}
                    totalBytes={props.vm.memoryUsage.stackTotal}
                    peakBytes={props.vm.peakMemoryUsage.stack}
                />

                <MemoryUsage
                    title={intl.formatMessage({
                        id: "GLOBAL_VARIABLE_MEMORY_USAGE"
                    })}
                    usedBytes={props.vm.memoryUsage.globalVariableUsed}
                    totalBytes={props.vm.memoryUsage.globalVariableTotal}
                    peakBytes={props.vm.peakMemoryUsage.globalVariable}
                />
            </div>

            <div className={styles.divGlobalVariableTableCard}>
                <label className="title">
                    {intl.formatMessage({ id: "GLOBAL_VARIABLE_TABLE" })}
                </label>
                <VariableTable variables={props.vm.globalVariableDetails} />
            </div>

            <div className={styles.divLocalVariableTableCard}>
                <label className="title">
                    {intl.formatMessage({ id: "LOCAL_VARIABLE_TABLE" })}
                </label>

                {props.vm.localVariableDetailsStack.length === 0 ? (
                    <div className="emptyHolder">
                        {intl.formatMessage({ id: "EMPTY_VATIABLE_TABLE" })}
                    </div>
                ) : (
                    <div className={styles.divLocalVariableTableWrapper}>
                        {props.vm.localVariableDetailsStack
                            .slice(
                                LOCAL_VARIABLE_TABLE_PAGE_SIZE *
                                    (props.vm.localVariableTablePageIndex - 1),
                                LOCAL_VARIABLE_TABLE_PAGE_SIZE *
                                    props.vm.localVariableTablePageIndex
                            )
                            .map((x, i) => (
                                <div
                                    key={i}
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

                                    <VariableTable
                                        key={i}
                                        variables={x.details}
                                    />
                                </div>
                            ))}
                        <Pagination
                            className={styles.paginationLocalVariableTable}
                            current={props.vm.localVariableTablePageIndex}
                            onChange={e =>
                                dispatch(setLocalVariableTablePageIndex(e))
                            }
                            pageSize={LOCAL_VARIABLE_TABLE_PAGE_SIZE}
                            showSizeChanger={false}
                            total={props.vm.localVariableDetailsStack.length}
                            size="small"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default VmInspector;
