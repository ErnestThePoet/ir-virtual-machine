import _ from "lodash";
import { useEffect, useRef } from "react";

const useMemoDeep = (value: unknown) => {
    const ref = useRef<unknown>();

    if (!_.isEqual(ref.current, value)) {
        ref.current = value;
    }

    return ref.current;
};

export const useEffectDeep: typeof useEffect = (effect, deps) => {
    useEffect(effect, deps?.map(useMemoDeep));
};
