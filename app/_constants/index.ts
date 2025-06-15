import { AppRoute, UserDesignation } from "../_enums";
import {
  UserIcon,
  EnvelopeSimpleIcon,
  PhoneIcon,
  LockIcon,
} from "@phosphor-icons/react/dist/ssr";

// Define redirect rules as [designation, currentRoute] => redirectTo
export const redirectMap: Record<string, string> = {
  [`null_${AppRoute.SESSION}`]: AppRoute.LOGIN,
  [`${UserDesignation.PATIENT}_${AppRoute.LOGIN}`]: AppRoute.SESSION,
  [`${UserDesignation.THERAPIST}_${AppRoute.LOGIN}`]: AppRoute.PROVIDER,
  [`${UserDesignation.THERAPIST}_${AppRoute.SESSION}`]: AppRoute.PROVIDER,
  [`${UserDesignation.PATIENT}_${AppRoute.PROVIDER}`]: AppRoute.SESSION,
  [`any_${AppRoute.GET_STARTED}`]: AppRoute.LOGIN,
};

//Questionaire and Answer
interface Question {
  id: string;
  title: string;
  subtitle: string;
  type: "choice" | "multiple" | "select";
  options: string[];
}

export type QuestionArray = Question[];

export const questions: QuestionArray = [
  {
    id: "age",
    title: "What is your age range?",
    subtitle:
      "This helps us match you with therapists who specialize in your age group",
    type: "choice",
    options: ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"],
  },
  {
    id: "gender",
    title: "How do you identify?",
    subtitle: "We want to ensure you feel comfortable with your therapist",
    type: "choice",
    options: ["Male", "Female", "Non-binary", "Prefer not to say", "Other"],
  },
  {
    id: "issues",
    title: "What brings you to therapy today?",
    subtitle: "Select all that apply - this helps us find the right specialist",
    type: "multiple",
    options: [
      "Anxiety",
      "Depression",
      "Relationship issues",
      "Work stress",
      "Grief & loss",
      "Trauma",
      "Self-esteem",
      "Life transitions",
    ],
  },
  {
    id: "therapist_gender",
    title: "Do you have a preference for your therapist's gender?",
    subtitle: "Some people feel more comfortable with a specific gender",
    type: "choice",
    options: [
      "Male therapist",
      "Female therapist",
      "Non-binary therapist",
      "No preference",
    ],
  },
  {
    id: "session_type",
    title: "How would you prefer to have your sessions?",
    subtitle: "Choose what works best for your schedule and comfort",
    type: "choice",
    options: [
      "Video sessions only",
      "In-person sessions only",
      "Phone sessions only",
      "Flexible (mix of options)",
    ],
  },
  {
    id: "frequency",
    title: "How often would you like to meet?",
    subtitle: "This can always be adjusted as you progress",
    type: "select",
    options: [
      "Once a week",
      "Twice a week",
      "Every two weeks",
      "Once a month",
      "As needed",
    ],
  },
];
