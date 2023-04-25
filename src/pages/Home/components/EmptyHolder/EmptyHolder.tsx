import React from "react";
import { useIntl } from "react-intl";
import styles from "./EmptyHolder.module.scss";
import { isMobilePhoneBrowser } from "@/modules/utils";

const EmptyHolder: React.FC = () => {
    const intl = useIntl();

    return (
        <div className={styles.divEmptyHolder}>
            <div className={styles.divEmptyHolderText}>
                <span>
                    {intl.formatMessage({
                        id: "EMPTY_PLACEHOLDER"
                    })}
                </span>

                {!isMobilePhoneBrowser() && (
                    <span>
                        {intl.formatMessage({
                            id: "EMPTY_PLACEHOLDER_SUPPORT_DRAG"
                        })}
                    </span>
                )}
            </div>
        </div>
    );
};

export default EmptyHolder;
