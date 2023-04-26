import React from "react";
import { useIntl } from "react-intl";
import { Progress } from "antd";
import styles from "./MemoryUsage.module.scss";
import { toKiB } from "@/modules/utils";

interface MemoryUsageProps {
    title: string;
    usedBytes: number;
    totalBytes: number;
    peakBytes: number;
}

const MemoryUsage: React.FC<MemoryUsageProps> = (props: MemoryUsageProps) => {
    const intl = useIntl();

    return (
        <div className={styles.divMemoryUsageWrapper}>
            <div>
                <label>{props.title}</label>

                <label className="percentageUsage">
                    {props.totalBytes === 0
                        ? "-.-"
                        : intl.formatMessage(
                              { id: "PERCENTAGE_USAGE" },
                              {
                                  percentage:
                                      (props.usedBytes / props.totalBytes) * 100
                              }
                          )}
                </label>
            </div>
            <span>
                {intl.formatMessage(
                    { id: "B_USAGE" },
                    {
                        used: props.usedBytes,
                        total: props.totalBytes
                    }
                )}
            </span>
            <span>
                {intl.formatMessage(
                    { id: "KB_USAGE" },
                    {
                        used: toKiB(props.usedBytes),
                        total: toKiB(props.totalBytes)
                    }
                )}
            </span>

            <Progress
                percent={(props.usedBytes / props.totalBytes) * 100}
                showInfo={false}
                style={{ margin: 0 }}
                status="normal"
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
                                      (props.peakBytes / props.totalBytes) * 100
                              }
                          )}
                </label>
            </div>

            <Progress
                percent={(props.peakBytes / props.totalBytes) * 100}
                showInfo={false}
                style={{ margin: 0 }}
                status="exception"
            />
        </div>
    );
};

export default MemoryUsage;
