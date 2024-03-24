import React, { LegacyRef } from "react";
import styles from "./InputBlock.module.scss";
import { FormattableMessage } from "@/locales";
import { useIntl } from "react-intl";

interface InputBlockProps {
    inputRef?: LegacyRef<HTMLInputElement> | undefined;
    prompt: FormattableMessage[];
    value: string;
    onChange: (_: string) => void;
    onEnter: () => void;
}

const InputBlock: React.FC<InputBlockProps> = (props: InputBlockProps) => {
    const intl = useIntl();

    return (
        <div className={styles.divInputBlockWrapper}>
            <span className={styles.spanArrow}>
                {intl.formatMessage({ id: "CONSOLE_ARROW" })}
            </span>
            <span className={styles.spanPrompt}>
                {props.prompt.reduce(
                    (p, c) =>
                        p +
                        intl.formatMessage(
                            {
                                id: c.key
                            },
                            c.values
                        ),
                    ""
                )}
            </span>
            <input
                ref={props.inputRef}
                className={styles.in}
                spellCheck={false}
                value={props.value}
                onChange={e => props.onChange(e.currentTarget.value)}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        props.onEnter();
                    }
                }}
            />
        </div>
    );
};

export default InputBlock;
