import api from './apiConfig'; // Импортируем настроенный экземпляр Axios для выполнения HTTP-запросов

// Интерфейс для данных, необходимых при создании нового сотрудника.
interface CreateStaffData {
    login: string; // Логин сотрудника.
    password: string; // Пароль сотрудника.
    fio: string; // Фамилия И. О. сотрудника.
}

// Интерфейс для данных, необходимых при обновлении информации о сотруднике.
// Все поля необязательны, так как можно обновить только часть данных.
interface UpdateStaffData {
    login?: string; // Новый логин (необязательно).
    password?: string; // Новый пароль (необязательно).
    fio?: string; // Новое ФИО (необязательно).
}

// Интерфейс для базовых данных сотрудника, возвращаемых с сервера.
interface Staff {
    id: number; // Уникальный идентификатор сотрудника.
    login: string; // Логин сотрудника.
    fio: string; // Фамилия И. О. сотрудника.
    // Здесь могут быть добавлены другие поля сотрудника.
}

// Интерфейс для данных сотрудника, как они приходят с сервера, включая роль и пароль в открытом виде.
export interface StaffFromServer {
    id: number; // Уникальный идентификатор сотрудника.
    login_staff: string; // Логин сотрудника.
    password: string; // Пароль сотрудника (хешированный).
    password_plain: string; // Пароль сотрудника в открытом виде (вероятно, для внутренних нужд или тестирования).
    fio_staff: string; // Фамилия И. О. сотрудника.
    role: Role; // Объект роли сотрудника.
}

// Интерфейс для роли пользователя.
export interface Role {
    id: number; // Уникальный идентификатор роли.
    role: string; // Строковое представление роли (например, 'admin', 'staff', 'client').
}

// Интерфейс для базовых данных заявки (используется как тип для массива заявок сотрудника).
interface Appeal {
    id: number; // Уникальный идентификатор заявки.
    // Здесь могут быть добавлены другие поля заявки.
}

// Объект `staffApi` содержит методы для взаимодействия с API, связанными с сотрудниками.
export const staffApi = {
    /**
     * Отправляет запрос на создание нового сотрудника.
     * @param data Объект с данными нового сотрудника.
     * @returns Promise с данными созданного сотрудника.
     * @throws Error в случае неудачного создания сотрудника.
     */
    createStaff: async (data: CreateStaffData): Promise<StaffFromServer> => {
        try {
            const response = await api.post('/staff', data);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to create staff member'
            );
        }
    },

    /**
     * Получает список заявок, связанных с конкретным сотрудником.
     * @param staffId ID сотрудника.
     * @returns Promise с массивом объектов `Appeal`.
     * @throws Error в случае неудачного получения заявок сотрудника.
     */
    getStaffAppeals: async (staffId: number): Promise<Appeal[]> => {
        try {
            const response = await api.get(`/staff/${staffId}/appeals`);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to get staff appeals'
            );
        }
    },

    /**
     * Обновляет данные сотрудника.
     * @param staffId ID сотрудника.
     * @param data Объект с данными для обновления (могут быть не все поля).
     * @returns Promise с обновленным объектом `StaffFromServer`.
     * @throws Error в случае неудачного обновления данных сотрудника.
     */
    updateStaff: async (
        staffId: number,
        data: UpdateStaffData
    ): Promise<StaffFromServer> => {
        try {
            const response = await api.put(`/staff/${staffId}`, data);
            return response.data;
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to update staff member'
            );
        }
    },

    /**
     * Удаляет сотрудника.
     * @param staffId ID сотрудника.
     * @returns Promise, который разрешается после успешного удаления.
     * @throws Error в случае неудачного удаления сотрудника.
     */
    deleteStaff: async (staffId: number): Promise<void> => {
        try {
            await api.delete(`/staff/${staffId}`);
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to delete staff member'
            );
        }
    },

    /**
     * Получает список всех сотрудников.
     * @returns Promise с массивом объектов `StaffFromServer`.
     * @throws Error в случае неудачного получения списка сотрудников.
     */
    getAllStaff: async (): Promise<StaffFromServer[]> => {
        try {
            const response = await api.get<StaffFromServer[]>('/staff/all');
            const result = response.data;
            // Преобразуем поле `password_plain` в `password` для совместимости с формами,
            // если это необходимо на клиенте.
            return result.map((staff) => ({
                    ...staff,
                    password: staff.password_plain,
                }
            ));
        } catch (error: any) {
            throw new Error(
                error.response?.data?.error ||
                'Failed to get staff list'
            );
        }
    },
};
