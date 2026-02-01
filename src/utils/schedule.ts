/**
 * Utilidades para el manejo de calendarios, horarios y disponibilidad.
 * @module utils/schedule
 */
export const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
    const hour = Math.floor(i / 2).toString().padStart(2, '0')
    const minute = (i % 2) * 30 === 0 ? '00' : '30'
    return `${hour}:${minute}`
})

/**
 * Mapeo de índice de día (0=Domingo) a nombre legible.
 */
export const DAYS_MAP = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

/**
 * Expande rangos de tiempo o horas exactas en una lista de slots individuales.
 * Soporta formatos como "09:00" o "09:00 - 12:00".
 * @param timeStr Cadena de texto con la hora o el rango.
 * @returns Array de slots de 30 minutos (ej: ["09:00", "09:30"]).
 */
export const expandTimeSlots = (timeStr: string): string[] => {
    const slots: string[] = []
    const cleanStr = timeStr.trim()

    // caso 1: hora exacta
    if (/^\d{1,2}:\d{2}$/.test(cleanStr)) {
        return [cleanStr]
    }

    // caso 2: rango de horas
    const match = cleanStr.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    if (match) {
        const [_, start, end] = match
        const [startH, startM] = start.split(':').map(Number)
        const [endH, endM] = end.split(':').map(Number)

        let currentMins = startH * 60 + startM
        const endMins = endH * 60 + endM

        while (currentMins < endMins) {
            const h = Math.floor(currentMins / 60).toString().padStart(2, '0')
            const m = (currentMins % 60).toString().padStart(2, '0')
            slots.push(`${h}:${m}`)
            currentMins += 30
        }
    }
    return slots
}

/**
 * Procesa el array de horarios del programador y lo organiza por días.
 * Clasifica los horarios que incluyen el nombre del día y los genéricos.
 * @param scheduleItems Lista de strings con horarios (ej: ["Lunes 09:00-12:00", "15:00"]).
 * @returns Objeto con mapa por días, lista de genéricos y días encontrados.
 */
export const parseProgrammerSchedule = (scheduleItems: string[]) => {
    const map: { [key: string]: string[] } = {}
    const generics: string[] = []
    const daysFound = new Set<string>()

    scheduleItems.forEach(item => {
        // detectar si el item incluye día (ej: "Lunes 09:00 - 12:00")
        const dayMatch = item.match(/^(Lunes|Martes|Miércoles|Jueves|Viernes|Sábado|Domingo)/i)

        if (dayMatch) {
            // normalizar día
            const rawDay = dayMatch[1].toLowerCase()
            const day = rawDay.charAt(0).toUpperCase() + rawDay.slice(1)
            daysFound.add(day)

            // extraer parte de hora
            const timePart = item.replace(dayMatch[0], '')
            const slots = expandTimeSlots(timePart)

            if (!map[day]) map[day] = []
            map[day].push(...slots)
        } else {
            // horario sin día específico
            const slots = expandTimeSlots(item)
            generics.push(...slots)
        }
    })

    return { map, generics, daysFound: Array.from(daysFound) }
}
