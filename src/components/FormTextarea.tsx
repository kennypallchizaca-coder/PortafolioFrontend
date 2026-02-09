// Textarea reutilizable con contador de caracteres y validación

import { ChangeEvent } from 'react'

interface FormTextareaProps {
    label: string
    name: string
    value: string
    onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void
    onBlur?: () => void
    error?: string
    touched?: boolean
    required?: boolean
    placeholder?: string
    helpText?: string
    disabled?: boolean
    rows?: number
    maxLength?: number
    minLength?: number
}

import { FiInfo, FiAlertCircle } from 'react-icons/fi'

export const FormTextarea: React.FC<FormTextareaProps> = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    required,
    placeholder,
    helpText,
    disabled,
    rows = 4,
    maxLength,
    minLength,
}) => {
    const hasError = touched && error
    const textareaId = `textarea-${name}`
    const errorId = `${name}-error`
    const helpId = `${name}-help`

    // Calcula el color del contador según el porcentaje de uso (aviso visual)
    const getCharCountColor = () => {
        if (!maxLength) return 'text-base-content/60'
        const percentage = (value.length / maxLength) * 100
        if (percentage >= 90) return 'text-error'
        if (percentage >= 70) return 'text-warning'
        return 'text-base-content/60'
    }

    return (
        <div className="form-control">
            <label className="label" htmlFor={textareaId}>
                <span className="label-text">
                    {label} {required && <span className="text-error font-bold">*</span>}
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
            <textarea
                id={textareaId}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                maxLength={maxLength}
                className={`textarea textarea-bordered w-full ${hasError ? 'textarea-error' : ''
                    } ${disabled ? 'textarea-disabled' : ''}`}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
                aria-required={required}
            />
            <div className="label">
                <span className="label-text-alt">
                    {hasError && (
                        <span id={errorId} className="text-error flex items-center gap-1">
                            <FiAlertCircle className="w-4 h-4" />
                            <span>{error}</span>
                        </span>
                    )}
                </span>
                <span className={`label-text-alt ${getCharCountColor()}`}>
                    {value.length}
                    {minLength && ` (mín: ${minLength})`}
                    {maxLength && `/${maxLength}`}
                </span>
            </div>
        </div>
    )
}

export default FormTextarea
