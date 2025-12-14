import api from './apiConfig'; // Импортируем настроенный экземпляр Axios для выполнения HTTP-запросов

// Интерфейс для данных, необходимых при создании нового администратора
interface CreateAdminData {
    login: string; // Логин администратора
    password: string; // Пароль администратора
    fio: string; // Фамилия И. О. администратора
    phone: string; // Номер телефона администратора
}

// Интерфейс для данных, необходимых при обновлении учетных данных администратора.
// Все поля необязательны, так как можно обновить только часть данных.
export interface UpdateCredentialsData {
    newLogin?: string; // Новый логин (необязательно)
    newPassword?: string; // Новый пароль (необязательно)
    newPhone?: string; // Новый номер телефона (необязательно)
}

// Объект `adminApi` содержит методы для взаимодействия с API, связанными с администраторами.
export const adminApi = {
    /**
     * Отправляет запрос на создание нового администратора.
     * @param data Объект с данными нового администратора (логин, пароль, ФИО, телефон).
     * @returns Promise с данными ответа от сервера.
     */
    createAdmin: async (data: CreateAdminData) => {
        // Выполняем POST-запрос на эндпоинт `/admin` с переданными данными.
        const response = await api.post('/admin', data);
        return response.data; // Возвращаем данные из ответа сервера.
    },

    /**
     * Отправляет запрос на обновление учетных данных текущего администратора.
     * @param data Объект с обновленными данными (новый логин, новый пароль, новый телефон).
     * Поля, которые не нужно менять, можно опустить.
     * @returns Promise с данными ответа от сервера.
     */
    updateCredentials: async (data: UpdateCredentialsData) => {
        // Выполняем PUT-запрос на эндпоинт `/admin/credentials` с переданными данными.
        const response = await api.put('/admin/credentials', data);
        return response.data; // Возвращаем данные из ответа сервера.
    }
};
