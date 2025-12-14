import api from './apiConfig'; // Импортируем настроенный экземпляр Axios для выполнения HTTP-запросов

// Интерфейс для данных, необходимых при создании новой заявки.
interface CreateAppealData {
    mechanism: string; // Обозначение механизма, по которому создается заявка.
    problem: string; // Описание проблемы или неисправности.
    fioClient: string; // Фамилия И. О. клиента, сообщившего о проблеме.
}

// Базовый интерфейс для заявки. Содержит общие поля для всех типов заявок.
export interface Appeal {
    id: number; // Уникальный идентификатор заявки.
    mechanism: string; // Обозначение механизма.
    problem: string; // Описание проблемы.
    fio_client: string; // Фамилия И. О. клиента, сообщившего о проблеме.
    date_start: string; // Дата и время создания заявки.
    appeal_desc: string | null; // Описание выполненных работ или комментарий мастера (может быть null).
    date_close: string | null; // Дата и время закрытия заявки (может быть null).
    fio_staff: string | null; // ФИО сотрудника (может быть null, если не назначен).
    company_name_id: Company; // Объект компании, связанной с заявкой.
    status: Status; // Объект статуса заявки.
}

// Интерфейс для заявки, находящейся в работе. Расширяет базовый интерфейс `Appeal`.
export interface AppealInProgress extends Appeal {
    fio_staff_open_id: Staff; // Объект сотрудника, который принял заявку в работу.
}

// Интерфейс для завершенной заявки. Расширяет базовый интерфейс `Appeal`.
export interface AppealCompleted extends Appeal {
    fio_staff_open_id: Staff; // Объект сотрудника, который принял заявку в работу.
    fio_staff_close_id: Staff; // Объект сотрудника, который закрыл заявку.
}

// Интерфейс для данных сотрудника.
export interface Staff {
    id: number; // Уникальный идентификатор сотрудника.
    login_staff: string; // Логин сотрудника.
    password: string; // Пароль сотрудника (хешированный).
    password_plain: string; // Пароль сотрудника (в открытом виде, вероятно для внутренних нужд или тестирования).
    fio_staff: string; // Фамилия И. О. сотрудника.
}

// Интерфейс для статуса заявки.
export interface Status {
    id: number; // Уникальный идентификатор статуса.
    st: string; // Строковое представление статуса (например, 'new', 'in_progress', 'completed').
}

// Интерфейс для данных компании (клиента).
export interface Company {
    id: number; // Уникальный идентификатор компании.
    login_client: string; // Логин клиента.
    password_hash: string; // Хешированный пароль клиента.
    password_plain: string; // Пароль клиента (в открытом виде, вероятно для внутренних нужд или тестирования).
    phone_number_client: string; // Номер телефона клиента.
    company_name: string; // Название компании.
}

// Интерфейс для данных, необходимых при закрытии заявки.
interface CloseAppealData {
    fio_staff: string; // Фамилия И. О. сотрудника, закрывающего заявку.
    description: string; // Описание выполненных работ.
}

// Объект `appealApi` содержит методы для взаимодействия с API, связанными с заявками.
export const appealApi = {
    /**
     * Получает список всех новых заявок.
     * @returns Promise с массивом объектов `Appeal`.
     */
    getNewAppeals: async (): Promise<Appeal[]> => {
        const response = await api.get('/appeals/new');
        return response.data;
    },

    /**
     * Получает список заявок, находящихся в работе.
     * @returns Promise с массивом объектов `AppealInProgress`.
     */
    getAppealsInProgress: async (): Promise<AppealInProgress[]> => {
        const response = await api.get('/appeals/in-progress');
        return response.data;
    },

    /**
     * Получает список всех завершенных заявок.
     * @returns Promise с массивом объектов `AppealCompleted`.
     */
    getCompletedAppeals: async (): Promise<AppealCompleted[]> => {
        const response = await api.get('/appeals/completed');
        return response.data;
    },

    /**
     * Создает новую заявку.
     * @param data Объект с данными для создания заявки (механизм, проблема, кто сообщил).
     * @returns Promise с данными ответа от сервера.
     */
    createAppeal: async (data: CreateAppealData) => {
        const response = await api.post('/appeals', data);
        return response.data;
    },

    /**
     * Принимает заявку в работу.
     * @param appealId Идентификатор заявки, которую нужно принять.
     * @returns Promise с данными ответа от сервера.
     */
    takeAppeal: async (appealId: number) => {
        const response = await api.patch(`/appeals/${appealId}/take`);
        return response.data;
    },

    /**
     * Закрывает заявку.
     * @param appealId Идентификатор заявки, которую нужно закрыть.
     * @param data Объект с данными о закрытии (ФИО сотрудника, описание работ).
     * @returns Promise с данными ответа от сервера.
     */
    closeAppeal: async (appealId: number, data: CloseAppealData) => {
        const response = await api.patch(`/appeals/${appealId}/close`, data);
        return response.data;
    },

    /**
     * Отменяет заявку.
     * @param appealId Идентификатор заявки, которую нужно отменить.
     * @returns Promise с данными ответа от сервера.
     */
    cancelAppeal: async (appealId: number) => {
        const response = await api.patch(`/appeals/${appealId}/cancel`);
        return response.data;
    }
};
