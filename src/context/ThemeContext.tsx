// Contexto para el manejo dinámico de temas visuales mediante DaisyUI

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'

type Theme = 'forest' | 'synthwave' | 'dracula'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  changeTheme: (newTheme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const DEFAULT_THEME: Theme = 'forest'

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(
    (localStorage.getItem('theme') as Theme) || DEFAULT_THEME
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () =>
    setTheme((prev) => (prev === 'forest' ? 'synthwave' : prev === 'synthwave' ? 'dracula' : 'forest'))

  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}
