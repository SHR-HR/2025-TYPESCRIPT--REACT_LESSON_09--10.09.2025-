// Импорт необходимых функций из Redux Toolkit
import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
// Импорт типа RootState из store
import type { RootState } from '@/store/store';

// =============================================================================
// ОПРЕДЕЛЕНИЕ ТИПОВ
// =============================================================================

/** Типы */
// Тип для статуса посещаемости
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'none';

// Тип для оценки студента
export type Mark = {
    id: string; // Уникальный идентификатор оценки
    date: string; // Дата в формате YYYY-MM-DD
    value: number; // Значение оценки от 2 до 12
    subject?: string; // Опциональное поле: предмет
    type?: 'class' | 'self' | 'exam' | 'topic'; // Опциональное поле: тип оценки
};

// Тип для студента
export type Student = {
    id: string; // Уникальный идентификатор студента
    name: string; // Имя студента
    group?: string; // Опциональное поле: группа
    marks: Mark[]; // Массив оценок
    attendance: Record<string, AttendanceStatus>; // Объект посещаемости по датам
};

// Тип для состояния студентов
export type StudentsState = {
    students: Student[]; // Массив студентов
    daysWindow: number; // Окно дней для статистики
};

// =============================================================================
// УТИЛИТЫ ДЛЯ РАБОТЫ С ДАТАМИ
// =============================================================================

/** Утилиты дат */
// Функция получения текущей даты
const today = () => new Date();
// Функция преобразования даты в строку формата ISO (YYYY-MM-DD)
const toISODate = (d = today()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Функция генерации массива дат за последние N дней
const rangeDays = (days: number) => {
    const out: string[] = []; // Массив для хранения дат
    const d = today(); // Текущая дата
    for (let i = 0; i < days; i++) {
        const dd = new Date(d); // Создаем копию даты
        dd.setDate(d.getDate() - i); // Вычитаем i дней
        out.push(toISODate(dd)); // Добавляем дату в массив [сегодня, вчера, ...]
    }
    return out; // Возвращаем массив дат
};

// Функция проверки вхождения даты в последние N дней
const isInLastNDays = (iso: string, days: number) => {
    const cut = new Date(); // Текущая дата
    cut.setHours(0, 0, 0, 0); // Обнуляем время для точного сравнения дат
    cut.setDate(cut.getDate() - (days - 1)); // Устанавливаем границу (days-1) дней назад
    const dt = new Date(iso + 'T00:00:00'); // Преобразуем строку в объект Date
    return dt >= cut; // Возвращаем true если дата входит в диапазон
};

// =============================================================================
// ГЕНЕРАЦИЯ ДЕМО-ДАННЫХ
// =============================================================================

/** Демоданные — 60 дней истории, реалистичные значения */
// Функция создания демо-студента
const demo = (name: string, group = 'JSE-242'): Student => {
    const id = nanoid(); // Генерация уникального ID
    const dates = rangeDays(60); // Генерация массива дат за 60 дней (включает «сегодня»)
    const todayISO = toISODate(); // Текущая дата в формате ISO

    // Посещаемость: прошлые дни заполняем статусами, «сегодня» оставляем пустым (none)
    const attendance: Record<string, AttendanceStatus> = {}; // Объект для хранения посещаемости
    dates.forEach((ds) => {
        if (ds === todayISO) return; // Сегодня не заполняем
        const r = Math.random(); // Случайное число от 0 до 1
        // Заполняем статусы на основе случайного числа
        attendance[ds] = r < 0.82 ? 'present' : r < 0.90 ? 'late' : 'absent';
    });
    attendance[todayISO] = 'none'; // «Сегодня» заполняем значением 'none'

    // Оценки: ~60% дней с одной оценкой
    const markPool = [2, 4, 6, 8, 8, 10, 10, 12, 6, 12]; // Пул возможных оценок
    const marks: Mark[] = []; // Массив для хранения оценок
    dates.forEach((ds, i) => {
        if (Math.random() < 0.6) { // 60% вероятность добавления оценки
            marks.push({
                id: nanoid(), // Генерация уникального ID оценки
                date: ds, // Дата оценки
                value: markPool[Math.floor(Math.random() * markPool.length)], // Случайная оценка из пула
                type: i % 11 === 0 ? 'exam' : 'class', // Каждая 11ая оценка - экзамен
            });
        }
    });

    return { id, name, group, marks, attendance }; // Возвращаем объект студента
};

// =============================================================================
// НАЧАЛЬНОЕ СОСТОЯНИЕ
// =============================================================================

// Начальное состояние с демо-данными
const initialState: StudentsState = {
    students: [ // Массив демо-студентов
        demo('Иван Иванов'),
        demo('Алексей Петров'),
        demo('Мария Сидорова'),
        demo('Анна Ковалёва'),
        demo('Дмитрий Орлов'),
        demo('Сергей Павлов'),
        demo('Екатерина Смирнова'),
        demo('Ольга Романова'),
    ],
    daysWindow: 30, // Окно по умолчанию: 30 дней
};

// =============================================================================
// СОЗДАНИЕ СЛАЙСА REDUX
// =============================================================================

/** Слайс */
const studentsSlice = createSlice({
    name: 'students', // Имя слайса
    initialState, // Начальное состояние
    reducers: { // Редукторы (редьюсеры) для действий
        // Добавление нового студента
        addStudent: {
            prepare(name: string, group?: string) { // Функция подготовки действия
                return { payload: { id: nanoid(), name, group } }; // Генерация payload с ID
            },
            reducer(state, { payload }: PayloadAction<{ id: string; name: string; group?: string }>) {
                state.students.unshift({ ...payload, marks: [], attendance: {} }); // Добавление студента в начало массива
            },
        },
        // Удаление студента
        removeStudent(state, { payload }: PayloadAction<string>) {
            state.students = state.students.filter(s => s.id !== payload); // Фильтрация массива студентов
        },
        // Переименование студента
        renameStudent(state, { payload }: PayloadAction<{ id: string; name: string }>) {
            const s = state.students.find(x => x.id === payload.id); // Поиск студента по ID
            if (s) s.name = payload.name; // Если найден - изменяем имя
        },

        /** Оценки */
        // Добавление оценки
        addMark: {
            prepare(studentId: string, value: number, date?: string, subject?: string, type?: Mark['type']) {
                return { payload: { studentId, mark: { id: nanoid(), value, date: date ?? toISODate(), subject, type } } };
            },
            reducer(state, { payload }: PayloadAction<{ studentId: string; mark: Mark }>) {
                const s = state.students.find(x => x.id === payload.studentId); // Поиск студента
                if (s) s.marks.unshift(payload.mark); // Добавление оценки в начало массива
            },
        },
        // Обновление оценки
        updateMark(state, { payload }: PayloadAction<{ studentId: string; markId: string; value: number }>) {
            const s = state.students.find(x => x.id === payload.studentId); // Поиск студента
            const m = s?.marks.find(mm => mm.id === payload.markId); // Поиск оценки
            if (m) m.value = payload.value; // Если найдена - обновляем значение
        },
        // Удаление оценки
        removeMark(state, { payload }: PayloadAction<{ studentId: string; markId: string }>) {
            const s = state.students.find(x => x.id === payload.studentId); // Поиск студента
            if (s) s.marks = s.marks.filter(m => m.id !== payload.markId); // Фильтрация оценок
        },

        /** Посещаемость */
        // Установка статуса посещаемости
        setAttendance(
            state,
            { payload }: PayloadAction<{ studentId: string; date?: string; status: AttendanceStatus }>
        ) {
            const s = state.students.find(x => x.id === payload.studentId); // Поиск студента
            if (!s) return; // Если не найден - выходим
            const key = payload.date ?? toISODate(); // Используем переданную дату или текущую
            s.attendance[key] = payload.status; // Устанавливаем статус
        },

        // Установка окна дней для статистики
        setDaysWindow(state, { payload }: PayloadAction<number>) {
            state.daysWindow = payload; // Обновляем значение окна
        },

        /** Для импорта CSV — атомарная замена среза */
        replaceAll(_state, { payload }: PayloadAction<StudentsState>) {
            return payload; // Полная замена состояния
        },
    },
});

// Экспорт действий (actions)
export const {
    addStudent, removeStudent, renameStudent,
    addMark, updateMark, removeMark,
    setAttendance, setDaysWindow, replaceAll,
} = studentsSlice.actions;

// =============================================================================
// СЕЛЕКТОРЫ И ФУНКЦИИ РАСЧЕТА МЕТРИК
// =============================================================================

/** Селекторы/метрики */
// Селектор для получения массива студентов
export const selectStudents = (s: RootState) => s.students.students;
// Селектор для получения окна дней
export const selectDaysWindow = (s: RootState) => s.students.daysWindow;

/** Средний балл за ВСЁ время */
export const calcAverage = (st: Student): number => {
    if (!st.marks.length) return 0; // Если нет оценок - возвращаем 0
    const sum = st.marks.reduce((a, m) => a + m.value, 0); // Сумма всех оценок
    return Math.round((sum / st.marks.length) * 10) / 10; // Среднее значение с округлением до 1 знака
};

/** Средний балл за окно N дней */
export const calcAverageWindowed = (st: Student, days = 30): number => {
    const filtered = st.marks.filter(m => isInLastNDays(m.date, days)); // Фильтрация оценок по дате
    if (!filtered.length) return 0; // Если нет оценок в периоде - возвращаем 0
    const sum = filtered.reduce((a, m) => a + m.value, 0); // Сумма оценок за период
    return Math.round((sum / filtered.length) * 10) / 10; // Среднее значение с округлением
};

/** Посещаемость за окно N дней */
export const calcAttendance = (st: Student, days = 30) => {
    const daysList = rangeDays(days); // Получаем массив дат за период
    let present = 0, absent = 0, late = 0; // Счетчики статусов
    for (const d of daysList) { // Перебираем все даты периода
        const s = st.attendance[d] ?? 'none'; // Получаем статус или 'none' по умолчанию
        if (s === 'present') present++; // Увеличиваем счетчик присутствия
        else if (s === 'absent') absent++; // Увеличиваем счетчик отсутствия
        else if (s === 'late') late++; // Увеличиваем счетчик опозданий
    }
    const total = present + absent + late || 1; // Общее количество дней с посещаемостью (минимум 1 чтобы избежать деления на 0)
    return { // Возвращаем объект с процентами
        presentPct: Math.round((present / total) * 100), // Процент присутствия
        absentPct: Math.round((absent / total) * 100), // Процент отсутствия
        latePct: Math.round((late / total) * 100), // Процент опозданий
    };
};

// Экспорт редьюсера по умолчанию
export default studentsSlice.reducer;

// =============================================================================
// ПОЯСНЕНИЯ К КОММЕНТАРИЯМ
// =============================================================================

/**
 * ПОЯСНЕНИЯ К КОММЕНТАРИЯМ:
 *
 * 1. СТРУКТУРА СЛАЙСА:
 *    - Слайс организован по принципам Redux Toolkit
 *    - Включает типы, начальное состояние, редьюсеры и селекторы
 *    - Используется createSlice для упрощения создания редьюсера
 *
 * 2. ТИПЫ ДАННЫХ:
 *    - AttendanceStatus: статусы посещаемости (присутствует, отсутствует, опоздал, нет данных)
 *    - Mark: структура оценки с датой, значением и дополнительными полями
 *    - Student: структура студента с оценками и посещаемостью
 *    - StudentsState: общее состояние модуля студентов
 *
 * 3. УТИЛИТЫ ДАТ:
 *    - today(): получение текущей даты
 *    - toISODate(): форматирование даты в ISO строку
 *    - rangeDays(): генерация массива дат за период
 *    - isInLastNDays(): проверка вхождения даты в период
 *
 * 4. ДЕМО-ДАННЫЕ:
 *    - Генерация реалистичных данных для 8 студентов
 *    - 60 дней истории с оценками и посещаемостью
 *    - Вероятностное распределение оценок и статусов
 *    - Сегодняшний день оставляется пустым для заполнения пользователем
 *
 * 5. РЕДЬЮСЕРЫ:
 *    - CRUD операции для студентов: добавление, удаление, переименование
 *    - CRUD операции для оценок: добавление, обновление, удаление
 *    - Управление посещаемостью: установка статуса
 *    - Управление настройками: изменение окна статистики
 *    - Полная замена состояния для импорта данных
 *
 * 6. СЕЛЕКТОРЫ И МЕТРИКИ:
 *    - Селекторы для доступа к данным из store
 *    - Функции расчета средней оценки за весь период
 *    - Функции расчета средней оценки за выбранный период
 *    - Функции расчета статистики посещаемости за период
 *    - Округление результатов до одного знака после запятой
 *
 * 7. ОПТИМИЗАЦИЯ:
 *    - Использование nanoid() для генерации уникальных ID
 *    - Иммутабельные обновления через Immer (встроен в Redux Toolkit)
 *    - Эффективные алгоритмы фильтрации и расчета
 *    - Подготовка действий (prepare) для сложных payload
 *
 * 8. ДЕЛОВАЯ ЛОГИКА:
 *    - Проверка вхождения дат в временные периоды
 *    - Расчет средних значений и процентов
 *    - Обработка крайних случаев (деление на ноль)
 *    - Форматирование данных для отображения
 *
 * 9. ИНТЕГРАЦИЯ:
 *    - Совместимость с TypeScript и строгая типизация
 *    - Экспорт всех необходимных функций и типов
 *    - Подготовка для использования в компонентах React
 *    - Поддержка импорта/экспорта данных
 */

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================




