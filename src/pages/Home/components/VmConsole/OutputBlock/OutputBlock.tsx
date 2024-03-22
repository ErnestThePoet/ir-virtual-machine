import React from "react";
import styles from "./OutputBlock.module.scss";
import { ConsoleMessagePart, ConsoleMessageType } from "@/modules/vm/vm";
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
                return (
                    <span
                        key={i}
                        className={classNames({
                            [styles.spanError]:
                                x.type === ConsoleMessageType.ERROR,
                            [styles.spanWarning]:
                                x.type === ConsoleMessageType.WARNING,
                            [styles.spanSuccess]:
                                x.type === ConsoleMessageType.SUCCESS,
                            [styles.spanNormal]:
                                x.type === ConsoleMessageType.NORMAL,
                            [styles.spanPrompt]:
                                x.type === ConsoleMessageType.PROMPT,
                            [styles.spanArrow]:
                                x.type === ConsoleMessageType.ARROW
                        })}>
                        {part}
                    </span>
                );
            })}
        </div>
    );
};

export default OutputBlock;
