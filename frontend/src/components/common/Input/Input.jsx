import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { classNames } from '../../../utils/helpers';
import styles from './Input.module.css';

export default function Input({
  label, error, helperText, icon, suffixIcon, type = 'text',
  placeholder, value, onChange, name, disabled, required,
  className, inputClassName, prefix, ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={classNames(styles.wrapper, error && styles.error, disabled && styles.disabled, className)}>
      {label && <label className={styles.label} htmlFor={name}>{label}{required && <span className={styles.required}>*</span>}</label>}
      <div className={styles.inputContainer}>
        {prefix && <span className={styles.prefix}>{prefix}</span>}
        {icon && <span className={styles.iconLeft}>{icon}</span>}
        <input
          id={name} name={name} type={inputType} value={value} onChange={onChange}
          placeholder={placeholder} disabled={disabled} required={required}
          className={classNames(styles.input, (icon || prefix) && styles.hasLeftIcon, (suffixIcon || isPassword) && styles.hasRightIcon, inputClassName)}
          {...props}
        />
        {isPassword && (
          <button type="button" className={styles.iconRight} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {suffixIcon && !isPassword && <span className={styles.iconRight}>{suffixIcon}</span>}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {helperText && !error && <p className={styles.helperText}>{helperText}</p>}
    </div>
  );
}
