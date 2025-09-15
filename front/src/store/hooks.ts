// Импорт типизированных хуков и типов из react-redux
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
// Импорт типов RootState и AppDispatch из файла хранилища
import type { RootState, AppDispatch } from './store';

// Создание и экспорт типизированной версии хука useDispatch
// AppDispatch обеспечивает типобезопасность для dispatch функции
export const useAppDispatch: () => AppDispatch = useDispatch;

// Создание и экспорт типизированной версии хука useSelector
// TypedUseSelectorHook<RootState> обеспечивает типобезопасность для селекторов
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/* ================= ПОЯСНЕНИЯ К КОММЕНТАРИЯМ =================

1. НАЗНАЧЕНИЕ МОДУЛЯ:
   - Модуль создает типизированные версии стандартных Redux хуков
   - Обеспечивает полную типобезопасность при работе с Redux в TypeScript
   - Устраняет необходимость постоянно указывать типы в каждом компоненте

2. ТИПИЗИРОВАННЫЕ ХУКИ:
   - useAppDispatch: Типизированная версия useDispatch с AppDispatch
   - useAppSelector: Типизированная версия useSelector с RootState

3. ПРЕИМУЩЕСТВА ТИПИЗАЦИИ:
   - Автодополнение в IDE для действий и состояния
   - Обнаружение ошибок на этапе компиляции
   - Лучшая поддерживаемость кода

4. AppDispatch:
   - Тип dispatch функции с учетом middleware и дополнительных возможностей
   - Гарантирует что dispatch принимает только валидные actions

5. RootState:
   - Тип всего состояния Redux хранилища
   - Обеспечивает доступ ко всем частям состояния с автодополнением

6. TypedUseSelectorHook:
   - Generic тип из react-redux для создания типизированного useSelector
   - Связывает селектор с конкретной структурой состояния

7. ЭКСПОРТЫ:
   - useAppDispatch заменяет стандартный useDispatch
   - useAppSelector заменяет стандартный useSelector
   - Используются во всех компонентах вместо стандартных хуков

8. СООТВЕТСТВИЕ BEST PRACTICES:
   - Рекомендуемый подход в документации Redux Toolkit
   - Упрощает миграцию при изменении структуры состояния
   - Обеспечивает консистентность по всему приложению
*/

// =============================================================================
// КОНЕЦ ФАЙЛА
// =============================================================================