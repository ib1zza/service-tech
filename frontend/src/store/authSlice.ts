import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // Импортируем `createSlice` для создания Redux-слайсов и `PayloadAction` для типизации экшенов
import { User, AuthState } from '../types/user'; // Импортируем типы `User` и `AuthState` из файла с определениями типов
import api from '../services/api'; // Импортируем настроенный экземпляр Axios для выполнения HTTP-запросов

// Начальное состояние для слайса аутентификации
const initialState: AuthState = {
    token: localStorage.getItem('token') || null, // Токен берется из localStorage при инициализации, если он есть
    user: null, // Данные пользователя, изначально null
    isAuthenticated: false, // Флаг, указывающий, аутентифицирован ли пользователь
    loading: true, // Флаг загрузки (например, при проверке аутентификации при старте приложения)
    error: null // Сообщение об ошибке, если таковая возникла
};

// Создаем Redux-слайс для управления состоянием аутентификации
const authSlice = createSlice({
    name: 'auth', // Имя слайса, используется как префикс для типов экшенов
    initialState, // Начальное состояние слайса
    reducers: {
        // Редьюсер для начала процесса входа
        loginStart(state) {
            state.loading = true; // Устанавливаем флаг загрузки в true
            state.error = null; // Сбрасываем ошибки
        },
        // Редьюсер для успешного входа
        loginSuccess(state, action: PayloadAction<{ token: string; user: User }>) {
            state.token = action.payload.token; // Сохраняем токен
            state.user = action.payload.user; // Сохраняем данные пользователя
            state.isAuthenticated = true; // Устанавливаем флаг аутентификации в true
            state.loading = false; // Сбрасываем флаг загрузки
            state.error = null; // Сбрасываем ошибки
            localStorage.setItem('token', action.payload.token); // Сохраняем токен в localStorage
        },
        // Редьюсер для неудачного входа
        loginFailure(state, action: PayloadAction<string>) {
            state.loading = false; // Сбрасываем флаг загрузки
            state.error = action.payload; // Сохраняем сообщение об ошибке
            state.isAuthenticated = false; // Устанавливаем флаг аутентификации в false
            state.token = null; // Очищаем токен
            state.user = null; // Очищаем данные пользователя
            localStorage.removeItem('token'); // Удаляем токен из localStorage
        },
        // Редьюсер для выхода из системы
        logout(state) {
            state.token = null; // Очищаем токен
            state.user = null; // Очищаем данные пользователя
            state.isAuthenticated = false; // Устанавливаем флаг аутентификации в false
            state.loading = false; // Сбрасываем флаг загрузки
            state.error = null; // Сбрасываем ошибки
            localStorage.removeItem('token'); // Удаляем токен из localStorage
        },
        // Редьюсер для установки данных пользователя (например, при инициализации приложения)
        setUser(state, action: PayloadAction<User>) {
            state.user = action.payload; // Устанавливаем данные пользователя
            state.isAuthenticated = true; // Устанавливаем флаг аутентификации в true
        },
        // Редьюсер для очистки сообщения об ошибке
        clearError(state) {
            state.error = null;
        }
    }
});

// Экспортируем экшен-креаторы для использования в компонентах
export const { loginStart, loginSuccess, loginFailure, logout, setUser, clearError } = authSlice.actions;

// Асинхронный thunk для проверки текущего пользователя по токену
export const checkAuth = () => async (dispatch: any) => {
    const token = localStorage.getItem('token'); // Получаем токен из localStorage
    if (!token) {
        return; // Если токена нет, выходим
    }

    try {
        // Отправляем запрос на сервер для получения информации о текущем пользователе
        const response = await api.get('/auth/me');
        // Если запрос успешен, диспатчим `loginSuccess` с полученными данными
        dispatch(loginSuccess(response.data));
    } catch (error) {
        // В случае ошибки (например, невалидный токен), диспатчим `logout`
        dispatch(logout());
    }
};

// Экспортируем редьюсер слайса по умолчанию
export default authSlice.reducer;
