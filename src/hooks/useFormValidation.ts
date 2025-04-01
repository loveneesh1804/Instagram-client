import { useState } from "react";
import { ErrorsType, FormType, UseFormValidationProps } from "../types";

export const useFormValidation = ({
  validations,
  onSubmit,
}: UseFormValidationProps) => {
  const [form, setform] = useState<FormType>({});
  const [errors, setErrors] = useState<ErrorsType>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name ? e.target.name : e.target.className;
    const value = e.target.value;
    setform((prev) => ({ ...prev, [key]: value }));
    if (submitted) {
      const { res, msg } = validations[key](value);
      setErrors((prev) => ({
        ...prev,
        [key]: {
          msg,
          res,
        },
      }));
    }
  };

  const hasErrors = () => {
    const newErrs: ErrorsType = {};
    let isError: boolean = true;
    Object.keys(validations).forEach(
      (el) => (newErrs[el] = validations[el](form[el] || ""))
    );
    setErrors(newErrs);
    Object.keys(validations).forEach((el) => {
      if (!newErrs[el].res) {
        isError = false;
      }
    });
    return isError;
  };

  const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors()) {
      onSubmit();
    }
  };
  
  return { form, errors, onFormSubmit, onInputChange};
};
