// Input reutilizable con validación y manejo de errores UI

import { ChangeEvent } from 'react'

interface FormInputProps {
    label: string
    name: string
    type?: string
    value: string
    onChange: (e: ChangeEvent<HTMLInputElement>) => void
    onBlur?: () => void
    error?: string
    touched?: boolean
    required?: boolean
    placeholder?: string
    helpText?: string
    disabled?: boolean
    autoComplete?: string
    maxLength?: number
    readOnly?: boolean
}

import { FiInfo, FiAlertCircle } from 'react-icons/fi'

export const FormInput: React.FC<FormInputProps> = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    onBlur,
    error,
    touched,
    required,
    placeholder,
    helpText,
    disabled,
    autoComplete,
    maxLength,
    readOnly,
}) => {
    const hasError = touched && error
    const inputId = `input-${name}`
    const errorId = `${name}-error`
    const helpId = `${name}-help`

    return (
        <div className="form-control">
            <label className="label" htmlFor={inputId}>
                <span className="label-text">
                    {label} {required && !value && <span className="text-error font-bold">*</span>}
                </span>
                {helpText && (
                    <span
                        className="label-text-alt tooltip tooltip-left cursor-help flex items-center"
                        data-tip={helpText}
                        id={helpId}
                    >
                        <FiInfo className="text-info w-4 h-4" />
                    </span>
                )}
            </label>
            <input
                id={inputId}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete={autoComplete}
                maxLength={maxLength}
                readOnly={readOnly}
                className={`input input-bordered w-full ${hasError ? 'input-error' : ''
                    } ${disabled || readOnly ? 'input-disabled' : ''}`}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
                aria-required={required}
            />
            {hasError && (
                <label className="label">
                    <span id={errorId} className="label-text-alt text-error flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </span>
                </label>
            )}
            {maxLength && (
                <label className="label">
                    <span className="label-text-alt text-base-content/60">
                        {value.length}/{maxLength}
                    </span>
                </label>
            )}
        </div>
    )
}

export default FormInput
