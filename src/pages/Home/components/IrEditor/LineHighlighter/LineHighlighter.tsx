import React from "react";
import styles from "./LineHighlighter.module.scss";
import classNames from "classnames";

interface LineHighlighterProps {
    type: "ERROR";
    title: string;
}

const LineHighlighter: React.FC<LineHighlighterProps> = (
    props: LineHighlighterProps
) => {
    return (
        <div className={styles.divLineHighlighterWrapper}>
            <div
                className={classNames({
                    [styles.divLineHighlighterError]: props.type === "ERROR"
                })}
                title={props.title}></div>
        </div>
    );
};

export default LineHighlighter;
