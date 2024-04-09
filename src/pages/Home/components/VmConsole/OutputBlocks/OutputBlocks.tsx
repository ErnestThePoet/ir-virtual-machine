import React, { memo } from "react";
import styles from "./OutputBlocks.module.scss";
import { ConsoleMessagePart, ConsoleMessageType } from "@/modules/vm/vm";
import classNames from "classnames";
import { useIntl } from "react-intl";

interface OutputBlocksProps {
    messages: ConsoleMessagePart[][];
}

const OutputBlocks: React.FC<OutputBlocksProps> = memo(({ messages }) => {
    const intl = useIntl();

    return (
        <div className={styles.divOutputBlocksWrapper}>
            {messages.map((message, i) => (
                <div className={styles.divOutputBlockWrapper} key={i}>
                    {message.map((x, j) => {
                        const part = intl.formatMessage(
                            { id: x.key },
                            x.values
                        );
                        return (
                            <span
                                key={j}
                                className={classNames({
                                    [styles.spanError]:
                                        x.type === ConsoleMessageType.ERROR,
                                    [styles.spanWarning]:
                                        x.type === ConsoleMessageType.WARNING,
                                    [styles.spanSuccess]:
                                        x.type === ConsoleMessageType.SUCCESS,
                                    [styles.spanInput]:
                                        x.type === ConsoleMessageType.INPUT,
                                    [styles.spanOutput]:
                                        x.type === ConsoleMessageType.OUTPUT,
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
            ))}
        </div>
    );
});

export default OutputBlocks;
