"use client"

import React, { useState } from 'react';
import { questions } from '@/app/_constants';
import {
  ArrowLeftIcon, CheckIcon, CaretRightIcon,
  InfoIcon,
} from '@phosphor-icons/react/dist/ssr';
import styles from './GetStarted.module.css';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { SelectedQuesAnswersPatient } from '@/app/_lib/actions';
import CreateForm from '../CreateForm/CreateForm';

export interface Answers {
  [key: string]: string | string[];
}

// Map generic answers to strict SelectedQuesAnswersPatient
function mapAnswersToSelectedQuesAnswersPatient(answers: Answers): SelectedQuesAnswersPatient {
  return {
    age: (answers['age'] as string) || "",
    gender: (answers['gender'] as string) || "",
    issues: Array.isArray(answers['issues']) ? (answers['issues'] as string[]).join(', ') : (answers['issues'] as string) || "",
    therapist_gender: (answers['therapist_gender'] as string) || "",
    session_type: (answers['session_type'] as string) || "",
    frequency: (answers['frequency'] as string) || "",
  };
}


const GetStarted: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false)

  console.log(answers)

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

  const goBack = (): void => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
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
                <Button variant='text' iconPosition='left' icon={<ArrowLeftIcon className={styles.backIcon} />} onClick={goBack} className={styles.backButton}>
                  Back
                </Button>
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
                  <Input
                    id="select"
                    value=""
                    inputType="selectTherapy"
                    options={questions[currentStep].options}
                    onChange={(e) => handleAnswer(questions[currentStep].id, e.target.value)}
                  />

                ) : questions[currentStep].type === 'multiple' ? (
                  <div className={styles.multipleChoiceContainer}>
                    {questions[currentStep].options.map((option, idx) => {
                      const isSelected = ((answers[questions[currentStep].id] as string[]) || []).includes(option);
                      return (
                        <Button
                          key={idx}
                          custom={true}
                          variant='none'
                          iconPosition='right'
                          icon={isSelected ? <CheckIcon className={styles.checkIcon} /> : ""}
                          onClick={() => handleMultipleChoice(questions[currentStep].id, option)}
                          className={`${styles.optionButton} ${isSelected ? styles.optionButtonSelected : ''}`}
                        >
                          <span>{option}</span>
                        </Button>
                      );
                    })}
                    {((answers[questions[currentStep].id] as string[]) || []).length > 0 && (
                      <Button
                        size="large"
                        iconPosition="right"
                        icon={<CaretRightIcon className={styles.chevronIcon} />}
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
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className={styles.choiceContainer}>
                    {questions[currentStep].options.map((option, idx) => (
                      <Button
                        variant='none'
                        custom={true}
                        iconPosition='right'
                        icon={<CaretRightIcon className={styles.choiceChevron} />}
                        key={idx}
                        onClick={() => handleAnswer(questions[currentStep].id, option)}
                        className={styles.choiceButton}
                      >
                        <span>{option}</span>

                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <CreateForm goBack={goBack} answers={mapAnswersToSelectedQuesAnswersPatient(answers)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GetStarted;