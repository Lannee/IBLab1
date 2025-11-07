# Работа 1: Разработка защищенного REST API с интеграцией в CI/CD

## Описание
Сервис использующий REST API и реализованный на Node.js + Express с JWT-аутентификацией и SQLite3, предоставляющий возможность зарегистрированным пользователям получать доступ к постам, находящимся в базе данных.

## Эндпоинты

### Аутентификация

#### POST /auth/register
**Описание** Регистрация нового пользователя 
**Тело запроса**
```json
{
  "username": "string (мин. 3 символа, макс. 30 символов)",
  "password": "string (мин. 6 символов)"
}
```

**Коды ответов**
- `201` - Пользователь успешно создан
- `400` - Ошибка валидации
- `409` - Пользователь уже существует

**Пример успешного ответа**
```json
{
  "status": "success",
  "message": "User registered successfully"
}
```

**Использование**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"12345678"}'
```

#### POST /auth/login
**Описание** Вход в систему для получения JWT токена  
**Тело запроса**
```json
{
  "username": "string (мин. 3 символа, макс. 30 символов)",
  "password": "string (мин. 6 символов)"
}
```

**Коды ответов**
- `200` - Успешная аутентификация
- `400` - Ошибка валидации
- `401` - Пользователя не существует или неверный пароль


**Пример успешного ответа**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiZWdvciIsImlhdCI6MTc2MjQ2NTAyNiwiZXhwIjoxNzYyNDY4NjI2fQ.tmvjEwc1XPFLNCT_rfgq36fmm1i10RexSll8-ZkkjQs",
    "user": {
      "id": 1,
      "username": "egor"
    }
  }
}
```

**Использование**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"adminpass"}'
```

### Данные

#### POST /api/posts
**Описание** Создание нового поста (только авторезироваными пользователями)
**Тело запроса**
```json
{
  "title": "string (мин. 1 символ, макс. 255 символов)",
  "content": "string (мин. 1 символ)"
}
```
**Заголовки**
```text
Authorization: Bearer TOKEN
```

**Коды ответов**
- `201` - Пост успешно создан
- `400` - Ошибка валидации
- `401` - Отсутствует токен или пользователь не найден
- `403` - Невалидный или просроченный токен

**Пример успешного ответа**
```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": 6,
      "title": "title",
      "content": "content",
      "author": "egor"
    }
  }
}
```

**Использование**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"title","content":"content"}'
```

#### GET /api/data
**Описание** Получение списка всех постов, написанных пользователем
**Заголовки**
```text
Authorization: Bearer TOKEN
```  

**Коды ответов**
- `200` - Данные получены
- `401` - Отсутствует токен или пользователь не найден
- `403` - Невалидный или просроченный токен

**Пример успешного ответа**
```json
{
  "status": "success",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "post1 egor",
        "content": "Super content",
        "author": "egor"
      },
      {
        "id": 2,
        "title": "title",
        "content": "content",
        "author": "egor"
      }
    ],
    "user": {
      "id": 1,
      "username": "egor"
    }
  }
}
```

**Использование**
```bash
curl -X GET http://localhost:3000/api/data \
  -H "Authorization: Bearer TOKEN"
```

## Безопасность

### Методы защиты
- **JWT аутентификация**
- **Хеширование паролей bcrypt**
- **Санитизация ввода**

### Защита от XSS атак
Для экранирования HTML символов в пользовательском вводе используется `express-validator.escape()`. Введены ограничения на размер полей (1 символ ≤ title ≤ 255 символов, 1 символов ≤ body)

### Защита от SQL инъекций
Для защиты от SQL  инъекций используются параметризированные запросы с предварительным экранированием входных данных

### Защита от Broken Authentication
При успешно введенных данных ```jsonwebtoken``` генерирует JWT токен на определенных промежуток времени, наличие и валидность которого проверяется при каждом обращении к защищенным ендпоинтам. Пароли при хранении в базе данныз кешируются с использованием ```bcrypt.hash()```

### Отчеты SAST/SCA из раздела "Actions" 

Отчет **OWASP**:

![](img/OWASP.png)

Отчет **npm audit**:

![](img/audit.png)
