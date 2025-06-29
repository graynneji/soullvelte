"use client";
import React, { useState, useTransition } from 'react';
import styles from "./TherapistSignup.module.css";
import Input from '../Input/Input';
import Logo from '../Logo/Logo';
import Button from '../Button/Button';
import Link from 'next/link';
import { signup } from '@/app/_lib/actions';

export interface TherapistSignupFormData {
    name: string;
    phone: string;
    email: string;
    ip: string;
    city: string;
    region: string;
    country: string;
    license: string;
    authority: string;
    gender: string;
    dob: string;
    specialization: string;
    password: string;
    confirmPassword: string;
}

export interface SignupResponse {
    success: boolean;
    redirectUrl?: string;
    error?: string;
}

const TherapistSignup: React.FC = () => {
    const role: string = "therapist";
    const register = signup.bind(null, role);
    const [error, setError] = useState<string>("")
    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const [isPending, startTransition] = useTransition();

    return (
        <>
            <Logo />
            <div className={styles.container}>
                <div className={styles.formContainer}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Join Our Network</h1>
                        <p className={styles.subtitle}>Create your therapist account</p>
                        {error && (
                            <p className={styles.error}>{error}</p>
                        )}
                    </div>

                    <form
                        action={async (formData: FormData) => {
                            startTransition(async () => {
                                try {
                                    setError("")
                                    const password = formData.get('password') as string;
                                    const confirmPassword = formData.get('confirmPassword') as string;

                                    if (password !== confirmPassword) {
                                        setError("Passwords do not match");
                                        return;
                                    }

                                    const error = await register(formData);
                                    if (error) setError(error)
                                } catch (err) {
                                    setError("Internal server error")
                                }
                            });
                        }}
                        className={styles.form}>

                        <Input
                            id="name"
                            inputType="create"
                            label="Full Name"
                            type="text"
                            placeholder="Enter your full name"
                            required />

                        <Input
                            id="email"
                            inputType="create"
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email"
                            required />

                        <Input
                            id="phone"
                            inputType="create"
                            label="Phone Number"
                            type="tel"
                            placeholder="Enter your phone number"
                            required />



                        <Input
                            id="license"
                            inputType="create"
                            label="License Number"
                            type="text"
                            placeholder="Enter your license number"
                            required />

                        <Input
                            id="authority"
                            inputType="create"
                            label="Licensing Authority"
                            type="text"
                            placeholder="Enter licensing authority"
                            required />

                        <div className={`${styles.selectContainer} ${styles.fullWidth}`}>
                            <label htmlFor="gender" className={styles.selectLabel}>
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                required
                                className={styles.select}>
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not-to-say">Prefer not to say</option>
                            </select>
                        </div>

                        <Input
                            id="dob"
                            inputType="create"
                            label="Date of Birth"
                            type="date"
                            required />

                        <Input
                            id="specialization"
                            inputType="create"
                            label="Specialization"
                            type="text"
                            placeholder="e.g., Cognitive Behavioral Therapy, Family Therapy"
                            required />

                        <div className={styles.passwordContainer}>
                            <Input
                                id="password"
                                inputType="create"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                required />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <div className={styles.passwordContainer}>
                            <Input
                                id="confirmPassword"
                                inputType="create"
                                label="Confirm Password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                required />
                            <button
                                type="button"
                                className={styles.passwordToggle}
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <div className={styles.buttonContainer}>
                            <Button
                                type="submit"
                                disabled={isPending}
                                className={styles.fullWidthButton}
                            >
                                {isPending ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </div>

                        <div className={styles.links}>
                            <a href="#" className={styles.link}>Terms of Service</a>
                            <a href="#" className={styles.link}>Privacy Policy</a>
                        </div>

                        <div className={styles.divider}>
                            <div className={styles.dividerLine}></div>
                            <span className={styles.dividerText}>Already have an account?</span>
                        </div>

                        <Link
                            href="/login"
                            className={styles.createAccount}
                        >
                            Sign In
                        </Link>
                    </form>
                </div>
            </div>
        </>
    );
}

export default TherapistSignup;