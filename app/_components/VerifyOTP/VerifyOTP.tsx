/* eslint-disable react/no-unescaped-entities */
"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import styles from "./VerifyOTP.module.css";
import { createClient } from "@/app/_utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRightIcon, ArrowsCounterClockwiseIcon, EnvelopeSimpleIcon, ShieldIcon } from "@phosphor-icons/react/dist/ssr";
import Button from "../Button/Button";

const VerifyOTP: React.FC = () => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [isButtonEnabled, setIsButtonEnabled] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter()
    const searchParams = useSearchParams()

    // Mock data for demo
    const email: string = searchParams.get("email") || "user@example.com";
    const type: string = searchParams.get("type") || "user";

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const paste = e.clipboardData.getData("text").slice(0, 6).split("");
        const updatedOtp = [...otp];

        paste.forEach((char, index) => {
            if (index < 6) updatedOtp[index] = char;
        });

        setOtp(updatedOtp);
        const lastIndex = paste.length >= 6 ? 5 : paste.length;
        inputRefs.current[lastIndex]?.focus();
        setIsButtonEnabled(updatedOtp.every((val) => val !== ""));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (!/^[0-9]?$/.test(value)) return;

        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.removeAttribute("disabled");
            inputRefs.current[index + 1]?.focus();
        }

        setIsButtonEnabled(updatedOtp.every((val) => val !== ""));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            const updatedOtp = [...otp];
            updatedOtp[index] = "";
            for (let i = index; i < 6; i++) {
                updatedOtp[i] = "";
                inputRefs.current[i]?.setAttribute("disabled", "true");
            }
            if (index > 0) inputRefs.current[index - 1]?.focus();
            setOtp(updatedOtp);
            setIsButtonEnabled(false);
        }
    };

    const verifyOtp = async () => {
        const supabase = createClient();
        startTransition(async () => {
            setError("")
            if (!email) {
                setError("Email not found.");
                return;
            }
            let finalOtp = otp.join("");

            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: finalOtp,
                type: "email",
            });
            if (error) {
                setError(error.message);
                return; // Stop here if error
            }
            // Only redirect if no error
            if (type === "therapist") {
                router.push("/provider");
            } else if (type === "patient") {
                router.push("/session");
            } else {
                // fallback or show error if type is unknown
                setError("Unknown user type. Please contact support.");
            }
        });
    };

    const resendOtp = async () => {
        const supabase = createClient()
        setError("")
        startTransition(async () => {

            if (!email) {
                setError("Email not found.");
                setTimeout(() => setError(""), 4000);
                return;
            }
            const { error } = await supabase.auth.signInWithOtp({
                email: email,
                options: {
                    shouldCreateUser: false,
                },
            });
            console.log(error);
            if (error) {
                setError("Error sending otp");
                setTimeout(() => {
                    setError("");
                }, 4000);
            }
        })
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                {/* Main Card */}
                <div className={styles.card}>
                    {/* Background decoration */}
                    <div className={styles.decorationTop}></div>
                    <div className={styles.decorationBottom}></div>

                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.iconWrapper}>
                            <ShieldIcon className={styles.icon} />
                        </div>

                        <h2 className={styles.title}>
                            Verify Your Email
                        </h2>

                        <div className={styles.subtitle}>
                            <p className={styles.subtitleText}>
                                We've sent a 6-digit code to
                            </p>
                            <div className={styles.emailWrapper}>
                                <EnvelopeSimpleIcon className={styles.emailIcon} />
                                <span className={styles.emailText}>
                                    {email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* OTP Input */}
                    <div className={styles.otpSection} onPaste={handlePaste}>
                        <div className={styles.otpInputs}>
                            {otp.map((value, i) => (
                                <input
                                    key={i}
                                    type="text"
                                    maxLength={1}
                                    value={value}
                                    onChange={(e) => handleChange(e, i)}
                                    onKeyDown={(e) => handleKeyDown(e, i)}
                                    ref={el => { inputRefs.current[i] = el }}
                                    disabled={i !== 0 && otp[i - 1] === ""}
                                    className={`${styles.otpInput} ${value ? styles.otpInputFilled : styles.otpInputEmpty
                                        } ${i !== 0 && otp[i - 1] === "" ? styles.otpInputDisabled : ""}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Verify Button */}
                    <Button
                        icon={<ArrowRightIcon className={styles.arrowIcon} />}
                        iconPosition="right"
                        onClick={verifyOtp}
                        disabled={!isButtonEnabled || isPending}
                        className={`${styles.verifyButton} ${isButtonEnabled && !isPending ? styles.verifyButtonEnabled : styles.verifyButtonDisabled
                            }`}
                    >
                        {isPending ? <span>Verifying...</span> : <span>Verify Code</span>
                        }
                    </Button>

                    {/* Resend Code */}
                    <div className={styles.resendSection}>
                        <p className={styles.resendText}>
                            Didn't receive the code?
                        </p>
                        <Button
                            variant="text"
                            icon={<ArrowsCounterClockwiseIcon className={`${styles.refreshIcon} ${isPending ? styles.refreshIconSpin : ""}`} />}
                            iconPosition="left"
                            onClick={resendOtp}
                            disabled={isPending}
                            className={styles.resendButton}
                        >

                            <span>{isPending ? 'Sending...' : 'Resend Code'}</span>
                        </Button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <p className={styles.errorText}>
                                {error}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    <p className={styles.footerText}>
                        This code will expire in 10 minutes for security purposes
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;