// frontend/src/hooks/useForm.js
import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling forms with validation
 * @param {object} initialValues - Initial form values
 * @param {function} validate - Validation function that returns errors object
 * @param {function} onSubmit - Function to call on submission
 * @returns {object} Form state and handlers
 */
const useForm = (initialValues, validate, onSubmit) => {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validate form when values change
  useEffect(() => {
    if (validate) {
      const validateForm = async () => {
        const validationErrors = await validate(values);
        setErrors(validationErrors || {});
        setIsValid(Object.keys(validationErrors || {}).length === 0);
      };
      
      validateForm();
    }
  }, [values, validate]);

  // Handle form submission
  useEffect(() => {
    const handleSubmission = async () => {
      if (isSubmitting) {
        const validationErrors = validate ? await validate(values) : {};
        setErrors(validationErrors || {});
        
        if (Object.keys(validationErrors || {}).length === 0) {
          // If no errors, call onSubmit
          if (onSubmit) {
            try {
              await onSubmit(values);
            } catch (error) {
              console.error('Form submission error:', error);
            }
          }
        }
        
        setIsSubmitting(false);
      }
    };
    
    handleSubmission();
  }, [isSubmitting, onSubmit, validate, values]);

  // Handle input change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox, radio, and other input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues(prevValues => ({
      ...prevValues,
      [name]: inputValue
    }));
    
    // Mark field as touched
    if (!touched[name]) {
      setTouched(prevTouched => ({
        ...prevTouched,
        [name]: true
      }));
    }
  }, [touched]);
  
  // Handle blur event to mark field as touched
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prevTouched => ({
      ...prevTouched,
      [name]: true
    }));
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback((e) => {
    if (e) e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    
    setTouched(allTouched);
    setIsSubmitting(true);
  }, [values]);
  
  // Reset form to initial values
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);
  
  // Set form values programmatically
  const setFormValues = useCallback((newValues) => {
    setValues(prevValues => ({
      ...prevValues,
      ...newValues
    }));
  }, []);
  
  // Set a specific field value
  const setFieldValue = useCallback((field, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [field]: value
    }));
  }, []);
  
  // Set specific field error
  const setFieldError = useCallback((field, error) => {
    setErrors(prevErrors => ({
      ...prevErrors,
      [field]: error
    }));
  }, []);
  
  // Check if field has error and was touched
  const hasError = useCallback((field) => {
    return Boolean(touched[field] && errors[field]);
  }, [touched, errors]);
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormValues,
    setFieldValue,
    setFieldError,
    setErrors,
    hasError
  };
};