/**
 * Utilidades para validación de formularios estilo Angular para React.
 * 
 * Centraliza la lógica de validación de formularios con reglas reutilizables,
 * mensajes de error personalizables y validaciones comunes (required, email, minLength, etc).
 * 
 * @module utils/FormUtils
 * @author LEXISWARE - Proyecto Académico PPW
 * @example
 * const rules = {
 *   email: [FormUtils.required, FormUtils.email],
 *   password: [FormUtils.required, FormUtils.minLength(6)]
 * };
 * const errors = FormUtils.validateForm(formData, rules);
 */

export interface FormErrors {
  [key: string]: {
    value?: any;
    message?: string;
  };
}

export class FormUtils {

  /**
   * Valida si un campo es requerido y está vacío
   */
  static required(value: any): string | null {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return 'Este campo es requerido';
    }
    return null;
  }

  /**
   * Valida longitud mínima
   */
  static minLength(value: string, min: number): string | null {
    if (!value) return null;
    if (value.length < min) {
      return `Mínimo ${min} caracteres`;
    }
    return null;
  }

  /**
   * Valida longitud máxima
   */
  static maxLength(value: string, max: number): string | null {
    if (!value) return null;
    if (value.length > max) {
      return `Máximo ${max} caracteres`;
    }
    return null;
  }

  /**
   * Valida valor mínimo
   */
  static min(value: number, min: number): string | null {
    if (value === null || value === undefined) return null;
    if (value < min) {
      return `Valor mínimo: ${min}`;
    }
    return null;
  }

  /**
   * Valida valor máximo
   */
  static max(value: number, max: number): string | null {
    if (value === null || value === undefined) return null;
    if (value > max) {
      return `Valor máximo: ${max}`;
    }
    return null;
  }

  /**
   * Valida formato de email
   */
  static email(value: string): string | null {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Email no válido';
    }
    return null;
  }

  /**
   * Valida URL
   */
  static url(value: string): string | null {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'URL no válida';
    }
  }

  /**
   * Valida patrón personalizado
   */
  static pattern(value: string, pattern: RegExp, message: string): string | null {
    if (!value) return null;
    if (!pattern.test(value)) {
      return message;
    }
    return null;
  }

  /**
   * Valida número de teléfono internacional
   * Acepta formatos como: +593999999999, +1234567890
   */
  static phone(value: string): string | null {
    if (!value) return null;
    // Formato internacional E.164: +[código país][número]
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value.replace(/[\s\-()]/g, ''))) {
      return 'Número de teléfono no válido (ej: +593999999999)';
    }
    return null;
  }

  /**
   * Valida que una fecha sea futura
   */
  static futureDate(value: string): string | null {
    if (!value) return null;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    if (selectedDate <= today) {
      return 'La fecha debe ser futura';
    }
    return null;
  }

  /**
   * Valida formato de hora HH:MM (24 horas)
   */
  static validTime(value: string): string | null {
    if (!value) return null;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(value)) {
      return 'Hora no válida (formato: HH:MM, ej: 14:30)';
    }
    return null;
  }

  /**
   * Valida que dos campos coincidan (útil para confirmación de password, email, etc)
   */
  static matchField(value: string, matchValue: string, fieldName: string = 'el campo anterior'): string | null {
    if (!value) return null;
    if (value !== matchValue) {
      return `Debe coincidir con ${fieldName}`;
    }
    return null;
  }

  /**
   * Sanitiza HTML para prevenir XSS
   * Convierte caracteres peligrosos en entidades HTML
   */
  static sanitizeHTML(value: string): string {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Valida longitud exacta (útil para códigos, documentos, etc)
   */
  static exactLength(value: string, length: number): string | null {
    if (!value) return null;
    if (value.length !== length) {
      return `Debe tener exactamente ${length} caracteres`;
    }
    return null;
  }

  /**
   * Valida que sea un número entero positivo
   */
  static positiveInteger(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      return 'Debe ser un número entero positivo';
    }
    return null;
  }

  /**
   * Ejecuta todas las validaciones de un campo
   */
  static validate(value: any, validators: Array<(val: any) => string | null>): string | null {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  }

  /**
   * Valida todo un formulario
   */
  static validateForm(formData: any, rules: { [key: string]: Array<(val: any) => string | null> }): { [key: string]: string } {
    const errors: { [key: string]: string } = {};

    for (const field in rules) {
      const error = FormUtils.validate(formData[field], rules[field]);
      if (error) {
        errors[field] = error;
      }
    }

    return errors;
  }

  /**
   * Verifica si el formulario tiene errores
   */
  static hasErrors(errors: { [key: string]: string }): boolean {
    return Object.keys(errors).length > 0;
  }

  /**
   * Limpia errores del formulario
   */
  static clearErrors(): { [key: string]: string } {
    return {};
  }
}
