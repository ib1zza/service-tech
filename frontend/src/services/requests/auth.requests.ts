import api from './apiConfig'; // Импортируем настроенный экземпляр Axios для выполнения HTTP-запросов

// Интерфейс для данных, необходимых при входе в систему.
interface LoginData {
    login: string; // Логин пользователя.
    password: string; // Пароль пользователя.
    roleType: 'admin' | 'staff' | 'client'; // Тип роли пользователя.
}

// Интерфейс для данных пользователя, возвращаемых после успешной аутентификации.
export interface UserData {
    id: number; // Уникальный идентификатор пользователя.
    login: string; // Логин пользователя.
    role: string; // Роль пользователя (например, 'admin', 'staff', 'client').
    // Здесь могут быть добавлены другие поля пользователя, такие как fio, company_name и т.д.
}

// Объект `authApi` содержит методы для взаимодействия с API, связанными с аутентификацией.
export const authApi = {
    /**
     * Отправляет запрос на вход пользователя в систему.
     * @param data Объект с учетными данными для входа (логин, пароль, тип роли).
     * @returns Promise с данными ответа от сервера, включая токен и информацию о пользователе.
     */
    login: async (data: LoginData) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    /**
     * Получает информацию о текущем аутентифицированном пользователе.
     * Используется для проверки сессии и загрузки данных пользователя.
     * @returns Promise с объектом `UserData`.
     */
    getMe: async (): Promise<UserData> => {
        const response = await api.get('/auth/me');
        return response.data;
    }
};
