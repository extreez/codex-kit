# Внешний стек видео-конвейера

Блоки `video-pipeline` и `video-watch` своего движка не несут. Они
оркестрируют чужие инструменты. Здесь список этих инструментов и как их
поставить.

Это репо-инструмент каталога: живёт в `apps/`, результат пишет в проект.
Ни в один стек не входит, ставится руками.

## Проверка

```bash
./check.sh
```

Ничего не ставит и не меняет. Говорит, что есть, чего нет и какой командой
это чинится.

Коды выхода: 0 всё на месте, 1 не хватает обязательного, 2 не хватает только
необязательного.

Проверка самого скрипта:

```bash
./check.sh --selftest
```

## Что из чего состоит

| Инструмент | Зачем | Лицензия |
|---|---|---|
| [HyperFrames](https://github.com/heygen-com/hyperframes) | композиция, моушн, переходы, аудио-микс, рендер | Apache 2.0 |
| [video-use](https://github.com/browser-use/video-use) | автовырез тишины и слов-паразитов, субтитры, цвет | MIT |
| [creative-skill](https://github.com/extreez/creative-skill) | бриф, смета, генерация, галерея | MIT |
| [gcv-kie-cli](https://github.com/extreez/gcv-kie-cli) | kie.ai с потолком трат и защитой от дублей | MIT |
| [claude-video](https://github.com/bradautomates/claude-video) | скачивание видео, кадры, транскрипция | MIT |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | распознавание речи локально | MIT |
| [MOSS-TTS-Nano](https://github.com/OpenMOSS/MOSS-TTS-Nano) | синтез речи на CPU, 20 языков, клон голоса | Apache 2.0 |
| [Blender MCP](https://projects.blender.org/lab/blender_mcp) | превиз камеры | Blender Foundation |

## Установка

### Базовое

```bash
winget install --id Gyan.FFmpeg -e
```

После установки перезапусти оболочку, иначе `ffmpeg` не найдётся в PATH.

Node 22 или новее и Python 3.10 или новее ставятся отдельно с сайтов
проектов. `uv` через `pip install uv`.

### HyperFrames

```bash
npx skills add heygen-com/hyperframes
```

Несёт свои 19 скиллов: роутер `/hyperframes` плюс воркфлоу
`/motion-graphics`, `/talking-head-recut`, `/embedded-captions`,
`/music-to-video`, `/slideshow` и доменные `/hyperframes-keyframes`,
`/hyperframes-audio`, `/hyperframes-animation`.

Мы их не дублируем. Блок `video-pipeline` вызывает эти скиллы, а не пишет
своё поверх.

### video-use

```bash
git clone https://github.com/browser-use/video-use
cd video-use && uv sync
```

Дальше symlink каталога в папку скиллов агента, как написано в его
`install.md`.

Ключ `ELEVENLABS_API_KEY` **не обязателен**. Скрипт
`blocks/video-pipeline/scripts/transcribe_local.py` кладёт транскрипт от
whisper.cpp в `<edit_dir>/transcripts/`, откуда его читает
`helpers/pack_transcripts.py`. Проверено сквозным прогоном без ключа.

Условие одно: не запускать `helpers/transcribe.py`. Он требует ключ
раньше, чем смотрит на свой же кеш, и падает даже при готовом файле.

Ключ нужен только ради разделения реплик по спикерам. whisper.cpp его не
даёт.

### whisper.cpp

Сборка с Vulkan существует, но лежит не в релизах `ggml-org/whisper.cpp`,
а в релизе `v1.4.0` репозитория `eviscerations/whisper-windows-mcp`. На
этой машине она проиграла: Intel Iris Xe дала 14-18 секунд после
прогрева и 3 минуты 20 секунд на первом прогоне, процессор с BLAS дал
4.2 секунды. Расшифровка вышла одинаковая. Поэтому берётся BLAS.

Скачать два файла.

Бинарники, 20 МБ:

```bash
curl -L -o whisper.zip https://github.com/ggml-org/whisper.cpp/releases/download/b4938/whisper-blas-bin-x64.zip
```

Модель, 141 МБ:

```bash
curl -L -o ggml-base.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.bin
```

Распаковать архив в `C:\whisper\`, положить модель в
`C:\whisper\models\`. Внутри архива каталог `Release/`, нужный файл
называется `whisper-cli.exe`.

Задать переменные:

```bash
setx WHISPER_CLI_PATH "C:\whisper\Release\whisper-cli.exe"
```

```bash
setx WHISPER_MODEL "C:\whisper\models\ggml-base.bin"
```

Какие вообще есть сборки под Windows:

| Архив | Размер | Кому |
|---|---|---|
| `whisper-blas-bin-x64.zip` | 20 МБ | процессор с BLAS, этот случай |
| `whisper-bin-x64.zip` | 8 МБ | процессор без BLAS, медленнее |
| `whisper-cublas-12.4.0-bin-x64.zip` | 640 МБ | только видеокарта NVIDIA |
| `whisper-vulkan-win-x64.zip` | 17 МБ | дискретная видеокарта, из релиза `whisper-windows-mcp` v1.4.0 |

Модели: `ggml-base.bin` 141 МБ, `ggml-small.bin` 465 МБ, `ggml-medium.bin`
1.4 ГБ. На этом процессоре `base` расшифровал 11 секунд речи за 3.7
секунды. `small` точнее и примерно втрое медленнее. `medium` и выше
брать незачем, ждать дольше, чем слушать.

Проверка после установки:

```bash
python blocks/video-pipeline/scripts/transcribe_local.py любой.mp4 --language ru
```

### creative-skill и gcv-kie-cli

Ставятся по инструкции своих репозиториев. Они закрывают весь платный
контур: бриф, план, смета, два подтверждения, генерация, галерея.

Блок `video-pipeline` платную генерацию сам не вызывает. Он передаёт
задание сюда.

### Blender MCP

Официальный от Blender Foundation. Нужен Blender 3.0 или новее, Python
3.10 или новее, `uv`.

Ставится только когда нужен превиз камеры. В большинстве роликов не нужен.

Предупреждение из их документации: сервер исполняет код от модели без
проверок.

### Русский голос: сначала попробуй встроенный в Windows

Ставить ничего не надо. В системе уже есть `Microsoft Irina Desktop`,
русский женский голос. Приёмочный ролик озвучен именно им.

```powershell
Add-Type -AssemblyName System.Speech
$s = New-Object System.Speech.Synthesis.SpeechSynthesizer
$s.SelectVoice('Microsoft Irina Desktop')
$s.Rate = 1
$s.SetOutputToWaveFile('vo/01.wav')
$s.Speak('текст реплики')
$s.Dispose()
```

Посмотреть, какие голоса есть:

```powershell
Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).GetInstalledVoices() | % { $_.VoiceInfo.Name + ' | ' + $_.VoiceInfo.Culture.Name }
```

Качество ниже нейросетевого: интонация ровная, ударения иногда мимо.
Для черновика и для проверки таймингов хватает с запасом. Для чистовой
озвучки бери MOSS-TTS-Nano или ElevenLabs.

`Rate` двигает темп от -10 до 10. На нуле речь заметно медленная,
единица ближе к живой.

### MOSS-TTS-Nano

Синтез речи локально, 0.1B параметров, идёт на CPU. Русский в списке
двадцати языков. Есть клонирование голоса по образцу.

Установка тяжелее, чем кажется: тянет conda, `pynini` и
`WeTextProcessing`, а `requirements.txt` тащит PyTorch даже под ONNX.
На Windows это не пятиминутное дело.

Ставить, когда встроенный голос перестал устраивать по качеству.

### HyperFrames TTS

`hyperframes tts` работает на Kokoro-82M. Русского в нём нет: только
`en-us`, `en-gb`, `es`, `fr-fr`, `hi`, `it`, `pt-br`, `ja`, `zh`.
Для англоязычного ролика это самый короткий путь.

## Ключи

| Ключ | Для чего | Обязателен |
|---|---|---|
| `KIE_API_KEY` | генерация кадров и шотов | да |
| `GEMINI_API_KEY` | анализ видео со звуком | нет, но без него `watch` слышать не умеет |
| `ELEVENLABS_API_KEY` | разделение реплик по спикерам | нет |

## Чего здесь нет

Генерации видео локально. На встроенной графике это невозможно, все шоты
идут через kie.ai и стоят денег.

Генератора звуковых эффектов. На kie.ai его нет, проверено: там только
синтез речи и изоляция голоса. Эффекты берутся из библиотеки, см.
`blocks/video-pipeline/references/sfx-library.md`.

Remotion. Он делает то же, что HyperFrames, и требует платную лицензию
компаниям от четырёх человек. Держать оба значит завести два моушн-движка.
См. `CONFLICTS.md`.

