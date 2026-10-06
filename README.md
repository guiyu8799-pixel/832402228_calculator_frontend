# Calculator Frontend — 前后端分离计算器系统（前端 Web 客户端）

Web visualization client for the *First Assignment — Front-End and Back-End Separation Calculator
System*.

The front end owns **interaction and presentation only**. It never evaluates a mathematical
expression: it sends the expression to the backend over HTTP/JSON and renders the result, the
history and the error messages that come back.

---

## Table of contents

- [1. Introduction](#1-introduction)
- [2. Technology stack](#2-technology-stack)
- [3. Runtime environment](#3-runtime-environment)
- [4. Installation](#4-installation)
- [5. Startup](#5-startup)
- [6. Configuration](#6-configuration)
- [7. Connecting to the backend](#7-connecting-to-the-backend)
- [8. Feature overview](#8-feature-overview)
- [9. Project structure](#9-project-structure)
- [10. Front-end responsibilities](#10-front-end-responsibilities)
- [11. Deployment](#11-deployment)
- [12. Verifying front-end/back-end separation](#12-verifying-front-endback-end-separation)
- [13. Troubleshooting](#13-troubleshooting)

---

## 1. Introduction

A single-page calculator built with plain HTML, CSS and ES5-compatible JavaScript — no framework
and no build step, so the reviewer can read every line.

What it does:

1. provides a clickable keypad and a free-text expression input,
2. sends `POST /api/calculate` with the raw expression,
3. displays the result computed by the backend,
4. lists the calculation history read from `GET /api/history`,
5. deletes a single record through `DELETE /api/history/{id}`,
6. shows the error message returned by the backend for invalid input and division by zero.

## 2. Technology stack

| Layer | Technology | Why |
| --- | --- | --- |
| Markup | HTML5 | Semantic, accessible structure |
| Styling | CSS3 custom properties (variables) | Consistent colours without a preprocessor |
| Logic | Vanilla JavaScript (ES5 syntax) | No toolchain required; runs in any modern browser |
| HTTP | `fetch` API | Native, promise based |
| Dev server | `server.js` (Node.js, zero dependencies) | One-command startup for reviewers |

There is deliberately **no calculator library and no `eval`** in this project: the front end has no
arithmetic logic at all.

## 3. Runtime environment

| Requirement | Version |
| --- | --- |
| Browser | Chrome / Edge 90+, Firefox 88+, Safari 14+ |
| Node.js | 14 or newer — **optional**, only for the bundled static server |

Because the app is plain static files, any static web server works.

> `file://` will not work reliably: the browser blocks cross-origin `fetch` from a `file://` page.
> Always serve the files over HTTP.

## 4. Installation

```bash
git clone https://github.com/guiyu8799-pixel/832402228_calculator_frontend.git
cd 832402228_calculator_frontend
```

There are no dependencies to install.

## 5. Startup

```bash
# bundled server (recommended)
node server.js          # http://localhost:5510
node server.js 3000     # custom port

# or any other static server
python -m http.server 5510 --directory src
```

Then open **http://localhost:5510/** in a browser.

## 6. Configuration

The backend address is the `API_BASE_URL` constant at the top of `src/js/app.js`:

```javascript
var API_BASE_URL = 'http://localhost:8080';
```

Change it if the backend runs on another host or port.

## 7. Connecting to the backend

1. Start the backend (see its README) — by default `http://localhost:8080`.
2. Start this front end — by default `http://localhost:5510`.
3. Open the front end and calculate something.

### Endpoints used

| Method | Path | Triggered by |
| --- | --- | --- |
| `POST` | `/api/calculate` | `=` key, Enter, or the keypad |
| `GET` | `/api/history` | Page load, after a calculation, after a deletion |
| `DELETE` | `/api/history/{id}` | The 删除 button of a history row |

## 8. Feature overview

| Requirement | Where |
| --- | --- |
| Basic calculation `+ - * /` | Keypad and expression input |
| Compound expressions, precedence, parentheses, unary signs, decimals | Expression input |
| Result produced by the backend | `calculateOnServer()` — the response `result` is displayed verbatim |
| Error messages from the backend | Red line under the display, fed by the API error body |
| Calculation history from the database | History panel, re-queried after every change |
| Delete a specified record | 删除 button on each row |

Keyboard support is limited to what the assignment asks for: `Enter` calculates, `Esc` clears.

## 9. Project structure

```text
832402228_calculator_frontend/
├── src/
│   ├── index.html          # page structure: display, keypad, history panel
│   ├── css/
│   │   └── style.css       # layout and colours
│   └── js/
│       └── app.js          # HTTP calls, DOM, events, rendering
├── server.js               # zero-dependency static server for local review
├── README.md
└── codestyle.md
```

## 10. Front-end responsibilities

Kept on this side, exactly as the assignment describes:

- user interface presentation,
- calculator button interaction,
- expression input,
- sending calculation requests,
- displaying calculation results,
- displaying calculation history,
- sending history deletion requests,
- displaying error messages returned by the backend.

**Deliberately not on this side:** parsing, arithmetic, validation rules and persistence. The only
"logic" in `app.js` is text editing (append, backspace, clear) and rendering.

## 11. Deployment

### Static hosting (Netlify / Vercel / GitHub Pages / Nginx)

1. Upload the contents of `src/`.
2. Ensure the backend is reachable from the browser (an HTTPS front end requires an HTTPS backend,
   or the browser blocks the request as mixed content).
3. Set `API_BASE_URL` in `src/js/app.js` to the deployed backend address.
4. Configure the backend's allowed origins if it is not `*`.

### Quick local demonstration

```bash
# terminal 1 - backend
cd 832402228_calculator_backend && java -jar target/calculator-backend-1.0.0.jar

# terminal 2 - front end
cd 832402228_calculator_frontend && node server.js

# then open http://localhost:5510/
```

## 12. Verifying front-end/back-end separation

1. Open the front end and calculate something — the result appears and is stored in the database.
2. **Stop the backend.**
3. Keep using the front end: you can still type, use the keypad and clear the display.
4. Press `=`. The front end **cannot** produce a result. It shows the error returned by the failed
   request.

There is no arithmetic code in the client, so this behaviour is structural rather than a
convention.

## 13. Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| "无法连接后端服务" | Backend not running, wrong port, or wrong `API_BASE_URL`. Verify `curl http://localhost:8080/api/health`. |
| `Failed to fetch` / CORS error in the console | The backend's `app.cors.allowed-origins` does not include this origin. |
| Page loads but styles are missing | The files were copied without the `css/` and `js/` folders; keep the directory structure. |
| History is empty after a page reload | Verify the backend is running; history comes from the database, never from the browser. |
| Blank page opened via `file://` | Serve over HTTP, see [Runtime environment](#3-runtime-environment). |

---

## Code standard

See [`codestyle.md`](codestyle.md) — based on the
[Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html) and the
[Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).
