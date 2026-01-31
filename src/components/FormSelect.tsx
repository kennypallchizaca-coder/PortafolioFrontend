/**
 * Componente reutilizable de select de formulario con validación integrada.
 * 
 * @module components/FormSelect
 * @author LEXISWARE - Proyecto Académico PPW
 */
import { ChangeEvent, ReactNode } from 'react'

interface FormSelectProps {
    label: string
    name: string
    value: string
    onChange: (e: ChangeEvent<HTMLSelectElement>) => void
    onBlur?: () => void
    error?: string
    touched?: boolean
    required?: boolean
    helpText?: string
    disabled?: boolean
    children: ReactNode
}

import { FiInfo, FiAlertCircle } from 'react-icons/fi'

export const FormSelect: React.FC<FormSelectProps> = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error,
    touched,
    required,
    helpText,
    disabled,
    children,
}) => {
    const hasError = touched && error
    const selectId = `select-${name}`
    const errorId = `${name}-error`
    const helpId = `${name}-help`

    return (
        <div className="form-control">
            <label className="label" htmlFor={selectId}>
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
            <select
                id={selectId}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                disabled={disabled}
                className={`select select-bordered w-full ${hasError ? 'select-error' : ''
                    } ${disabled ? 'select-disabled' : ''}`}
                aria-invalid={hasError ? 'true' : 'false'}
                aria-describedby={`${hasError ? errorId : ''} ${helpText ? helpId : ''}`.trim()}
                aria-required={required}
            >
                {children}
            </select>
            {hasError && (
                <label className="label">
                    <span id={errorId} className="label-text-alt text-error flex items-center gap-1">
                        <FiAlertCircle className="w-4 h-4" />
                        <span>{error}</span>
                    </span>
                </label>
            )}
        </div>
    )
}

export default FormSelect
