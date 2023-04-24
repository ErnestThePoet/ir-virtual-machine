import React from "react";
import styles from "./LineHighlighter.module.scss";
import classNames from "classnames";

interface LineHighlighterProps {
    type: "ERROR" | "INDICATION";
    title: string;
}

const LineHighlighter: React.FC<LineHighlighterProps> = (
    props: LineHighlighterProps
) => {
    return (
        <div className={styles.divLineHighlighterWrapper}>
            <div
                className={classNames({
                    [styles.divLineFrameError]: props.type === "ERROR",
                    [styles.divLineFrameIndication]: props.type === "INDICATION"
                })}
                title={props.title}></div>
        </div>
    );
};

export default LineHighlighter;
