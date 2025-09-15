// Импорт необходимых функций из Redux Toolkit
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// Импорт API клиента для HTTP запросов
import { apiClient } from '@/api/http';
// Импорт типов данных для постов
import type { Post, PostPayload } from '@/shared/types';

// Определение типа для статусов операций
type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

// Определение интерфейса состояния постов
interface PostsState {
    list: Post[]; // Массив всех постов
    byId: Record<string, Post | undefined>; // Объект для быстрого доступа к постам по ID
    status: Status; // Текущий статус операции
    error: string | null; // Сообщение об ошибке, если есть
    limit: number; // Лимит количества постов для загрузки
}

// Начальное состояние хранилища
const initialState: PostsState = {
    list: [], // Пустой массив постов
    byId: {}, // Пустой объект для хранения постов по ID
    status: 'idle', // Статус по умолчанию - бездействие
    error: null, // Ошибок нет
    limit: 3, // Лимит по умолчанию - 3 поста
};

// --- Thunks (асинхронные операции) ---

// Асинхронный thunk для загрузки списка постов
export const fetchPosts = createAsyncThunk<Post[], { limit: number }>(
    'posts/fetchList', // Уникальное имя действия
    async ({ limit }) => {
        // Выполнение GET запроса для получения постов
        const { data } = await apiClient.get<Post[]>('', {
            params: {
                _limit: limit, // Параметр лимита
                _start: 0 // Начальная позиция
            }
        });
        return data; // Возврат полученных данных
    }
);

// Асинхронный thunk для загрузки поста по ID
export const fetchPostById = createAsyncThunk<Post, string | number>(
    'posts/fetchById', // Уникальное имя действия
    async (id) => {
        // Выполнение GET запроса для получения конкретного поста
        const { data } = await apiClient.get<Post>(`/${id}`);
        return data; // Возврат полученных данных
    }
);

// Асинхронный thunk для создания нового поста
export const createPost = createAsyncThunk<Post, PostPayload>(
    'posts/create', // Уникальное имя действия
    async (payload) => {
        // Выполнение POST запроса для создания поста
        const { data } = await apiClient.post<Post>('', payload);
        return data; // Возврат созданного поста
    }
);

// Асинхронный thunk для обновления существующего поста
export const updatePost = createAsyncThunk<Post, { id: Post['id']; patch: Partial<PostPayload> }>(
    'posts/update', // Уникальное имя действия
    async ({ id, patch }) => {
        // Выполнение PUT запроса для обновления поста
        const { data } = await apiClient.put<Post>(`/${id}`, patch);
        return data; // Возврат обновленного поста
    }
);

// Асинхронный thunk для удаления поста
export const deletePost = createAsyncThunk<Post['id'], Post['id']>(
    'posts/delete', // Уникальное имя действия
    async (id) => {
        // Выполнение DELETE запроса для удаления поста
        await apiClient.delete<void>(`/${id}`);
        return id; // Возврат ID удаленного поста
    }
);

// --- Slice (редюсер и действия) ---
const postsSlice = createSlice({
    name: 'posts', // Имя slice
    initialState, // Начальное состояние
    reducers: {
        // Редюсер для установки лимита постов
        setLimit(state, action: PayloadAction<number>) {
            state.limit = action.payload; // Установка нового значения лимита
        },
    },
    // Обработчики для асинхронных действий
    extraReducers(builder) {
        builder
            // Обработчики для fetchPosts
            .addCase(fetchPosts.pending, (s) => {
                s.status = 'loading'; // Установка статуса "загрузка"
                s.error = null; // Сброс ошибки
            })
            .addCase(fetchPosts.fulfilled, (s, a) => {
                s.status = 'succeeded'; // Установка статуса "успешно"
                s.list = a.payload; // Обновление списка постов
                // Заполнение объекта byId для быстрого доступа
                for (const p of a.payload) s.byId[String(p.id)] = p;
            })
            .addCase(fetchPosts.rejected, (s, a) => {
                s.status = 'failed'; // Установка статуса "ошибка"
                s.error = a.error.message ?? 'Ошибка загрузки постов'; // Сохранение ошибки
            })

            // Обработчики для fetchPostById
            .addCase(fetchPostById.pending, (s) => {
                s.status = 'loading'; // Установка статуса "загрузка"
                s.error = null; // Сброс ошибки
            })
            .addCase(fetchPostById.fulfilled, (s, a) => {
                s.status = 'succeeded'; // Установка статуса "успешно"
                const p = a.payload; // Полученный пост
                s.byId[String(p.id)] = p; // Обновление в объекте byId
                // Поиск и обновление поста в списке
                const ix = s.list.findIndex(x => String(x.id) === String(p.id));
                if (ix >= 0) s.list[ix] = p; // Обновление если найден
            })
            .addCase(fetchPostById.rejected, (s, a) => {
                s.status = 'failed'; // Установка статуса "ошибка"
                s.error = a.error.message ?? 'Ошибка загрузки поста'; // Сохранение ошибки
            })

            // Обработчик успешного создания поста
            .addCase(createPost.fulfilled, (s, a) => {
                s.list.unshift(a.payload); // Добавление нового поста в начало списка
                s.byId[String(a.payload.id)] = a.payload; // Добавление в объект byId
            })

            // Обработчик успешного обновления поста
            .addCase(updatePost.fulfilled, (s, a) => {
                const p = a.payload; // Обновленный пост
                s.byId[String(p.id)] = p; // Обновление в объекте byId
                // Поиск и обновление поста в списке
                const ix = s.list.findIndex(x => String(x.id) === String(p.id));
                if (ix >= 0) s.list[ix] = p; // Обновление если найден
            })

            // Обработчик успешного удаления поста
            .addCase(deletePost.fulfilled, (s, a) => {
                const id = String(a.payload); // ID удаленного поста
                s.list = s.list.filter(p => String(p.id) !== id); // Удаление из списка
                delete s.byId[id]; // Удаление из объекта byId
            });
    },
});

// Экспорт действий
export const { setLimit } = postsSlice.actions;

// --- Selectors (селекторы для доступа к состоянию) ---

// Селектор для получения списка всех постов
export const selectPosts = (s: { posts: PostsState }) => s.posts.list;

// Селектор для получения текущего лимита
export const selectLimit = (s: { posts: PostsState }) => s.posts.limit;

// Селектор для получения текущего статуса
export const selectStatus = (s: { posts: PostsState }) => s.posts.status;

// Селектор для получения ошибки
export const selectError = (s: { posts: PostsState }) => s.posts.error;

// Селектор для получения поста по ID
export const selectPostById = (id: Post['id']) =>
    (s: { posts: PostsState }) => s.posts.byId[String(id)] ?? null;

// Экспорт редюсера по умолчанию
export default postsSlice.reducer;

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================

/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ ================= */

/*
1. Redux Toolkit:
   Библиотека для упрощенной работы с Redux. Предоставляет createSlice,
   createAsyncThunk и другие утилиты.

2. createAsyncThunk:
   Функция для создания асинхронных действий (thunks). Автоматически генерирует
   действия pending, fulfilled и rejected.

3. Параметры запросов:
   В fetchPosts используются параметры _limit и _start для пагинации и ограничения
   количества загружаемых постов.

4. Нормализация данных:
   Структура состояния включает как массив list, так и объект byId для быстрого
   доступа к постам по ID без поиска по массиву.

5. Статусы операций:
   Система статусов (idle, loading, succeeded, failed) позволяет отслеживать
   состояние асинхронных операций и показывать соответствующий UI.

6. Обработка ошибок:
   Все асинхронные thunks имеют обработчики rejected случаев с сохранением
   сообщения об ошибке в состоянии.

7. Иммутабельные обновления:
   Redux Toolkit использует Immer под капотом, что позволяет писать "мутирующий"
   код который на самом деле создает новые неизменяемые состояния.

8. Селекторы:
   Функции для извлечения конкретных данных из состояния. Позволяют абстрагировать
   структуру состояния от компонентов.

9. Типизация:
   Полная типизация на TypeScript обеспечивает безопасность типов и автодополнение
   в IDE.

10. Полезная нагрузка (Payload):
    Action creators принимают payload с данными для обновления состояния.

11. Строковые ключи:
    Использование String(id) обеспечивает consistent ключи в объекте byId, даже
    если ID могут быть числами или строками.

12. Операции CRUD:
    Реализованы все основные операции: Create, Read, Update, Delete.

13. Оптимизация производительности:
    Объект byId позволяет быстро находить посты по ID без перебора массива.

14. Обработка edge cases:
    Проверки на существование элементов в массиве перед обновлением или удалением.

15. Сообщения об ошибках по умолчанию:
    Использование оператора ?? для предоставления понятного сообщения об ошибке
    по умолчанию если сообщение от API отсутствует.

16. Структура состояния:
    Логическое разделение данных (list, byId) и мета-информации (status, error).

17. Масштабируемость:
    Архитектура позволяет легко добавлять новые асинхронные операции и поля состояния.

18. Переиспользование кода:
    Селекторы и actions могут быть использованы в multiple компонентах.

19. DevTools интеграция:
    Redux Toolkit автоматически настраивает интеграцию с Redux DevTools.

20. Middleware:
    Под капотом автоматически применяются необходимые middleware для работы thunks.
*/

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================


