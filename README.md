# Учебный проект №9 — React + TypeScript + SCSS + CRUD + Router

Полнофункциональное мини-приложение с тремя модулями:

- **Posts** — CRUD по постам с поддержкой изображений (URL или загрузка файла).
- **Users** — список и карточки пользователей; создание доступно только **admin**.
- **Journal** — журнал оценок и посещаемости на **Redux Toolkit** (локальные демо-данные) с импортом/экспортом **CSV**.

Реализованы **светлая/тёмная темы**, аккуратные таблицы и доступные формы.

---

## 🚀 Стек технологий

- **Vite** + **React 18** + **TypeScript**
- **React Router** — маршрутизация
- **Redux Toolkit** — состояние журнала (оценки/посещаемость)
- **Axios** — HTTP-клиент
- **SCSS** — CSS-переменные, reset, модульные стили
- **vite-tsconfig-paths** — алиас `@` → `src/`
- Dev-прокси Vite на бэкенд (FastAPI, порт **8000**)

---

## ✨ Возможности

### Posts
- Создание, просмотр, редактирование и удаление постов.
- Изображения: по **URL** или **upload файла** (до 10 МБ), раздача из `/uploads`.
- Кнопка «**+1 к лимиту**» для подгрузки записей; обработка ошибок (fallback на мок-данные).
- Отдельная страница поста с превью.

### Users
- «Капсульная» таблица со скруглёнными строками и вертикальными отступами.
- Горизонтальный скролл на узких экранах (обёртка `.tableWrap`).
- Длинные значения (`email`, `phone`) обрезаются классом `.truncate` (плюс `title`).
- Карточка пользователя: редактирование и удаление.
- **Admin-guard**: создать пользователя может только администратор (`getRole()`).

### Journal (Redux Toolkit)
- Локальные демо-данные за **60 дней** (оценки + посещаемость).
- Метрики за окно **N** дней (по умолчанию 30): средний балл, % присутствий/опозданий/пропусков.
- Быстрые кнопки оценок (2/4/6/8/10/12) — добавляют **на сегодня**.
- Исправлено: «сегодня» изначально `none` и не перетирается случайной генерацией.
- Импорт/экспорт **CSV**.

### Тема и стили
- Переменные в `:root`, переключение темы через `data-theme="dark"` + `color-scheme`.
- Универсальные стили форм (`input/textarea/select`) + фикс автозаполнения.
- Кнопки `.btn` и таблицы `.table`/`.table.users` для единообразного UI.

---

## 🛠️ Установка и запуск

### 1) Клонирование и зависимости
```bash
git clone <repository-url>
cd <project-folder>
npm install
```

### 2) Переменные окружения
Создай **front/.env.local** (рядом с фронтендом):
```env
# Вариант A: dev через прокси Vite (рекомендуется)
VITE_API_URL=/api/posts

# Вариант B: без прокси (прямой URL)
# VITE_API_URL=http://localhost:8000/api/posts

# Необязательно, если бэкенд требует авторизацию
# VITE_API_USER=admin
# VITE_API_PASS=123
```

### 3) Конфигурация Vite (прокси и алиасы)
`front/vite.config.ts` (пример — уже настроено):
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  resolve: { alias: { '@': resolve(__dirname, './src') } },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api':     { target: 'http://localhost:8000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
  optimizeDeps: { exclude: ['lucide-react'] },
});
```

### 4) Бэкенд (FastAPI, порт 8000)
API должно поддерживать:
- `GET /api/posts?_limit=...&_start=...`
- `POST /api/posts`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`
- Раздачу статики из `/uploads`

Если не используешь прокси — включи **CORS** и укажи полный `VITE_API_URL`.

### 5) Запуск фронта
```bash
npm run dev
```
Открой **http://localhost:5173**.

---

## 📁 Структура (ключевые файлы)

```
src/
├─ store/
│  ├─ store.ts               # Redux store
│  └─ hooks.ts               # useAppDispatch/useAppSelector
├─ api/
│  └─ http.ts                # axios instance
├─ features/
│  ├─ posts/
│  │  ├─ PostsPage.tsx
│  │  ├─ PostItem.tsx
│  │  ├─ PostForm.tsx
│  │  └─ usePosts.ts         # загрузка/CRUD
│  ├─ users/
│  │  ├─ UsersListPage.tsx
│  │  ├─ UsersCreatePage.tsx
│  │  ├─ UserDetailPage.tsx
│  │  └─ usersSlice.ts       # CRUD пользователей на фронте
│  └─ journal/
│     ├─ JournalPage.tsx
│     └─ studentsSlice.ts    # демо-данные, метрики, CSV
├─ auth/
│  └─ role.ts                # getRole(): admin/teacher/student
├─ styles/
│  └─ base.scss              # переменные, reset, темы, таблицы, кнопки
├─ App.tsx                   # маршруты/лейаут
└─ main.tsx                  # вход приложения
```

---

## 🔧 Скрипты
```bash
npm run dev       # Dev-сервер Vite
npm run build     # Сборка production
npm run preview   # Локальный предпросмотр сборки
# (опционально) npm run lint / npm run format
```

---

## 🧭 Навигация

- `/` — главная (Posts)  
- `/users` — список пользователей  
- `/users/:id` — карточка пользователя  
- `/users/new` — создание пользователя (**admin**)  
- `/journal` — журнал (Redux демо-данные)  
- `/about`, `/contacts` — статические страницы (если добавлены)

---

## 🎨 UI/UX (детали)

- В `base.scss` настроены:
  - переменные темы и `color-scheme` для системных контролов,
  - единые стили `input/textarea/select` (включая тёмную тему и автозаполнение),
  - кнопки `.btn`,
  - таблицы `.table` и `.table.users` с «капсульными» строками.
- Для длинных значений в таблицах используй:
  ```jsx
  <span className="truncate" title={value}>{value}</span>
  ```
- Для адаптива оборачивай таблицу в контейнер с горизонтальным скроллом:
  ```html
  <div className="tableWrap">
    <table className="table users">…</table>
  </div>
  ```

---

## 🧩 Траблшутинг

- **API не отвечает** — проверь `VITE_API_URL` и прокси в `vite.config.ts`, убедись, что бэкенд запущен.
- **Картинки из файла не видны** — бэкенд должен раздавать `/uploads`, а путь к файлу приходить в ответе.
- **Чёрный текст в инпутах в тёмной теме** — в `base.scss` заданы явные `color`/`background` для `input/textarea/select`; проверь локальные переопределения модульных стилей.
- **Длинные email/телефон «ломают» ширину** — заверни значение в `.truncate` (см. выше).

---

Проект легко расширяется новыми фичами и маршрутами, сохраняя читаемую **feature-based** структуру и типобезопасность.







