import React, { useState } from "react";
import styles from "./InputBlock.module.scss";

interface InputBlockProps {
    prompt: string;
    onEnter: (_: string) => void;
}

const InputBlock: React.FC<InputBlockProps> = (props: InputBlockProps) => {
    const [inputString, setInputString] = useState("");

    return (
        <div className={styles.divInputBlockWrapper}>
            <span className={styles.spanArrow}>&gt;</span>
            <span className={styles.spanPrompt}>{props.prompt}</span>
            <input
                className={styles.in}
                value={inputString}
                onChange={e => setInputString(e.currentTarget.value)}
                onKeyDown={e => {
                    if (e.key === "Enter") {
                        setInputString(e.currentTarget.value);
                    }
                }}
            />
        </div>
    );
};

export default InputBlock;
