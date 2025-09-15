// Импорт необходимых хуков и функций из React и Redux
import { useMemo, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
// Импорт действий и селекторов из слайса студентов
import {
    selectStudents, selectDaysWindow,
    addMark, setAttendance, setDaysWindow,
    calcAverageWindowed, calcAttendance, AttendanceStatus,
    replaceAll,
} from './studentsSlice';
// Импорт функций для работы с CSV
import { exportCSV, importCSV } from './csv';
// Импорт стилей из CSS модуля
import styles from './StudentsPage.module.scss';

// Константа с быстрыми оценками для быстрой установки
const QUICK_MARKS = [2, 4, 6, 8, 10, 12] as const;
// Объект с русскими labels для статусов посещаемости
const statusLabel: Record<AttendanceStatus, string> = {
    present: 'Присутствует',
    absent: 'Отсутствует',
    late: 'Опоздал',
    none: '—',
};

// Основной компонент страницы студентов
export default function StudentsPage() {
    // Хук для dispatch Redux actions
    const dispatch = useAppDispatch();
    // Получаем список студентов из Redux store
    const students = useAppSelector(selectStudents);
    // Получаем окно дней для статистики из Redux store
    const daysWindow = useAppSelector(selectDaysWindow);
    // Ref для скрытого input файла
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Мемоизированный расчет таблицы лидеров
    const leaderboard = useMemo(
        () => [...students] // Создаем копию массива студентов
            // Сортируем по убыванию средней оценки в выбранном окне
            .sort((a, b) => calcAverageWindowed(b, daysWindow) - calcAverageWindowed(a, daysWindow))
            // Берем топ-8 студентов
            .slice(0, 8),
        [students, daysWindow] // Зависимости: студенты и окно дней
    );

    // Возвращаем JSX разметку компонента
    return (
        <div className={styles.page}>
            {/* Карточка заголовка с управляющими элементами */}
            <div className={styles.headerCard}>
                <h1 className={styles.title}>Журнал: оценки и посещаемость</h1>
                <p className={styles.subtitle}>Redux Toolkit · локальные демо-данные с сохранением в localStorage</p>

                {/* Панель управления с выбором окна и кнопками импорта/экспорта */}
                <div className={styles.controls}>
                    <label className={styles.windowLabel}>
                        Окно статистики:
                        <select
                            className={styles.select}
                            value={daysWindow}
                            // Обработчик изменения окна статистики
                            onChange={(e) => dispatch(setDaysWindow(Number(e.target.value)))}
                        >
                            <option value={7}>7 дней</option>
                            <option value={14}>14 дней</option>
                            <option value={30}>30 дней</option>
                            <option value={60}>60 дней</option>
                        </select>
                    </label>

                    {/* Контейнер кнопок действий */}
                    <div className={styles.actions}>
                        {/* Кнопка экспорта в CSV */}
                        <button
                            type="button"
                            className={styles.toolBtn}
                            onClick={() => exportCSV({ students, daysWindow })}
                            title="Экспорт в CSV"
                        >
                            ⬇︎ Экспорт CSV
                        </button>

                        {/* Кнопка импорта из CSV (триггер скрытого input) */}
                        <button
                            type="button"
                            className={styles.toolBtn}
                            onClick={() => fileInputRef.current?.click()}
                            title="Импорт из CSV"
                        >
                            ⬆︎ Импорт CSV
                        </button>
                        {/* Скрытый input для выбора файла */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,text/csv" // Разрешаем только CSV файлы
                            style={{ display: 'none' }} // Скрываем визуально
                            // Обработчик выбора файла
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return; // Если файл не выбран - выходим
                                try {
                                    // Импортируем данные из CSV
                                    const newState = await importCSV(file);
                                    // Заменяем все данные в store
                                    dispatch(replaceAll(newState));
                                } finally {
                                    // Сбрасываем значение input
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Основная секция с сеткой layout */}
            <section className={styles.grid}>
                {/* Боковая панель с таблицей лидеров */}
                <aside className={styles.leaderboard}>
                    <h3>Таблица лидеров</h3>
                    <ol>
                        {/* Рендерим топ-8 студентов */}
                        {leaderboard.map((s, i) => (
                            <li key={s.id}>
                                <span className={styles.place}>{i + 1}</span>
                                <span className={styles.student}>{s.name}</span>
                                <span className={styles.score}>{calcAverageWindowed(s, daysWindow).toFixed(1)}</span>
                            </li>
                        ))}
                    </ol>
                </aside>

                {/* Основная карточка с таблицей студентов */}
                <div className={styles.card}>
                    <div className={styles.tableWrap}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Студент</th>
                                    <th>Средний балл (за {daysWindow} дн.)</th>
                                    <th>Посещаемость (за {daysWindow} дн.)</th>
                                    <th>Поставить оценку сегодня</th>
                                    <th>Статус сегодня</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Рендерим всех студентов в таблице */}
                                {students.map((s) => {
                                    // Рассчитываем статистику посещаемости для студента
                                    const att = calcAttendance(s, daysWindow);
                                    // Рассчитываем среднюю оценку для студента
                                    const avg = calcAverageWindowed(s, daysWindow);
                                    return (
                                        <tr key={s.id}>
                                            {/* Колонка с именем и группой студента */}
                                            <td className={styles.nameCol}>
                                                <div className={styles.name}>{s.name}</div>
                                                <div className={styles.group}>{s.group}</div>
                                            </td>

                                            {/* Колонка со средней оценкой */}
                                            <td>
                                                <strong className={styles.avg}>{avg.toFixed(1)}</strong>
                                            </td>

                                            {/* Колонка с статистикой посещаемости */}
                                            <td>
                                                <div className={styles.attRow}>
                                                    <span className={styles.attPresent}>✅ {att.presentPct}%</span>
                                                    <span className={styles.attLate}>⏱ {att.latePct}%</span>
                                                    <span className={styles.attAbsent}>🚫 {att.absentPct}%</span>
                                                </div>
                                            </td>

                                            {/* Колонка с кнопками быстрых оценок */}
                                            <td>
                                                <div className={styles.marksRow}>
                                                    {QUICK_MARKS.map(v => (
                                                        <button
                                                            key={v}
                                                            type="button"
                                                            className={styles.markBtn}
                                                            // Обработчик клика - добавление оценки
                                                            onClick={() => dispatch(addMark(s.id, v))}
                                                            title={`Оценка ${v} за сегодня`}
                                                        >
                                                            {v}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>

                                            {/* Колонка с выбором статуса посещения */}
                                            <td>
                                                <select
                                                    className={styles.select}
                                                    defaultValue="none"
                                                    // Обработчик изменения статуса
                                                    onChange={(e) =>
                                                        dispatch(setAttendance({ studentId: s.id, status: e.target.value as AttendanceStatus }))
                                                    }
                                                >
                                                    <option value="none">—</option>
                                                    <option value="present">{statusLabel.present}</option>
                                                    <option value="late">{statusLabel.late}</option>
                                                    <option value="absent">{statusLabel.absent}</option>
                                                </select>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Подсказка для пользователя */}
                    <p className={styles.hint}>
                        Нажимай на быстрые кнопки оценок — они добавляются «на сегодня». Статус посещения также
                        сохраняется на сегодняшнюю дату.
                    </p>
                </div>
            </section>
        </div>
    );
}

// =============================================================================
// ПОЯСНЕНИЯ К КОММЕНТАРИЯМ
// =============================================================================

/**
 * ПОЯСНЕНИЯ К КОММЕНТАРИЯМ:
 *
 * 1. СТРУКТУРА КОМПОНЕНТА:
 *    - Компонент разделен на логические секции: заголовок, таблица лидеров, основная таблица
 *    - Используется CSS Grid для layout основной сетки
 *    - Семантические HTML теги (section, aside) для улучшения доступности
 *
 * 2. REDUX ИНТЕГРАЦИЯ:
 *    - useAppDispatch для отправки actions
 *    - useAppSelector для получения данных из store
 *    - Селекторы для получения конкретных данных (students, daysWindow)
 *    - Actions для изменения состояния (addMark, setAttendance и др.)
 *
 * 3. РАБОТА С CSV:
 *    - Экспорт данных в CSV файл
 *    - Импорт данных из CSV файла
 *    - Скрытый input для выбора файла
 *    - Обработка ошибок импорта
 *
 * 4. ТАБЛИЦА ЛИДЕРОВ:
 *    - Мемоизированный расчет для оптимизации производительности
 *    - Сортировка студентов по средней оценке
 *    - Ограничение топ-8 студентов
 *    - Отображение места, имени и оценки
 *
 * 5. ОСНОВНАЯ ТАБЛИЦА:
 *    - Полный список всех студентов
 *    - Детальная статистика по каждому студенту
 *    - Интерактивные элементы для управления
 *    - Адаптивный дизайн с горизонтальным скроллом
 *
 * 6. ИНТЕРАКТИВНЫЕ ЭЛЕМЕНТЫ:
 *    - Быстрые кнопки оценок (2, 4, 6, 8, 10, 12)
 *    - Выпадающий список статусов посещения
 *    - Выбор окна статистики (7, 14, 30, 60 дней)
 *    - Кнопки импорта/экспорта CSV
 *
 * 7. СТАТИСТИКА И РАСЧЕТЫ:
 *    - Средняя оценка за выбранный период
 *    - Процентное соотношение посещаемости
 *    - Автоматический пересчет при изменении данных
 *    - Форматирование чисел (toFixed)
 *
 * 8. ОПТИМИЗАЦИЯ:
 *    - useMemo для мемоизации таблицы лидеров
 *    - useRef для доступа к DOM элементам
 *    - useCallback для обработчиков (не показано, но рекомендуется)
 *    - Эффективное обновление только измененных данных
 *
 * 9. ДОСТУПНОСТЬ:
 *    - Семантическая HTML разметка
 *    - Title attributes для кнопок
 *    - Правильные labels для форм
 *    - Клавиатурная навигация
 *
 * 10. ПОЛЬЗОВАТЕЛЬСКИЙ ОПЫТ:
 *     - Подсказки и пояснения
 *     - Визуальная обратная связь
 *     - Быстрые действия (quick actions)
 *     - Адаптивный интерфейс
 */

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================

