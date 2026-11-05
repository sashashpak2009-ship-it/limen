# Limen

Лендинг Limen: HTML, CSS, JS и GSAP с CDN, без фреймворков и сборщиков. Собирать ничего не нужно.

Сайт: https://sashashpak2009-ship-it.github.io/limen/

## Деплой на GitHub Pages

1. Создайте на GitHub публичный репозиторий, например `limen`.
2. Загрузите в него содержимое этой папки: кнопка **Add file → Upload files** или через git:

   ```bash
   git init
   git add .
   git commit -m "Первая версия сайта"
   git branch -M main
   git remote add origin https://github.com/USERNAME/limen.git
   git push -u origin main
   ```

3. В репозитории откройте **Settings → Pages**. В **Source** выберите **Deploy from a branch**, ветку `main`, папку `/ (root)`, нажмите **Save**.
4. Через пару минут сайт откроется по адресу `https://USERNAME.github.io/limen/`.

Файл `.gitignore` не пустит в репозиторий служебные папки и черновики: `.claude/`, `storyboard/`, `prototype.html`, `og.html`.

## После первого деплоя: превью ссылки в Telegram

В `index.html` замените `USERNAME` в двух тегах `og:url` и `og:image` на свой логин на GitHub. Если репозиторий называется не `limen`, поправьте и его имя. Telegram принимает только полный адрес картинки.

Telegram запоминает превью. Чтобы обновить его, отправьте ссылку боту [@WebpageBot](https://t.me/WebpageBot).

## Логотип

Логотип собран из штрихов по картинке из макета: так буквы можно «писать» в анимации. Он лежит в `js/logo.js` (пути букв и анимация точки) и в `img/logo.svg`. В `index.html` он вставлен прямо в шапку и подвал. Если вы экспортируете точный SVG из макета и он будет отличаться, поправьте пути букв в этих местах.

Анимация сборки одна на весь сайт: точка падает, катится, пишет буквы и запрыгивает на «i». Она играет при первом заходе, в финале ролика и в подвале. Вступление показывается один раз за сессию браузера, клик его пропускает.

## Что где лежит

| Путь | Что это |
| --- | --- |
| `index.html` | страница и все тексты |
| `privacy.html` | политика обработки персональных данных |
| `css/site.css` | стили страницы |
| `css/film.css` | стили и цвета анимации |
| `js/logo.js` | логотип, его анимация и общая графика метки |
| `js/site.js` | вступление, первый экран, шапка, движение при прокрутке, лента меток |
| `js/film.js` | анимация раздела 02, тайминг в начале файла |
| `js/cutaway.js` | слои метки, раздел 03 |
| `js/form.js` | письмо с заявкой, раздел 06 |
| `video/` | видео: `-hd` для компьютера, `-sd` для телефона |
| `fonts/` | шрифт A Chaika Futuris, два начертания |

## Материалы

- **Шрифт.** A Chaika Futuris (ParaType). Лицензируется отдельно: для своих проектов получите лицензию у правообладателя. Без файлов в `fonts/` сайт работает на системном шрифте.
- **Видео.** Ролики взяты с [Pexels](https://www.pexels.com/license/) по лицензии Pexels.

| Файл | Ролик на Pexels |
| --- | --- |
| `video/shop-*` | [Рабочий в перчатках у конвейера](https://www.pexels.com/video/a-woman-in-blue-gloves-is-working-on-a-conveyor-belt-19905377/) |
| `video/road-*` | [Фура на сельской дороге, вид сверху](https://www.pexels.com/video/aerial-view-of-truck-on-rural-road-in-countryside-32449810/) |
| `video/door-*` | [Погрузка коробок в фургон](https://www.pexels.com/video/man-loading-boxes-into-van-5043428/) |
| `video/receive-*` | [Курьер с документами](https://www.pexels.com/video/a-courier-looking-at-papers-on-a-clipboard-6637313/) |
| `video/hero-*` | [Повар собирает салат](https://www.pexels.com/video/chef-preparing-fresh-salad-on-wooden-surface-39452896/) |
| `video/boxes-*` | [Работник на складе с коробками](https://www.pexels.com/video/man-working-on-a-warehouse-14910119/) |
| `video/salad-*` | [Нарезка салата](https://www.pexels.com/video/cutting-fresh-lettuce-7496055/) |
| `video/lunch-*` | [Ланч-бокс с сэндвичами](https://www.pexels.com/video/high-angle-shot-of-healthy-meal-5866264/) |
| `video/pack-*` | [Упаковка готовых обедов](https://www.pexels.com/video/rolling-shot-of-a-person-packing-food-6894099/) |
