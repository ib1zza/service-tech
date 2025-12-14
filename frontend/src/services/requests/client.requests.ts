import api from './apiConfig'; // Импортируем настроенный экземпляр Axios для выполнения HTTP-запросов

// Интерфейс для данных, необходимых при создании нового клиента.
interface CreateClientData {
    login: string; // Логин клиента.
    password: string; // Пароль клиента.
    phone: string; // Номер телефона клиента.
    companyName: string; // Название организации клиента.
}

// Интерфейс для данных, необходимых при обновлении информации о клиенте.
// Все поля необязательны, так как можно обновить только часть данных.
interface UpdateClientData {
    login?: string; // Новый логин (необязательно).
    phone?: string; // Новый номер телефона (необязательно).
    companyName?: string; // Новое название организации (необязательно).
    currentPassword?: string; // Текущий пароль (необходим при смене пароля).
    newPassword?: string; // Новый пароль (необязательно).
}

// Интерфейс для базовых данных клиента, возвращаемых с сервера.
interface Client {
    id: number; // Уникальный идентификатор клиента.
    login: string; // Логин клиента.
    phone: string; // Номер телефона клиента.
    companyName: string; // Название организации клиента.
    // Здесь могут быть добавлены другие поля клиента.
}

// Интерфейс для базовых данных заявки (используется как тип для массива заявок клиента).
interface Appeal {
    id: number; // Уникальный идентификатор заявки.
    // Здесь могут быть добавлены другие поля заявки.
}

// Интерфейс для данных клиента, как они приходят с сервера.
// Отличается от `Client` использованием snake_case для некоторых полей
// и включает необязательное поле `password` для форм.
export interface ClientFromServer {
    id: number; // Уникальный идентификатор клиента.
    login_client: string; // Логин клиента.
    phone_number_client: string; // Номер телефона клиента.
    company_name: string; // Название организации клиента.
    password?: string; // Пароль (используется только для форм, не хранится в открытом виде на сервере).
}

// Объект `clientApi` содержит методы для взаимодействия с API, связанными с клиентами.
export const clientApi = {
    /**
     * Отправляет запрос на создание нового клиента.
     * Доступно только для администраторов.
     * @param data Объект с данными нового клиента.
     * @returns Promise с данными созданного клиента.
     * @throws Error в случае неудачного создания клиента.
     */
    createClient: async (data: CreateClientData): Promise<Client> => {
        try {
            const response = await api.post('/clients', data);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to create client'
            );
        }
    },

    /**
     * Получает список всех клиентов.
     * Доступно только для администраторов.
     * @returns Promise с массивом объектов `Client`.
     * @throws Error в случае неудачного получения списка клиентов.
     */
    getAllClients: async (): Promise<Client[]> => {
        try {
            const response = await api.get('/clients');
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to get clients list'
            );
        }
    },

    /**
     * Получает информацию о конкретном клиенте или о текущем аутентифицированном клиенте.
     * @param id ID клиента или строка 'me' для текущего пользователя.
     * @returns Promise с объектом `Client`.
     * @throws Error в случае неудачного получения информации о клиенте.
     */
    getClient: async (id: number | 'me'): Promise<Client> => {
        try {
            const response = await api.get(`/clients/${id}`);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to get client information'
            );
        }
    },

    /**
     * Получает список заявок, связанных с конкретным клиентом или текущим аутентифицированным клиентом.
     * @param id ID клиента или строка 'me' для текущего пользователя.
     * @returns Promise с массивом объектов `Appeal`.
     * @throws Error в случае неудачного получения заявок клиента.
     */
    getClientAppeals: async (id: number | 'me'): Promise<Appeal[]> => {
        try {
            const response = await api.get(`/clients/${id}/appeals`);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to get client appeals'
            );
        }
    },

    /**
     * Обновляет данные клиента.
     * @param id ID клиента или строка 'me' для обновления текущего пользователя.
     * @param data Объект с данными для обновления (могут быть не все поля).
     * @returns Promise с обновленным объектом `Client`.
     * @throws Error в случае неудачного обновления данных клиента.
     */
    updateClient: async (
        id: number | 'me',
        data: UpdateClientData
    ): Promise<Client> => {
        try {
            const response = await api.put(`/clients/${id}`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to update client'
            );
        }
    },

    /**
     * Удаляет клиента.
     * Доступно только для администраторов.
     * @param id ID клиента, которого нужно удалить.
     * @returns Promise, который разрешается после успешного удаления.
     * @throws Error в случае неудачного удаления клиента.
     */
    deleteClient: async (id: number): Promise<void> => {
        try {
            await api.delete(`/clients/${id}`);
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to delete client'
            );
        }
    },

    /**
     * Обновляет пароль клиента.
     * Это удобный метод-обертка, который использует `updateClient`.
     * @param id ID клиента или строка 'me' для обновления текущего пользователя.
     * @param currentPassword Текущий пароль клиента.
     * @param newPassword Новый пароль клиента.
     * @returns Promise с обновленным объектом `Client`.
     * @throws Error в случае неудачного обновления пароля.
     */
    updateClientPassword: async (
        id: number | 'me',
        currentPassword: string,
        newPassword: string
    ): Promise<Client> => {
        try {
            return await clientApi.updateClient(id, {
                currentPassword,
                newPassword
            });
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to update password'
            );
        }
    }
};
