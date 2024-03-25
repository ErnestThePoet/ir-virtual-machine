import React from "react";
import { useIntl } from "react-intl";
import styles from "./EmptyHolder.module.scss";
import { isMobileBrowser } from "@/modules/utils";

const EmptyHolder: React.FC = () => {
    const intl = useIntl();

    return (
        <div className={styles.divEmptyHolder}>
            <img className={styles.imgLogo} src="logo.svg" />

            <div className={styles.divEmptyHolderText}>
                <span className={styles.spanDesc}>
                    {intl.formatMessage({
                        id: "EMPTY_PLACEHOLDER_DESC"
                    })}
                </span>

                <div className={styles.divEmptyHolderHintsWrapper}>
                    <span className="hint-title">
                        {intl.formatMessage({
                            id: "EMPTY_PLACEHOLDER_HINT_TITLE"
                        })}
                    </span>
                    <span>
                        {intl.formatMessage({
                            id: "EMPTY_PLACEHOLDER_HINT_1"
                        })}
                    </span>
                    <span>
                        {intl.formatMessage({
                            id: "EMPTY_PLACEHOLDER_HINT_2"
                        })}
                    </span>
                    {!isMobileBrowser() && (
                        <span>
                            {intl.formatMessage({
                                id: "EMPTY_PLACEHOLDER_HINT_3"
                            })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmptyHolder;
