import React from "react";
import { useIntl } from "react-intl";
import { Progress } from "antd";
import styles from "./MemoryUsage.module.scss";
import {
    getArbitraryUnitMemoryUsage,
    getArbitraryUnitSize
} from "@/modules/utils";

interface MemoryUsageProps {
    title: string;
    usedBytes: number;
    totalBytes: number;
    peakBytes: number;
}

const MemoryUsage: React.FC<MemoryUsageProps> = (props: MemoryUsageProps) => {
    const intl = useIntl();

    const usage = getArbitraryUnitMemoryUsage(
        props.usedBytes,
        props.totalBytes
    );

    const peakUsageSize = getArbitraryUnitSize(props.peakBytes);

    return (
        <div className={styles.divMemoryUsageWrapper}>
            <div className={styles.divUsageBlock}>
                <Progress
                    className={styles.progress}
                    percent={(props.usedBytes / props.totalBytes) * 100}
                    showInfo={false}
                    status="normal"
                />

                <div>
                    <label>{props.title}</label>

                    <label className="percentageUsage">
                        {props.totalBytes === 0
                            ? "-.-"
                            : intl.formatMessage(
                                  { id: "PERCENTAGE_USAGE" },
                                  {
                                      percentage:
                                          (props.usedBytes / props.totalBytes) *
                                          100
                                  }
                              )}
                    </label>
                </div>
                <span>
                    {usage.unit === "B"
                        ? intl.formatMessage(
                              { id: "BYTE_USAGE" },
                              {
                                  used: usage.used,
                                  total: usage.total
                              }
                          )
                        : intl.formatMessage(
                              { id: "ARBITRARY_UNIT_MEMORY_USAGE" },
                              {
                                  ...usage
                              }
                          )}
                </span>
            </div>

            <div className={styles.divUsageBlock}>
                <Progress
                    className={styles.progress}
                    percent={(props.peakBytes / props.totalBytes) * 100}
                    showInfo={false}
                    status="exception"
                />

                <div>
                    <label>
                        {intl.formatMessage({
                            id: "PEAK_MEMORY_USAGE"
                        })}
                    </label>

                    <label className="percentageUsage">
                        {props.totalBytes === 0
                            ? "-.-"
                            : intl.formatMessage(
                                  { id: "PERCENTAGE_USAGE" },
                                  {
                                      percentage:
                                          (props.peakBytes / props.totalBytes) *
                                          100
                                  }
                              )}
                    </label>
                </div>

                <span>
                    {peakUsageSize.unit === "B"
                        ? intl.formatMessage(
                              { id: "BYTE_SIZE" },
                              {
                                  size: peakUsageSize.size
                              }
                          )
                        : intl.formatMessage(
                              { id: "ARBITRARY_UNIT_SIZE" },
                              {
                                  ...peakUsageSize
                              }
                          )}
                </span>
            </div>
        </div>
    );
};

export default MemoryUsage;
