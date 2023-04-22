import React from "react";

const Dot: React.FC<React.SVGProps<SVGSVGElement>> = (
    props: React.SVGProps<SVGSVGElement>
) => {
    return (
        <svg
            {...props}
            version="1.1"
            id="layer_1"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            viewBox="0 0 50 50"
            enableBackground="new 0 0 50 50">
            <circle cx="25" cy="25" r="25" />
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
            <g></g>
        </svg>
    );
};

export default Dot;
