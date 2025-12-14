import { createContext, useContext, useState, ReactNode, useMemo } from 'react'; // Импорт хуков React: createContext для создания контекста, useContext для доступа к контексту, useState для управления состоянием, ReactNode для типизации дочерних элементов, useMemo для мемоизации значений
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles'; // Импорт ThemeProvider (переименован в MuiThemeProvider во избежание конфликтов) и createTheme для создания темы Material-UI
import { PaletteMode } from '@mui/material'; // Импорт типа PaletteMode для определения режима палитры (light/dark)

// Определение типа для значений, предоставляемых контекстом темы
type ThemeContextType = {
    toggleTheme: () => void; // Функция для переключения темы
    mode: PaletteMode; // Текущий режим палитры (светлый или темный)
};

// Создание контекста темы. Изначально он undefined, пока не будет предоставлен провайдером.
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Компонент ThemeProvider, который оборачивает дочерние элементы и предоставляет им доступ к контексту темы
export function ThemeProvider({ children }: { children: ReactNode }) {
    // Состояние для хранения текущего режима темы (light или dark)
    // Инициализируется значением из localStorage или 'light' по умолчанию
    const [mode, setMode] = useState<PaletteMode>(() => {
        return (localStorage.getItem('themeMode') as PaletteMode) || 'light';
    });

    // Мемоизированное создание объекта темы Material-UI
    // Тема пересоздается только при изменении режима (mode)
    const theme = useMemo(() => {
        return createTheme({
            palette: {
                mode, // Устанавливаем режим палитры (light/dark)
                // Условное добавление кастомных цветов для светлой и темной темы
                ...(mode === 'light'
                    ? {
                        // Настройки палитры для светлой темы
                        primary: { main: '#556cd6' }, // Основной цвет
                        secondary: { main: '#19857b' }, // Вторичный цвет
                    }
                    : {
                        // Настройки палитры для темной темы
                        primary: { main: '#3f51b5' },
                        secondary: { main: '#00e676' },
                    }),
            },
        });
    }, [mode]); // Зависимость: пересоздавать тему при изменении `mode`

    // Функция для переключения темы
    const toggleTheme = () => {
        setMode((prevMode) => {
            const newMode = prevMode === 'light' ? 'dark' : 'light'; // Определяем новый режим
            localStorage.setItem('themeMode', newMode); // Сохраняем новый режим в localStorage
            return newMode; // Возвращаем новый режим для обновления состояния
        });
    };

    // Объект значений, которые будут предоставлены контекстом
    const value = { toggleTheme, mode };

    return (
        // Предоставляем значения контекста дочерним компонентам
        <ThemeContext.Provider value={value}>
            {/* Оборачиваем дочерние элементы в ThemeProvider от Material-UI, передавая созданную тему */}
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
}

// Пользовательский хук для удобного доступа к контексту темы
export function useThemeContext() {
    const context = useContext(ThemeContext); // Пытаемся получить контекст
    // Если контекст не определен (то есть хук вызван вне ThemeProvider), выбрасываем ошибку
    if (context === undefined) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context; // Возвращаем значения из контекста
}
