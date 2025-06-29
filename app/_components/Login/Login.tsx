
"use client";
import React, { useState, useTransition } from 'react';
import styles from "./Login.module.css";
import Input from '../Input/Input';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import Link from 'next/link';
import { login } from '@/app/_lib/actions';
import { useRouter } from 'next/navigation';


export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginResponse {
    redirectUrl?: string;
    error?: string;
}

const Login: React.FC = () => {
    const [error, setError] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition();
    const route = useRouter();


    return (
        <>
            <Logo />
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to your therapy account</p>
                        {error && (
                            <p className={styles.error}>{error}</p>
                        )}
                    </div>

                    <form
                        action={async (formData: FormData) => {
                            startTransition(async () => {
                                setError("")
                                try {
                                    const result = await login(formData) as LoginResponse;
                                    if (result.error) {
                                        setError(result.error);
                                        return;
                                    }
                                    route.push(result.redirectUrl || "/");
                                } catch (err) {
                                    setError("An error occurred. Please try again later.")
                                }
                            });
                        }}
                        className={styles.form}>
                        <Input
                            id="email"
                            inputType="login"
                            label="Email Address"
                            type="email"
                            defaultValue='graynneji405@gmail.com'
                            placeholder="Enter your email" />

                        <div className={styles.passwordContainer}>
                            <Input
                                id="password"
                                inputType='login'
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                defaultValue="frankfurt"
                                placeholder="Enter your password" />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                        {/* <input type="hidden" name="domain" value={typeof window !== "undefined" ? window.location.origin : ""} /> */}
                        <div className={styles.buttonContainer}>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className={styles.fullWidthButton}
                            >
                                {isPending ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </div>

                        <div className={styles.links}>
                            <a href="#" className={styles.link}>Forgot Password?</a>
                            <a href="#" className={styles.link}>Need Help?</a>
                        </div>

                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>Don't have an account?</span>
                        </div>

                        <Link
                            href="/get-started"
                            className={styles.createAccount}
                        >
                            Create Account
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Login;