"use client"
import React, { useState, useEffect, MouseEvent, ReactNode } from 'react';
import styles from './FetchErrorModal.module.css';
import { WifiHighIcon, WifiSlashIcon, ArrowsClockwiseIcon, ShieldIcon, HeartStraightIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react/dist/ssr';
import { IconProps } from '@phosphor-icons/react/dist/lib/types';
type ContextType = 'session' | 'appointment' | 'profile' | 'general';

interface FetchErrorModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onRetry?: () => Promise<unknown> | void;
    context?: ContextType;
    showCloseButton?: boolean;
    autoClose?: boolean;
    showOfflineDetection?: boolean;
    children?: ReactNode; // for extensibility if needed
}

interface ContextualMessage {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ComponentType<IconProps>;
    colorClass: string;
}

// Main Modal Component
const FetchErrorModal: React.FC<FetchErrorModalProps> = ({
    isOpen = true,
    onClose,
    onRetry,
    context = 'general',
    showCloseButton = true,
    autoClose = false,
    showOfflineDetection = true,
}) => {
    const [isRetrying, setIsRetrying] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimated(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (showOfflineDetection) {
            const handleOnline = () => {
                setIsOnline(true);
                if (autoClose) {
                    setTimeout(() => onClose?.(), 1000);
                }
            };
            const handleOffline = () => setIsOnline(false);

            setIsOnline(navigator.onLine);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, [showOfflineDetection, autoClose, onClose, navigator.onLine]);

    const getContextualMessage = (): ContextualMessage => {
        const messages: Record<ContextType, ContextualMessage> = {
            session: {
                title: "Session Connection Lost",
                subtitle: "We're having trouble connecting to your therapy session",
                description: "Your privacy and session continuity are important to us. This temporary connection issue won't affect your progress or data.",
                icon: HeartStraightIcon,
                colorClass: styles.success,
            },
            appointment: {
                title: "Appointment Data Unavailable",
                subtitle: "We couldn't load your appointment information",
                description: "Your scheduled sessions are safe. This is just a temporary connection issue that we're working to resolve.",
                icon: WarningCircleIcon,
                colorClass: styles.primary,
            },
            profile: {
                title: "Profile Sync Issue",
                subtitle: "We're having trouble accessing your profile",
                description: "Your personal information and progress remain secure. We're working to restore the connection.",
                icon: ShieldIcon,
                colorClass: styles.warning,
            },
            general: {
                title: "Connection Issue",
                subtitle: "We're having trouble connecting to our servers",
                description: "This is temporary and your data remains safe and secure. Our team is working to restore full functionality.",
                icon: WifiHighIcon,
                colorClass: styles.primary,
            }
        };
        return messages[context] || messages.general;
    };

    const handleRetry = async () => {
        if (isRetrying) return;
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        try {
            if (onRetry) {
                const result = await onRetry();
                if (result !== false) {
                    setTimeout(() => onClose?.(), 500);
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.reload();
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Retry failed:', error);
        } finally {
            setIsRetrying(false);
        }
    };

    const handleClose = () => {
        setIsAnimated(false);
        setTimeout(() => onClose?.(), 200);
    };

    const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && showCloseButton) {
            handleClose();
        }
    };

    const contextInfo = getContextualMessage();
    const IconComponent = contextInfo.icon;

    if (!isOpen) return null;

    return (
        <div
            className={`${styles.backdrop} ${isAnimated ? styles.backdropVisible : ''}`}
            onClick={handleBackdropClick}
        >
            <div
                className={`${styles.modal} ${isAnimated ? styles.modalVisible : ''}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                {showCloseButton && (
                    <button
                        onClick={handleClose}
                        className={styles.closeButton}
                        aria-label="Close"
                        type="button"
                    >
                        <XIcon className={styles.closeIcon} />
                    </button>
                )}

                {/* Connection Status Indicator */}
                <div className={styles.iconContainer}>
                    <div className={`${styles.iconPing} ${contextInfo.colorClass}`} />
                    <div className={`${styles.iconBackground} ${contextInfo.colorClass}`}>
                        {!isOnline ? (
                            <WifiSlashIcon className={styles.icon} />
                        ) : (
                            <IconComponent className={styles.icon} />
                        )}
                    </div>
                </div>

                {/* Offline/Online Status */}
                {showOfflineDetection && (
                    <div className={`${styles.statusBadge} ${isOnline ? styles.online : styles.offline}`}>
                        <div className={`${styles.statusDot} ${isOnline ? styles.onlineDot : styles.offlineDot}`} />
                        {isOnline ? 'Connected' : 'Offline'}
                    </div>
                )}

                {/* Main Content */}
                <h1 className={styles.title}>{contextInfo.title}</h1>
                <p className={styles.subtitle}>{contextInfo.subtitle}</p>
                <p className={styles.description}>{contextInfo.description}</p>

                {/* Retry Section */}
                <div className={styles.buttonSection}>
                    <button
                        onClick={handleRetry}
                        disabled={isRetrying || !isOnline}
                        className={`${styles.retryButton} ${contextInfo.colorClass} ${(isRetrying || !isOnline) ? styles.disabled : ''
                            }`}
                        type="button"
                    >
                        <ArrowsClockwiseIcon className={`${styles.buttonIcon} ${isRetrying ? styles.spinning : ''}`} />
                        {isRetrying ? 'Reconnecting...' : 'Try Again'}
                    </button>

                    {showCloseButton && (
                        <button
                            onClick={handleClose}
                            className={styles.continueButton}
                            type="button"
                        >
                            Continue Offline
                        </button>
                    )}

                    {retryCount > 0 && (
                        <p className={styles.retryInfo}>
                            Attempt {retryCount} • Last tried {new Date().toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* Reassurance Message */}
                <div className={styles.reassuranceBox}>
                    <div className={styles.reassuranceContent}>
                        <ShieldIcon className={styles.reassuranceIcon} />
                        <div className={styles.reassuranceText}>
                            <p className={styles.reassuranceTitle}>
                                Your Data is Safe
                            </p>
                            <p className={styles.reassuranceDescription}>
                                All your progress, notes, and personal information remain secure and will be available once the connection is restored.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Additional Help */}
                {!isOnline && (
                    <div className={styles.offlineHelp}>
                        <p className={styles.offlineText}>
                            <strong>Offline:</strong> Please check your internet connection and try again.
                        </p>
                    </div>
                )}

                {retryCount >= 3 && (
                    <div className={styles.supportHelp}>
                        <p className={styles.supportText}>
                            Still having trouble? Try refreshing the page or contact support if the issue persists.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Hook for easier usage
type UseFetchErrorModalReturn = {
    showError: (context?: ContextType, options?: Omit<FetchErrorModalProps, "context" | "isOpen">) => void;
    hideError: () => void;
    ErrorModal: ReactNode;
    hasError: boolean;
};

export const useFetchErrorModal = (): UseFetchErrorModalReturn => {
    const [error, setError] = useState<null | (Omit<FetchErrorModalProps, "isOpen"> & { isOpen?: boolean })>(null);

    const showError = (
        context: ContextType = 'general',
        options: Omit<FetchErrorModalProps, "context" | "isOpen"> = {}
    ) => {
        setError({ context, ...options, isOpen: true });
    };

    const hideError = () => {
        setError(null);
    };

    const ErrorModal = error ? (
        <FetchErrorModal
            isOpen={!!error}
            context={error.context}
            onClose={hideError}
            onRetry={error.onRetry}
            {...error}
        />
    ) : null;

    return {
        showError,
        hideError,
        ErrorModal,
        hasError: !!error,
    };
};

// Pre-configured variants for common use cases
type ModalVariantProps = Omit<FetchErrorModalProps, 'context'>;

export const SessionFetchModal: React.FC<ModalVariantProps> = (props) => (
    <FetchErrorModal context="session" {...props} />
);

export const AppointmentFetchModal: React.FC<ModalVariantProps> = (props) => (
    <FetchErrorModal context="appointment" {...props} />
);

export const ProfileFetchModal: React.FC<ModalVariantProps> = (props) => (
    <FetchErrorModal context="profile" {...props} />
);

export default FetchErrorModal;