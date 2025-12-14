import api from './apiConfig';

// Интерфейс для структуры данных "О программе", возвращаемых с сервера.
interface AboutInfo {
    TextInfo: string; // Текстовая информация о программе.
}

// Объект `infoApi` содержит методы для взаимодействия с API, связанными с информацией о программе.
export const infoApi = {
    /**
     * Получает информацию "О программе" с сервера.
     * @returns Promise со строкой, содержащей текстовую информацию.
     */
    getAboutInfo: async (): Promise<string> => {
        const response = await api.get<AboutInfo>('/info/about');
        return response.data.TextInfo; // Возвращаем только текстовую информацию.
    },

    /**
     * Обновляет информацию "О программе" на сервере.
     * @param text Строка с новой текстовой информацией для сохранения.
     * @returns Promise со строкой, содержащей обновленную текстовую информацию.
     */
    updateAboutInfo: async (text: string): Promise<string> => {
        // Отправляем PUT-запрос на эндпоинт `/info/about` с новым текстом.
        const response = await api.put<AboutInfo>('/info/about', { text });
        return response.data.TextInfo; // Возвращаем обновленную текстовую информацию.
    }
};
