export interface DemoFormValues {
  fullName: string;
  companyName: string;
  role: string;
  companyWebsite: string;
  businessEmail: string;
  phoneNumber: string;
  companySize: string;
  country: string;
  monthlyBudget: string;
  notes: string;
}

export const EMPTY_DEMO_FORM: DemoFormValues = {
  fullName: "",
  companyName: "",
  role: "",
  companyWebsite: "",
  businessEmail: "",
  phoneNumber: "",
  companySize: "",
  country: "",
  monthlyBudget: "",
  notes: "",
};

export type DemoFormErrors = Partial<Record<keyof DemoFormValues, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Loosely permissive: digits, spaces, parens, dashes, leading +, 7-20 digits total.
const PHONE_RE = /^\+?[0-9()\-.\s]{7,20}$/;
const WEBSITE_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

export const NOTES_MAX_LENGTH = 150;

/** Mirrors the required/optional fields observed on the live "Book Your Free Strategy Call" form. */
export function validateDemoForm(values: DemoFormValues): DemoFormErrors {
  const errors: DemoFormErrors = {};

  if (!values.fullName.trim()) errors.fullName = "Full name is required.";
  if (!values.companyName.trim()) errors.companyName = "Company name is required.";
  if (!values.role) errors.role = "Please select your role.";

  if (!values.companyWebsite.trim()) {
    errors.companyWebsite = "Company website is required.";
  } else if (!WEBSITE_RE.test(values.companyWebsite.trim())) {
    errors.companyWebsite = "Enter a valid website, e.g. www.company.com.";
  }

  if (!values.businessEmail.trim()) {
    errors.businessEmail = "Business email is required.";
  } else if (!EMAIL_RE.test(values.businessEmail.trim())) {
    errors.businessEmail = "Enter a valid email address.";
  }

  if (!values.phoneNumber.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!PHONE_RE.test(values.phoneNumber.trim())) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  if (!values.companySize) errors.companySize = "Please select a company size.";
  if (!values.country) errors.country = "Please select a country.";
  if (!values.monthlyBudget) errors.monthlyBudget = "Please select a budget.";

  if (values.notes.length > NOTES_MAX_LENGTH) {
    errors.notes = `Keep this under ${NOTES_MAX_LENGTH} characters.`;
  }

  return errors;
}

export function isDemoFormValid(values: DemoFormValues): boolean {
  return Object.keys(validateDemoForm(values)).length === 0;
}
