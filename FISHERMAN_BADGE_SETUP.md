# Настройка Fisherman Badge API

## Описание
Когда игрок ловит легендарный предмет "Значок рыболова" (`fisherman_badge`), автоматически отправляется уведомление на внешний API.

## Настройка

### 1. Настройка переменных окружения

Создайте файл `.env.local` в корне проекта (если его нет) и добавьте:

```env
FISHERMAN_BADGE_TOKEN=ваш_секретный_токен
```

### 2. Настройка URL API

Откройте файл `src/app/api/fisherman-badge/route.ts` и измените URL на строке 16:

```typescript
const response = await fetch(
    'https://ваш-домен.com/api/v1/users/@me/fisherman-badge',
    // ...
```

### 3. Формат запроса

API endpoint отправляет POST запрос с:

**Headers:**
- `Authorization: Bearer {token}`
- `Content-Type: application/json`

**Body:**
```json
{
  "timestamp": 1234567890,
  "achievement": "fisherman_badge"
}
```

## Тестирование

Для тестирования можно вызвать endpoint вручную:

```bash
curl -X POST http://localhost:3000/api/fisherman-badge
```

## Безопасность

⚠️ **Важно:**
- Файл `.env.local` добавлен в `.gitignore` и не будет закоммичен
- Никогда не публикуйте токен в открытом доступе
- Используйте переменные окружения на сервере для production
