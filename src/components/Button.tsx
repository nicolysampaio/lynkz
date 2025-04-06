import * as React from "react";

interface ButtonProps {
    label: string,
    className?: string,
    children?: React.ReactNode,
    onClick?: () => void
}

function Button({
                    label,
                    className = "",
                    children,
                    ...props
                }: ButtonProps) {
    return (
        <button {...props} className={`py-2 px-4 rounded-md flex items-center gap-2 ${className}`}>
            {children}
            {label}
        </button>
    )
}

export default Button;