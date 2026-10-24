NEURAL OS AI — Netlify + Hugging Face

Содержимое:
- index.html — интерфейс сайта, изменён для обращения к Netlify Function
- netlify/functions/chat.mjs — серверный посредник для Hugging Face

ВАЖНО:
1. Переменная HF_TOKEN должна быть сохранена в Netlify Project configuration → Environment variables.
2. Не публикуйте токен в HTML и не отправляйте его в чаты.
3. Для автоматического обнаружения Netlify Functions сайт нужно публиковать из проекта через поддерживаемый build/deploy flow. Просто перетащить один index.html недостаточно.
4. В корне проекта лежит папка netlify/functions/chat.mjs. Для CLI/Git deployment Netlify обнаруживает её по умолчанию.
5. После изменения environment variables нужно выполнить новое развертывание.
6. Hugging Face Inference Providers могут иметь ограничения/стоимость и модель может быть недоступна в конкретном аккаунте. Это не гарантирует бесплатное или безлимитное использование.

Начало работы:
- Распакуйте ZIP.
- Загрузите весь проект в Git-репозиторий и подключите его к Netlify, либо разверните через Netlify CLI.
- После deploy проверьте: https://ВАШ-САЙТ/.netlify/functions/chat
  GET должен вернуть JSON с ok: true.
