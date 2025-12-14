import React from 'react'; // Импортируем React для создания компонентов
import ReactDOM from 'react-dom/client'; // Импортируем ReactDOM для рендеринга React-приложения в DOM
import App from './App'; // Импортируем корневой компонент вашего приложения
import {BrowserRouter} from 'react-router-dom'; // Импортируем BrowserRouter для маршрутизации в приложении
import {Provider} from "react-redux"; // Импортируем Provider из react-redux для предоставления Redux-хранилища всему приложению
import {store} from "./store/store.ts"; // Импортируем Redux-хранилище
import {ThemeProvider} from "./contexts/ThemeContext.tsx"; // Импортируем ThemeProvider для управления темой Material-UI

// Создаем корневой элемент React-приложения и рендерим в него компоненты.
// `document.getElementById('root')!` находит HTML-элемент с id="root" (обычно в index.html)
// и `!` утверждает, что этот элемент точно будет найден.
ReactDOM.createRoot(document.getElementById('root')!).render(
    // `React.StrictMode` - это инструмент для обнаружения потенциальных проблем в приложении.
    // Он активирует дополнительные проверки и предупреждения во время разработки.
    <React.StrictMode>
        {/* `BrowserRouter` предоставляет функциональность маршрутизации для всего приложения.
            Он использует API истории HTML5 для синхронизации пользовательского интерфейса с URL. */}
        <BrowserRouter>
            {/* `Provider` делает Redux-хранилище доступным для всех компонентов,
                обернутых в него, без явной передачи пропсов. */}
            <Provider store={store}>
                {/* `ThemeProvider` из кастомного контекста предоставляет функциональность
                    переключения тем (светлая/темная) для всех компонентов, которые ее используют. */}
                <ThemeProvider>
                    {/* Корневой компонент вашего приложения, который содержит все остальные компоненты и логику. */}
                    <App/>
                </ThemeProvider>
            </Provider>
        </BrowserRouter>
    </React.StrictMode>
);
