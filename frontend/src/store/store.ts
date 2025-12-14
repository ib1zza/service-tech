import { configureStore } from '@reduxjs/toolkit'; // Импортируем `configureStore` из `@reduxjs/toolkit` для создания Redux-хранилища
import authReducer from './authSlice'; // Импортируем редьюсер `authReducer` из файла `authSlice`

// Создаем и настраиваем Redux-хранилище.
// `configureStore` упрощает процесс настройки хранилища, автоматически добавляя
// Redux DevTools Extension и некоторые middleware по умолчанию.
export const store = configureStore({
    reducer: {
        // Здесь определяются все редьюсеры вашего приложения.
        // Ключ `auth` будет соответствовать части состояния, управляемой `authReducer`.
        auth: authReducer // Подключаем `authReducer` к корневому редьюсеру.
    }
});

// Определяем тип `RootState`, который представляет собой полное состояние вашего Redux-хранилища.
// `ReturnType<typeof store.getState>` автоматически выводит тип на основе конфигурации хранилища,
// что обеспечивает строгую типизацию всего состояния.
export type RootState = ReturnType<typeof store.getState>;

// Определяем тип `AppDispatch`, который представляет собой типизированную версию функции `dispatch` вашего хранилища.
// `typeof store.dispatch` автоматически выводит тип функции `dispatch`,
// включая все возможные экшены и thunk'и, что обеспечивает строгую типизацию при отправке экшенов.
export type AppDispatch = typeof store.dispatch;
