"use client"

import React, { useState } from 'react';
import { questions } from '@/app/_constants';
import {
  ArrowLeftIcon, CheckIcon, CaretRightIcon,
  InfoIcon,
  UserIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  LockIcon,
} from '@phosphor-icons/react/dist/ssr';
import styles from './GetStarted.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';

interface Question {
  id: number;
  section: number;
  question: string;
  type: 'multiple' | 'select';
  options: string[];
  info: string;
}


interface FormData {
  firstName: string;
  email: string;
  phone: string;
  password: string;
}

interface Answers {
  [key: string]: string | string[];
}

//constants 
type AllowedInputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

interface CreateInputProps {
  id: string;
  label: string;
  type: AllowedInputType;
  icon?: React.ReactNode;
  placeholder: string;
}

type CreateInputPropsArray = CreateInputProps[];

const createFormInputProps: CreateInputPropsArray = [
  {
    id: "name",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
    icon: <UserIcon className={styles.createIcon} />
  },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter your email address",
    icon: <EnvelopeSimpleIcon className={styles.createIcon} />
  },
  {
    id: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter your phone number",
    icon: <PhoneIcon className={styles.createIcon} />
  },
  {
    id: "password",
    label: "Create Password",
    type: "password",
    placeholder: "Create a secure password",
    icon: <LockIcon className={styles.createIcon} />
  },
];

const GetStarted: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false)



  const totalSteps: number = questions.length + 1; // +1 for signup form

  const handleAnswer = (questionId: string, answer: string): void => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(questions.length); // Move to signup
      }
    }, 300);
  };

  const handleMultipleChoice = (questionId: string, option: string): void => {
    const currentAnswers = (answers[questionId] as string[]) || [];
    const newAnswers = currentAnswers.includes(option)
      ? currentAnswers.filter(a => a !== option)
      : [...currentAnswers, option];

    setAnswers(prev => ({
      ...prev,
      [questionId]: newAnswers
    }));
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setIsCompleted(true);
  };

  const goBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFormInputChange = (field: keyof FormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const progressPercentage: number = ((currentStep + 1) / totalSteps) * 100;

  if (isCompleted) {
    return (
      <div className={styles.completedContainer}>
        <div className={styles.completedCard}>
          <div className={styles.completedIcon}>
            <CheckIcon className={styles.completedCheckIcon} />
          </div>
          <h2 className={styles.completedTitle}>Welcome to BetterSpace!</h2>
          <p className={styles.completedText}>
            Your account has been created successfully. We're now matching you with the perfect therapist based on your preferences.
          </p>
          <button className={styles.completedButton}>
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={`${styles.decorationCircle} ${styles.decorationCircleTop}`}></div>
        <div className={`${styles.decorationCircle} ${styles.decorationCircleBottom}`}></div>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <div className={styles.progressInfo}>
          <span className={styles.progressLabel}>Progress</span>
          <span className={styles.progressPercentage}>{Math.round(progressPercentage)}%</span>
        </div>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${progressPercentage}%` }}
          >
            <div className={styles.progressAnimation}></div>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Find Your Perfect Therapist</h1>
          <p className={styles.subtitle}>
            A strong therapeutic relationship begins with the right match. Let us guide you through a few questions to find your ideal therapist.
          </p>
        </div>


        {/* Question Card */}
        <div className={styles.questionCard}>
          {currentStep < questions.length ? (
            <div className={styles.questionContent}>
              {/* Back Button */}
              {currentStep > 0 && (
                <button onClick={goBack} className={styles.backButton}>
                  <ArrowLeftIcon className={styles.backIcon} />
                  Back
                </button>
              )}

              {/* Question */}
              <div className={styles.questionSection}>
                <h2 className={styles.questionTitle}>
                  {questions[currentStep].title}
                </h2>
                <div className={styles.questionInfo}>
                  <InfoIcon className={styles.infoIcon} />
                  <p className={styles.questionSubtitle}>
                    {questions[currentStep].subtitle}
                  </p>
                </div>
              </div>

              {/* Answer Options */}
              <div className={styles.answerSection}>
                {questions[currentStep].type === 'select' ? (
                  <select
                    className={styles.selectInput}
                    onChange={(e) => handleAnswer(questions[currentStep].id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Choose an option...</option>
                    {questions[currentStep].options.map((option, idx) => (
                      <option key={idx} value={option}>{option}</option>
                    ))}
                  </select>
                ) : questions[currentStep].type === 'multiple' ? (
                  <div className={styles.multipleChoiceContainer}>
                    {questions[currentStep].options.map((option, idx) => {
                      const isSelected = ((answers[questions[currentStep].id] as string[]) || []).includes(option);
                      return (
                        <button
                          key={idx}
                          onClick={() => handleMultipleChoice(questions[currentStep].id, option)}
                          className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''}`}
                        >
                          <span>{option}</span>
                          {isSelected && <CheckIcon className={styles.checkIcon} />}
                        </button>
                      );
                    })}
                    {((answers[questions[currentStep].id] as string[]) || []).length > 0 && (
                      <button
                        onClick={() => {
                          setTimeout(() => {
                            if (currentStep < questions.length - 1) {
                              setCurrentStep(currentStep + 1);
                            } else {
                              setCurrentStep(questions.length);
                            }
                          }, 300);
                        }}
                        className={styles.continueButton}
                      >
                        Continue
                        <CaretRightIcon className={styles.chevronIcon} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={styles.choiceContainer}>
                    {questions[currentStep].options.map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswer(questions[currentStep].id, option)}
                        className={styles.choiceButton}
                      >
                        <span>{option}</span>
                        <CaretRightIcon className={styles.choiceChevron} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Signup Form */
            <div className={styles.signupContent}>
              <button onClick={goBack} className={styles.backButton}>
                <ArrowLeftIcon className={styles.backIcon} />
                Back
              </button>

              <div className={styles.signupHeader}>
                <div className={styles.signupIcon}>
                  <CheckIcon className={styles.signupCheckIcon} />
                </div>
                <h2 className={styles.signupTitle}>Perfect! Let's Create Your Account</h2>
                <p className={styles.signupSubtitle}>
                  You're all set! Now let's create your account to get started with your therapy journey.
                </p>
              </div>

              <form onSubmit={handleFormSubmit} className={styles.signupForm}>

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
                {/* <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>First Name</label>
                  <div className={styles.inputContainer}>
                    <UserIcon className={styles.inputIcon} />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => handleFormInputChange('firstName', e.target.value)}
                      className={styles.formInput}
                      placeholder="Enter your first name"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Email Address</label>
                  <div className={styles.inputContainer}>
                    <EnvelopeSimpleIcon className={styles.inputIcon} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleFormInputChange('email', e.target.value)}
                      className={styles.formInput}
                      placeholder="Enter your email address"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Phone Number</label>
                  <div className={styles.inputContainer}>
                    <PhoneIcon className={styles.inputIcon} />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleFormInputChange('phone', e.target.value)}
                      className={styles.formInput}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Create Password</label>
                  <div className={styles.inputContainer}>
                    <LockIcon className={styles.inputIcon} />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleFormInputChange('password', e.target.value)}
                      className={styles.formInput}
                      placeholder="Create a secure password"
                    />
                  </div>
                </div> */}

                <div className={styles.formFooter}>
                  <p className={styles.privacyText}>
                    By continuing you agree with BetterSpace{' '}
                    <a href="#" className={styles.privacyLink}>
                      Privacy Policy
                    </a>
                  </p>
                  <Button type="submit" size="large" iconPosition="right" icon={<CaretRightIcon />} className={styles.submitButton}>
                    Create Account
                    {/* <CaretRightIcon className={styles.chevronIcon} /> */}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;