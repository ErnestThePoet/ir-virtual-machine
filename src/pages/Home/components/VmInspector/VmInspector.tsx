import React, { useEffect, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { InputNumber } from "antd";
import styles from "./VmInspector.module.scss";
import { useIntl } from "react-intl";
import classNames from "classnames";
import { vmOptionLimits } from "@/modules/vm/vm";
import {
    SingleVmPageState,
    setScrollHeights,
    syncVmState
} from "@/store/reducers/vm";
import vmContainer from "@/modules/vmContainer/vmContainer";
import MemoryUsage from "./MemoryUsage";
import VariableTable from "./VariableTable";

interface VmInspectorProps {
    vmIndex: number;
    vm: SingleVmPageState;
}

const VmInspector: React.FC<VmInspectorProps> = (props: VmInspectorProps) => {
    const intl = useIntl();
    const dispatch = useAppDispatch();

    const divVmInspectorWrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        divVmInspectorWrapper.current?.scrollTo(
            0,
            props.vm.scrollHeights.vmInspector
        );
    }, [props.vmIndex, props.vm.id]);

    return (
        <div
            ref={divVmInspectorWrapper}
            className={styles.divVmInspectorWrapper}
            onScroll={e =>
                dispatch(
                    setScrollHeights({ vmInspector: e.currentTarget.scrollTop })
                )
            }>
            <div className={styles.divStepStateCard}>
                <div className={styles.divStepStateWrapper}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STEP_COUNT" })}
                    </label>
                    <div className={styles.divStepCount}>
                        {props.vm.stepCount}
                    </div>
                </div>

                <div className={styles.divStepStateWrapper}>
                    <label className={styles.lblStepStateLabel}>
                        {intl.formatMessage({ id: "STATE" })}
                    </label>
                    <div
                        className={classNames({
                            [styles.divStateInitial]:
                                props.vm.state === "INITIAL",
                            [styles.divStateBusy]: props.vm.state === "BUSY",
                            [styles.divStateWaitInput]:
                                props.vm.state === "WAIT_INPUT",
                            [styles.divStateFree]: props.vm.state === "FREE",
                            [styles.divStateStaticCheckFailed]:
                                props.vm.state === "STATIC_CHECK_FAILED",
                            [styles.divStateRuntimeError]:
                                props.vm.state === "RUNTIME_ERROR",
                            [styles.divStateMaxStepReached]:
                                props.vm.state === "MAX_STEP_REACHED",
                            [styles.divStateExitedNormally]:
                                props.vm.state === "EXITED_NORMALLY",
                            [styles.divStateExitedAbnormally]:
                                props.vm.state === "EXITED_ABNORMALLY"
                        })}>
                        {intl.formatMessage({
                            id: "STATE_" + props.vm.state
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
                        disabled={props.vm.state !== "INITIAL"}
                        min={vmOptionLimits.maxExecutionStepCount.min}
                        max={vmOptionLimits.maxExecutionStepCount.max}
                        value={props.vm.options.maxExecutionStepCount}
                        onChange={e => {
                            vmContainer.at(props.vmIndex).configure({
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
                        disabled={props.vm.state !== "INITIAL"}
                        min={vmOptionLimits.memorySize.min}
                        max={vmOptionLimits.memorySize.max}
                        value={props.vm.options.memorySize}
                        onChange={e => {
                            vmContainer.at(props.vmIndex).configure({
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
                        disabled={props.vm.state !== "INITIAL"}
                        min={vmOptionLimits.stackSize.min}
                        max={vmOptionLimits.stackSize.max}
                        value={props.vm.options.stackSize}
                        onChange={e => {
                            vmContainer.at(props.vmIndex).configure({
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
                        {props.vm.localVariableDetailsStack.map((x, i) => (
                            <div
                                key={i}
                                className={styles.divLocalVariableTable}>
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
