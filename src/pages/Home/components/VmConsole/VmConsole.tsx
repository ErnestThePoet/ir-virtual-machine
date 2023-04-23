import React, { useEffect } from "react"
import styles from "./VmConsole.module.scss"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { useIntl } from "react-intl"

const VmConsole: React.FC = () => {
    const vm = useAppSelector(state => state.vm);

    return (<div className={styles.divVmConsoleWrapper}></div>)
}

export default VmConsole;