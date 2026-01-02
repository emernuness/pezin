/**
 * Types for SignupForm components.
 */

export type UserType = "creator" | "consumer";

export interface SignupFormData {
  userType: UserType;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  displayName: string;
  acceptTerms: boolean;
}

export interface StepProps {
  formData: SignupFormData;
  updateField: <K extends keyof SignupFormData>(field: K, value: SignupFormData[K]) => void;
  fieldErrors: Record<string, string>;
}

export const TOTAL_STEPS = 4;
