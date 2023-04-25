import React from "react";
import styles from "./OutputBlock.module.scss";
import { ConsoleMessagePart } from "@/modules/vm/vm";
import classNames from "classnames";
import { useIntl } from "react-intl";

interface OutputBlockProps {
    message: ConsoleMessagePart[];
}

const OutputBlock: React.FC<OutputBlockProps> = (props: OutputBlockProps) => {
    const intl = useIntl();

    return (
        <div className={styles.divOutputBlockWrapper}>
            {props.message.map((x, i) => {
                const part = intl.formatMessage({ id: x.key }, x.values);
                return part.split("").map((y, j) => (
                    <span
                        key={`x${i}y${j}`}
                        className={classNames({
                            [styles.spanError]: x.type === "ERROR",
                            [styles.spanWarning]: x.type === "WARNING",
                            [styles.spanSuccess]: x.type === "SUCCESS",
                            [styles.spanNormal]: x.type === "NORMAL",
                            [styles.spanPrompt]: x.type === "PROMPT",
                            [styles.spanArrow]: x.type === "ARROW"
                        })}>
                        {y === " " ? <>&nbsp;</> : y}
                    </span>
                ));
            })}
        </div>
    );
};

export default OutputBlock;
