import React from "react";
import { useIntl } from "react-intl";
import styles from "./EmptyHolder.module.scss";

const EmptyHolder: React.FC = () => {
    const intl = useIntl();

    return (
        <div className={styles.divEmptyHolder}>
            <span className={styles.spanEmptyHolderText}>
                {intl.formatMessage({
                    id: "EMPTY_PLACEHOLDER"
                })}
            </span>
        </div>
    );
};

export default EmptyHolder;
