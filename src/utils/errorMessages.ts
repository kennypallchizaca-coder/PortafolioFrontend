// Sistema centralizado de mensajes de error amigables para el usuario

// Diccionario de mensajes HTTP estándar
export const httpErrorMessages: Record<number, string> = {
  400: 'Los datos enviados no son válidos. Por favor, revisa la información e intenta de nuevo.',
  401: 'Tu sesión ha expirado o las credenciales son incorrectas. Por favor, inicia sesión nuevamente.',
  403: 'No tienes permisos para realizar esta acción.',
  404: 'El recurso que buscas no está disponible o no existe.',
  409: 'Ya existe un registro con esta información.',
  422: 'Algunos datos no cumplen con el formato esperado. Por favor, verifica e intenta de nuevo.',
  429: 'Has realizado demasiadas solicitudes. Por favor, espera un momento antes de intentar de nuevo.',
  500: 'Ocurrió un error en el servidor. Estamos trabajando para solucionarlo.',
  502: 'El servidor no está disponible temporalmente. Por favor, intenta más tarde.',
  503: 'El servicio está en mantenimiento. Por favor, intenta más tarde.',
  504: 'La conexión con el servidor tardó demasiado. Por favor, verifica tu conexión e intenta de nuevo.',
}

// Mensajes para flujos de autenticación
export const authMessages = {
  // Login
  invalidCredentials: 'El correo o la contraseña son incorrectos. Por favor, verifica tus datos.',
  accountNotFound: 'No encontramos una cuenta con este correo electrónico.',
  accountLocked: 'Tu cuenta ha sido bloqueada temporalmente por seguridad. Intenta más tarde.',
  sessionExpired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',

  // Registro
  emailInUse: 'Este correo electrónico ya está registrado. ¿Quieres iniciar sesión en su lugar?',
  weakPassword: 'La contraseña es muy débil. Usa al menos 6 caracteres con letras y números.',
  invalidEmail: 'El formato del correo electrónico no es válido.',
  registrationSuccess: '¡Cuenta creada exitosamente! Iniciando sesión...',

  // General
  networkError: 'No pudimos conectar con el servidor. Por favor, verifica tu conexión a internet.',
  unknownError: 'Ocurrió un error inesperado. Por favor, intenta de nuevo.',
}

// Mensajes para validaciones de formularios
export const validationMessages = {
  required: 'Este campo es obligatorio',
  email: 'Por favor, ingresa un correo electrónico válido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `Debe tener máximo ${max} caracteres`,
  minValue: (min: number) => `El valor mínimo es ${min}`,
  maxValue: (max: number) => `El valor máximo es ${max}`,
  phone: 'Por favor, ingresa un número de teléfono válido (ej: +593999999999)',
  url: 'Por favor, ingresa una URL válida',
  date: 'Por favor, selecciona una fecha válida',
  futureDate: 'La fecha debe ser posterior a hoy',
  time: 'Por favor, ingresa una hora válida (formato 24h, ej: 14:30)',
  passwordMatch: 'Las contraseñas no coinciden',
  positiveNumber: 'Ingresa un número positivo',
  formHasErrors: 'Por favor, revisa los campos marcados y corrige los errores.',
}

// Mensajes de éxito/error para operaciones CRUD
export const crudMessages = {
  // Proyectos
  projectCreated: '¡Proyecto creado exitosamente!',
  projectUpdated: '¡Proyecto actualizado exitosamente!',
  projectDeleted: 'Proyecto eliminado correctamente.',
  projectLoadError: 'No pudimos cargar los proyectos. Por favor, intenta de nuevo.',
  projectSaveError: 'No pudimos guardar el proyecto. Por favor, verifica los datos e intenta de nuevo.',

  // Perfil
  profileUpdated: '¡Perfil actualizado exitosamente!',
  profileLoadError: 'No pudimos cargar tu perfil. Por favor, intenta de nuevo.',
  profileSaveError: 'No pudimos guardar los cambios en tu perfil. Por favor, intenta de nuevo.',

  // Portafolio
  portfolioUpdated: '¡Portafolio actualizado exitosamente!',
  portfolioLoadError: 'No pudimos cargar el portafolio. Por favor, intenta de nuevo.',

  // Asesorías
  advisoryCreated: '¡Solicitud de asesoría enviada exitosamente! Te notificaremos cuando el programador responda.',
  advisoryApproved: '¡Asesoría aprobada! Se ha notificado al solicitante.',
  advisoryRejected: 'Asesoría rechazada. Se ha notificado al solicitante.',
  advisoryLoadError: 'No pudimos cargar las asesorías. Por favor, intenta de nuevo.',
  advisorySendError: 'No pudimos enviar tu solicitud. Por favor, verifica los datos e intenta de nuevo.',

  // Imágenes
  imageUploadSuccess: '¡Imagen cargada exitosamente!',
  imageUploadError: 'No pudimos cargar la imagen. Por favor, intenta con otro archivo.',
  imageTooLarge: 'La imagen es muy grande. El tamaño máximo es 5MB.',
  invalidImageFormat: 'Formato de imagen no soportado. Usa JPG, PNG o WebP.',
}

// Mensajes de estado (cargando, guardando) y confirmaciones
export const statusMessages = {
  loading: 'Cargando...',
  saving: 'Guardando cambios...',
  sending: 'Enviando...',
  deleting: 'Eliminando...',
  uploading: 'Subiendo archivo...',
  processing: 'Procesando...',

  confirmDelete: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
  confirmLogout: '¿Estás seguro de que deseas cerrar sesión?',

  noResults: 'No se encontraron resultados.',
  emptyList: 'Aún no hay elementos para mostrar.',
}

// Devuelve el mensaje amigable correspondiente al código de estado HTTP
export const getHttpErrorMessage = (status: number): string => {
  return httpErrorMessages[status] || httpErrorMessages[500]
}

// Traduce errores de Axios a mensajes legibles según el contexto (login, register, etc)
export const getErrorMessage = (error: any, context?: 'login' | 'register' | 'project' | 'profile' | 'advisory'): string => {
  // Si es un error de red (sin respuesta del servidor)
  if (!error.response) {
    if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
      return authMessages.networkError
    }
    if (error.message?.includes('timeout')) {
      return httpErrorMessages[504]
    }
    return authMessages.unknownError
  }

  const status = error.response?.status
  const serverMessage = error.response?.data?.message?.toLowerCase() || ''

  // Mensajes específicos según el contexto
  if (context === 'login') {
    if (status === 401 || status === 403) {
      return authMessages.invalidCredentials
    }
    if (status === 404) {
      return authMessages.accountNotFound
    }
  }

  if (context === 'register') {
    if (status === 409 || serverMessage.includes('email') || serverMessage.includes('exists') || serverMessage.includes('duplicate')) {
      return authMessages.emailInUse
    }
    if (status === 400 && serverMessage.includes('password')) {
      return authMessages.weakPassword
    }
  }

  if (context === 'project') {
    if (status === 400 || status === 422) {
      return crudMessages.projectSaveError
    }
  }

  if (context === 'advisory') {
    if (status === 400 || status === 422) {
      return crudMessages.advisorySendError
    }
  }

  // Mensaje genérico basado en código HTTP
  return getHttpErrorMessage(status)
}

export default {
  httpErrorMessages,
  authMessages,
  validationMessages,
  crudMessages,
  statusMessages,
  getHttpErrorMessage,
  getErrorMessage,
}
