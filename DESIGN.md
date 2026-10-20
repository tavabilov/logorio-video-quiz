---
name: "Логорио — видео-квиз"
description: "Фирменное оформление по предоставленной концепции центра; демонстрационные видео и вопросы"
colors:
  paper: "#ffffff"
  white: "#fff"
  ink: "#29371e"
  muted: "#596547"
  green: "#29371e"
  sage: "#e9ecdc"
  line: "#d8dacb"
  brand-beige: "#d9c7b1"
  brand-olive: "#839072"
  brand-cream: "#f6f8e4"
  error: "#a7372c"
  green-hover: "#3a482c"
  soft-hover: "#dce3c6"
  neutral-note: "#f6f8ef"
  neutral-note-text: "#596547"
  preview: "#ebdbc6"
  preview-text: "#654b32"
  field-border: "#adb596"
  choice-border: "#cad1b6"
  choice-hover: "#f6f8ed"
  choice-selected: "#edf0e1"
  secondary-border: "#879474"
typography:
  display:
    fontFamily: "Shadow, Montserrat, Arial, sans-serif"
    fontSize: "clamp(34px, 4.2vw, 54px)"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: ".015em"
  headline:
    fontFamily: "Shadow, Montserrat, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.18
    letterSpacing: ".015em"
  title:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.18
    letterSpacing: "-.025em"
  body:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Montserrat, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
rounded:
  status: "6px"
  tag: "8px"
  control: "10px"
  video: "12px"
  surface: "16px"
spacing:
  compact: "8px"
  control-gap: "12px"
  section-small: "16px"
  field-gap: "20px"
  section: "24px"
  heading-gap: "32px"
  page: "48px"
  hero: "64px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.green-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  button-soft:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  input-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "13px 15px"
    width: "100%"
  step-active:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "12px 10px"
  status-chip:
    backgroundColor: "{colors.sage}"
    textColor: "{colors.green}"
    rounded: "{rounded.status}"
    padding: "5px 10px"
  media-surface:
    backgroundColor: "{colors.green}"
    textColor: "{colors.brand-cream}"
    rounded: "{rounded.surface}"
    padding: "28px"
  choice:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "13px 16px"
---

# Design System: Логорио — видео-квиз

## Overview

**Creative North Star: «Открытая семейная рабочая тетрадь».** Восемь видимых глав, спокойная область видео и место для наблюдений родителей. Читаемость вопросов и сохранность ответов определяют иерархию.

Визуальный источник — предоставленный пользователем PDF «Визуальная концепция ЛОГОРИО», страницы 1–3: оригинальный логотип, бежево-оливковая палитра, Shadow/Montserrat, клетчатые поверхности и иллюстрации. Бренд больше не является предварительным. Демонстрационными остаются видео и вопросы; для них сохраняется явная маркировка. Текущие реализованные значения зафиксированы по `public/styles.css` и `public/app.js`.

**Key Characteristics:** тёплая бумага; фирменные бежевый и оливковый; тёмный лесной акцент; округлые заголовки Shadow; клетчатая видеоповерхность; последовательные главы. Квиз и кабинет — Operate, стартовое приглашение — Persuade; режимы поверхности не создают отдельные бренды.

## Colors

Основные цвета источника: `brand-beige` и `brand-olive`. Дополнительные — тёмный `green` и светлый `brand-cream`. Для читаемости интерфейс использует тёмный лесной цвет для текста и действий, производные `paper` для фона, `muted` для пояснений, `sage` для выбранных состояний. Производные оттенки обозначают интерфейсную адаптацию, а не дополнительные цвета исходной концепции.

`white` — поля, `line` — разделители, `neutral-note` — подсказки и контактная форма. `preview`/`preview-text` обозначают предупреждение или предпросмотр; `error` — ошибки. Нормативные значения находятся в YAML. На тёмной клетчатой медиаповерхности используются ivory-текст и бежевая кнопка просмотра.

## Typography

Shadow Regular размещён локально в исходном авторском WOFF, без реконструкции из PDF. Совпадение исходного шрифта с пятью подмножествами PDF подтверждено по 104 появлениям символов: контуры и метрики совпадают. Лицензия авторского пакета сохранена рядом с шрифтом. Montserrat 400/500/600/700/800 размещён локально с OFL.

h1/h2: Shadow 400, uppercase, межбуквенный интервал .015em. Главный заголовок использует display из YAML; заголовок блока — 38px на широком экране и 29px на мобильном. Стартовый заголовок — 36px до 700px и 32px до 360px. Заголовок медиаповерхности Shadow 23px/1.25, на мобильном 21px и 20px, интервал .02em.

Основной текст Montserrat 400, 16px/1.65; вопросы и подписи 700. Это адаптация жирного образца Montserrat ExtraBold из концепции к длинным формам. h3 — Montserrat 700, 21px/1.18, −.025em. Вопросы 18px/1.5, на мобильном 17px. Поля и варианты 16px; placeholder использует muted. Цифры шагов и таблиц имеют табличную ширину.

## Layout

Контейнер `.shell` ограничен 1280px; боковые отступы 48px, до 1000px — 28px, до 700px — 20px, до 360px — 14px. Оригинальный логотип `/brand/logorio-identity.png` используется без изменения пикселей: CSS показывает верхний вариант через область 220×68px; до 700px — 180×56px, до 360px — 158×50px. Иллюстрация `/brand/learning-sticker.png` взята со страницы 3 PDF.

Старт: две колонки 1fr/1.05fr с промежутком 64px, на мобильном одна колонка.

Квиз: колонка глав 220px и основная область, промежуток 56px; до 1000px — 190px и 28px. До 700px главы становятся горизонтальной полосой, подписи скрываются, номера и доступные состояния сохраняются. Видео и подсказки — 1.3fr/.7fr, до 1000px подсказки размещаются перед видео. Варианты и контакты переходят с двух колонок на одну до 700px. Таблица кабинета прокручивается внутри своего контейнера.

Основные действия имеют высоту не меньше 48px; компактные кнопки — 44px. Нижняя навигация находится в потоке страницы и не перекрывает контент.

## Elevation & Depth

Система плоская: тональные поверхности и тонкие разделители создают группировку без декоративных теней. Единственная существующая тень — кольцо `0 0 0 3px var(--sage)` вокруг номера активной мобильной главы. Фокус обозначается контуром 3px `green` с отступом 4px; это состояние доступности, а не декоративная глубина.

## Shapes

Контролы и варианты — 10px; видео, подсказки и заметки — 12px; большие медиаповерхности и контакты — 16px. Теги 8px, статусы 6px. Номера глав и знак успеха круглые. Не распространять радиус 16px на все элементы: плоские разделители вопросов и вкладки кабинета сохраняют структуру тетради.

## Components

**Buttons:** зелёная основная, контурная secondary и светлая soft. Hover меняет фон; переход `.18s cubic-bezier(.2,.8,.2,1)`. Отключённые кнопки имеют opacity .5. Фокус виден на клавиатуре.

**Inputs / Choices:** белая поверхность, тонкая граница, высота поля от 48px и варианта от 52px. Выбранный вариант получает `choice-selected` и зелёную границу; ошибочное поле — `error`. Радио/чекбокс остаются нативными, с зелёным accent-color. «Другое» открывает отдельное поле.

**Navigation:** активная глава имеет зелёный номер на светлой поверхности; завершённая — отметку; будущая — disabled. Кабинет использует вкладки с нижней линией активного состояния.

**Tags / Cards:** статус и демонстрационная метка компактны; медиаповерхность поддерживает видео на фирменной тёмной сетке 48×48px: две linear-gradient с линиями #ffffff14. Оригинальная иллюстрация дополняет вводный блок; она не подтверждает медицинские результаты. Видео 16:9, нативные controls, playsinline; запуск со звуком инициирует пользователь. Подсказки и текст видео доступны через details.

**Feedback:** ошибки имеют текст и role=alert; сохранение и действия кабинета — текстовый статус. Успех отправки появляется только после подтверждения сервера. Предпросмотр прямо обозначает, что ответы не отправляются. Сохранение недоступно, offline и повторная отправка имеют отдельные сообщения.

## Do's and Don'ts

### Do

- Сохранять вопросы доступными рядом с видео или перед ним на мобильном.
- Использовать существующие зелёные состояния, видимый фокус и нативные поля.
- Проверять длинный текст, мобильные ширины и состояния ошибок.
- Отключать плавную прокрутку и переходы при prefers-reduced-motion.
- Сохранять явную метку демонстрационных видео и вопросов до их согласования.

### Don't

- Подменять предоставленные логотип, цвета, шрифты или иллюстрации выдуманной айдентикой.
- Подменять ответы декоративными карточками, рекламными результатами или диагнозом.
- Скрывать подсказки на мобильном, перекрывать их нижней панелью или требовать запоминания вопросов.
- Добавлять внешние видеоплатформы, автозапуск со звуком или новые анимационные зависимости.

## Мобильное прохождение и движение, 15 октября 2026

Режим Operate. Видео идёт перед свёрнутыми подсказками и вопросами. На телефоне закреплена нижняя панель: сначала переход к ответам, затем следующий блок, в конце отправка. Список глав раскрывается отдельным меню с названиями. На проверке длинный перечень ответов свёрнут, но доступен для чтения и исправления.

Дополнительные мини-персонажи помогают обозначить задачу; происхождение в ASSETS.md. Движение ограничено появлением и сменой состояния: два коротких жеста, переход главы 280 мс, подтверждение выбора 250 мс. Анимации персонажей запускаются только в видимой области и приостанавливаются в скрытой вкладке. prefers-reduced-motion отключает пространственное движение. Нижняя панель не помещается внутри трансформируемого предка, чтобы сохранять положение в окне; при уменьшении визуального окна из-за клавиатуры скрывается до закрытия клавиатуры. Шаги, вопросы, идентификаторы и формат отправки не меняются.

## Десктопная эргономика, 15 октября 2026

От 1100px рабочая область блока — две колонки: видео с компактными подсказками слева, реальные поля ответов справа. Видео закреплено в пределах общей рабочей области, с ограничением высоты и доступной прокруткой расшифровки. Главы занимают 180px и промежуток 32px. Для 701–1099px сохраняется последовательная компоновка.

На десктопе нижняя панель закреплена в ширину рабочей области, без перекрытия боковой навигации; зарезервированы нижний отступ и scroll-padding для фокуса. Корректировка 1001–1099px учитывает прежние sidebar220+gap56. В окнах высотой до800px шапка и приглашение компактнее, кнопка начала видна в1280×720.

Проверка и контакты от1100px идут рядом; раскрытие ответов не уводит контакты вниз. Поля контактов выровнены через gap. Текст подсказки не зависит от расположения. Мобильные действия и последовательность сохранены.

## Клиентская структура от16октября2026

Авторитетный DOCX с вариантами задаёт10блоков и77вопросов в фиксированном порядке. Текстовые поля дополняют радиокнопки: условные уточнения на светлой sage-поверхности, составные пары полей вдве колонки на десктопе и последовательно на телефоне. Условие меняет только соответствующие поля без перерисовки видео. Скрытые ответы очищаются. Навигация и закреплённое действие работают при14вопросах в одном блоке.

## Simplified parent journey, 20 October 2026

This supersedes the desktop layout dated 15 October. The quiz remains Operate; the opening offer is Persuade. The parent surface uses white paper with forest text and light olive #f6f8ef accents. Existing demo footage and its beige frames remain placeholders. Employee pages are outside this redesign.

One document scroll: a compact 188px chapter index and a single main sequence of video, readable notes and answer fields. No independently scrolling menu, transcript or question column. Only the video row sticks within the chapter. Review and contact fields follow vertically too. Mobile navigation folds into a named chapter menu; the video has a bounded height, and the primary action stays at the bottom. While the software keyboard is detected, the video returns to normal document flow and the dock hides.

Question lists and transcripts up to 600 characters open by default. Longer material uses native details with an explicit expand/collapse action. Actual answer fields stay expanded. Chapter labels are shortened only in navigation; the source headings and 77 questions remain intact.

The opening offer is the user's supplied 3,500 RUB crossed out and 999 RUB for a consultation/diagnostic meeting when the questionnaire is completed before the meeting. No expiry, checkout or additional conditions are invented. Each of the ten chapters has its own written cue and a distinct combination of existing boy/girl poses. Brief gestures repeat twice, then stop; reduced motion disables them. No speech synthesis or animation dependency is added. Main content no longer slides on chapter changes.

### Mobile text entry correction, 20 October 2026

The live keyboard audit reproduced sticky video covering a conditional textarea when both viewports resize together. Mobile editable focus now immediately returns video to document flow, without depending on a viewport-height heuristic. A compact Done action sits above the visible viewport bottom while ordinary chapter navigation is hidden. Done focuses the question legend or contact label; after keyboard closure the normal next action returns. Additional bottom space lets contact fields scroll above the toolbar even when only visualViewport shrinks. Resize and visible viewport scroll update the inset. This is verified with synthetic keyboard geometry in Chromium/WebKit; physical iOS/Android keyboards still require device validation. No questionnaire or receiver changes.
