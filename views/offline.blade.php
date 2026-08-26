<!doctype html>
<html lang="{{ $translator->getLocale() }}">

<head>
    <meta charset="utf-8">
    <title>{{ $translator->trans('fof-pwa.views.offline.header') }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <meta name="color-scheme" content="light dark">

    <style>
        :root {
            color-scheme: light dark;
            --bg-color: #fff;
            --text-color: #111;
            --muted-color: hsl(212.63157895,20%,50%);
        }

        @media (prefers-color-scheme: dark) {
            :root {
                --bg-color: #14191f;
                --text-color: #ddd;
                --muted-color: hsl(212.63157895,15%,50%);
            }
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 1rem;
            line-height: 1.5;
            background-color: var(--bg-color);
            color: var(--text-color);
            margin: 0;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 1.2rem;
        }

        .container {
            max-width: 55ch;
        }

        h1 {
            font-size: 1.25rem;
            font-weight: 600;
            margin: 0 0 8px;
        }

        p {
            margin: 0;
            color: var(--muted-color);
        }
    </style>
</head>

<body>
<main class="container">
    <h1>{{ $translator->trans('fof-pwa.views.offline.header') }}</h1>
    <p>{{ $translator->trans('fof-pwa.views.offline.text') }}</p>
</main>

<script>
    window.addEventListener('online', () => location.reload());
    setInterval(() => {
        if (navigator.onLine) {
            location.reload();
        }
    }, 3000);
</script>
</body>
</html>
