# Отладка прогресса к Значку Рыболова

## Как проверить что работает

1. **Откройте консоль браузера** (F12 → Console)

2. **При загрузке игры** вы увидите:
   ```
   📂 Loading player data from storage: {coins: 0, rodLevel: 0, catchesWithoutBadge: 0, hasBadge: false}
   📊 Player data loaded: {coins: 0, rodLevel: 0, catchesWithoutBadge: 0, hasBadge: false}
   🎮 Game loop started
   🎲 Game state initialized
   ```

3. **При каждом переходе состояния**:
   ```
   🔄 State: idle → casting
   🔄 State: casting → flying
   🔄 State: flying → floating
   🔄 State: floating → bite
   🔄 State: bite → reeling
   🔄 State: reeling → caught
   ```

4. **При улове чего-либо**:
   ```
   🎣 Caught something! {item: {...}, weight: 1.2, timestamp: ...}
   📦 Item details: {id: "perch", name: "Окунь", isFish: true}
   ```

5. **При улове рыбы** вы увидите:
   ```
   🐟 Fish caught! Progress: 1/50
   💾 Saving player data: {coins: 5, rodLevel: 0, catchesWithoutBadge: 1, hasBadge: false}
   ```

4. **При получении значка**:
   ```
   🎖️ Fisherman badge caught! Resetting progress.
   💾 Saving player data: {coins: XXX, rodLevel: X, catchesWithoutBadge: 0, hasBadge: true}
   Fisherman badge achievement sent: {...}
   ```

## Проверка localStorage

Откройте консоль и выполните:
```javascript
JSON.parse(localStorage.getItem('fishing_player'))
```

Вы должны увидеть текущее состояние сохраненных данных.

## Что проверить если не работает

1. **Счетчик не увеличивается**:
   - Проверьте что ловите именно рыбу (isFish: true), а не мусор
   - Откройте консоль и проверьте логи "🐟 Fish caught!"
   - Проверьте что данные сохраняются (лог "💾 Saving player data")

2. **Прогресс не отображается**:
   - Проверьте что hasBadge = false
   - Проверьте что catchesWithoutBadge > 0

3. **Прогресс сбрасывается после перезагрузки**:
   - Проверьте localStorage командой выше
   - Убедитесь что localStorage не очищается (режим инкогнито?)
   - Проверьте логи загрузки "📂 Loading player data"

## Сброс прогресса

Если нужно сбросить прогресс для тестирования:
```javascript
localStorage.removeItem('fishing_player')
```

Затем перезагрузите страницу.
