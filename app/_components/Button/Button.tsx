import React from 'react';
import styles from './Button.module.css';
import { ButtonProps } from './Button.types';

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    icon,
    iconPosition = 'left',
    className = '',
    ...props
}) => {
    const buttonClasses = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            className={buttonClasses}
            disabled={loading || props.disabled}
            {...props}
        >
            {icon && iconPosition === 'left' && <span className={styles.icon}>{icon}</span>}
            <span className={styles.children}>{children}</span>
            {icon && iconPosition === 'right' && <span className={styles.icon}>{icon}</span>}
        </button>
    );
};

export default Button;