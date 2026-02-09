// Utilidades de validación para formularios (reglas estilo Angular)
// Centraliza mensajes y lógica de validación reutilizable

export interface FormErrors {
  [key: string]: {
    value?: any;
    message?: string;
  };
}

export class FormUtils {

  // Valida si un campo es requerido (no nulo, no vacío)
  static required(value: any): string | null {
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      return 'Este campo es obligatorio';
    }
    return null;
  }

  // Valida que el texto tenga una longitud mínima
  static minLength(value: string, min: number): string | null {
    if (!value) return null;
    if (value.length < min) {
      return `Debe tener al menos ${min} caracteres`;
    }
    return null;
  }

  // Valida que el texto no exceda una longitud máxima
  static maxLength(value: string, max: number): string | null {
    if (!value) return null;
    if (value.length > max) {
      return `Debe tener máximo ${max} caracteres`;
    }
    return null;
  }

  // Valida que un número sea mayor o igual al mínimo
  static min(value: number, min: number): string | null {
    if (value === null || value === undefined) return null;
    if (value < min) {
      return `El valor debe ser al menos ${min}`;
    }
    return null;
  }

  // Valida que un número sea menor o igual al máximo
  static max(value: number, max: number): string | null {
    if (value === null || value === undefined) return null;
    if (value > max) {
      return `El valor debe ser máximo ${max}`;
    }
    return null;
  }

  // Valida formato de correo electrónico con Regex
  static email(value: string): string | null {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Por favor, ingresa un correo electrónico válido';
    }
    return null;
  }

  // Valida formato de URL
  static url(value: string): string | null {
    if (!value) return null;
    try {
      new URL(value);
      return null;
    } catch {
      return 'Por favor, ingresa una URL válida';
    }
  }

  // Valida contra una expresión regular personalizada
  static pattern(value: string, pattern: RegExp, message: string): string | null {
    if (!value) return null;
    if (!pattern.test(value)) {
      return message;
    }
    return null;
  }

  // Valida formato de teléfono internacional (E.164)
  static phone(value: string): string | null {
    if (!value) return null;
    // Formato internacional E.164: +[código país][número]
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(value.replace(/[\s\-()]/g, ''))) {
      return 'Por favor, ingresa un número de teléfono válido (ej: +593999999999)';
    }
    return null;
  }

  // Valida que la fecha seleccionada sea posterior al día de hoy
  static futureDate(value: string): string | null {
    if (!value) return null;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear horas para comparar solo fechas

    if (selectedDate <= today) {
      return 'Por favor, selecciona una fecha posterior a hoy';
    }
    return null;
  }

  // Valida formato de hora HH:MM (24h)
  static validTime(value: string): string | null {
    if (!value) return null;
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(value)) {
      return 'Por favor, ingresa una hora válida (formato 24h, ej: 14:30)';
    }
    return null;
  }

  // Valida que dos campos sean idénticos (ej. contraseñas)
  static matchField(value: string, matchValue: string, fieldName: string = 'el campo anterior'): string | null {
    if (!value) return null;
    if (value !== matchValue) {
      return `Este campo debe coincidir con ${fieldName}`;
    }
    return null;
  }

  // Escapa caracteres HTML peligrosos
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

  // Valida longitud exacta de caracteres
  static exactLength(value: string, length: number): string | null {
    if (!value) return null;
    if (value.length !== length) {
      return `Este campo debe tener exactamente ${length} caracteres`;
    }
    return null;
  }

  // Valida que sea entero positivo > 0
  static positiveInteger(value: any): string | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      return 'Por favor, ingresa un número entero positivo';
    }
    return null;
  }

  // Ejecuta una lista de validadores sobre un valor; retorna el primer error encontrado
  static validate(value: any, validators: Array<(val: any) => string | null>): string | null {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  }

  // Valida un objeto completo de formulario contra un esquema de reglas
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

  // Retorna true si existen errores en el objeto de errores
  static hasErrors(errors: { [key: string]: string }): boolean {
    return Object.keys(errors).length > 0;
  }

  // Retorna un objeto de errores vacío
  static clearErrors(): { [key: string]: string } {
    return {};
  }
}
