import React, { useState, useTransition } from 'react'
import styles from "./CreateForm.module.css"
import Button from '../Button/Button'
import { ArrowLeftIcon, CaretRightIcon, CheckIcon, EnvelopeSimpleIcon, LockIcon, PhoneIcon, UserIcon } from '@phosphor-icons/react/dist/ssr'
import Input, { CreateInputProps } from '../Input/Input'
import { SelectedQuesAnswers, signup } from '@/app/_lib/actions'


interface createFormProps {
    goBack: () => void,
    answers: SelectedQuesAnswers
}

//constants 
type AllowedInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

// interface CreateInputProps {
//     id: string;
//     label: string;
//     type: AllowedInputType;
//     icon?: React.ReactNode;
//     placeholder: string;
// }

// type CreateInputPropsArray = CreateInputProps[];
type CreateInputPropsArray = CreateInputProps[];

const createFormInputProps: CreateInputPropsArray = [
    {
        id: "name",
        inputType: "create",
        label: "First Name",
        type: "text",
        placeholder: "Enter your first name",
        icon: <UserIcon className={styles.createIcon} />
    },
    {
        id: "email",
        inputType: "create",
        label: "Email Address",
        type: "email",
        placeholder: "Enter your email address",
        icon: <EnvelopeSimpleIcon className={styles.createIcon} />
    },
    {
        id: "phone",
        inputType: "create",
        label: "Phone Number",
        type: "tel",
        placeholder: "Enter your phone number",
        icon: <PhoneIcon className={styles.createIcon} />
    },
    {
        id: "password",
        inputType: "create",
        label: "Create Password",
        type: "password",
        placeholder: "Create a secure password",
        icon: <LockIcon className={styles.createIcon} />
    },
];

function CreateForm({ goBack, answers }: createFormProps) {
    const [isPending, startTransition] = useTransition()
    const createAccount = signup.bind(null, answers)
    const [error, setError] = useState("")
    return (
        /* Signup Form */
        <div className={styles.signupContent}>
            <Button variant='text' iconPosition='left' icon={<ArrowLeftIcon className={styles.backIcon} />} onClick={goBack} className={styles.backButton}>
                Back
            </Button>

            <div className={styles.signupHeader}>
                <div className={styles.signupIcon}>
                    <CheckIcon className={styles.signupCheckIcon} />
                </div>
                <h2 className={styles.signupTitle}>Perfect! Let's Create Your Account</h2>
                <p className={styles.signupSubtitle}>
                    You're all set! Now let's create your account to get started with your therapy journey.
                </p>
                {error && (
                    <p className={styles.error}>{error}</p>
                )}
            </div>

            <form action={async (formData: FormData) => {
                startTransition(async () => {
                    try {
                        setError("")
                        const error = await createAccount(formData)
                        if (error) setError(error)
                    } catch (error) {
                        setError("Internal server error")
                    }

                })
            }

            } className={styles.signupForm}>

                {
                    createFormInputProps.map((item: CreateInputProps) => (
                        <Input
                            key={item?.id}
                            id={item?.id}
                            inputType='create'
                            type={item?.type}
                            label={item?.label}
                            placeholder={item?.placeholder}
                            icon={item?.icon}
                        />
                    ))
                }
                <div className={styles.formFooter}>
                    <p className={styles.privacyText}>
                        By continuing you agree with Soullve{' '}
                        <a href="#" className={styles.privacyLink}>
                            Privacy Policy
                        </a>
                    </p>
                    <Button type="submit" size="large" disabled={isPending} iconPosition="right" icon={<CaretRightIcon className={styles.chevronIcon} />} className={styles.submitButton}>
                        {isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default CreateForm