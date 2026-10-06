# 前端代码规范 / Frontend Code Standard

> **规范来源 / Source of this standard**
>
> 本文件以前端技术栈（原生 HTML5 + CSS3 + JavaScript ES5）对应的主流规范为基础：
>
> 1. [Google JavaScript Style Guide](https://google.github.io/styleguide/jsguide.html)（主要依据）
> 2. [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)（变量、函数、相等判断、DOM 相关约定的补充）
> 3. [Google HTML/CSS Style Guide](https://google.github.io/styleguide/htmlcssguide.html)（HTML 与 CSS 部分）
> 4. [MDN Web Docs — Web 开发最佳实践](https://developer.mozilla.org/zh-CN/docs/Web)（浏览器兼容与可访问性）
>
> 若上述规范与本文件冲突，以本文件为准。

---

## 目录

- [1. 适用范围](#1-适用范围)
- [2. 文件组织](#2-文件组织)
- [3. 命名规范](#3-命名规范)
- [4. JavaScript 格式规范](#4-javascript-格式规范)
- [5. JavaScript 语言特性约定](#5-javascript-语言特性约定)
- [6. 注释规范](#6-注释规范)
- [7. DOM 操作规范](#7-dom-操作规范)
- [8. 网络请求规范](#8-网络请求规范)
- [9. HTML 规范](#9-html-规范)
- [10. CSS 规范](#10-css-规范)
- [11. 安全约束](#11-安全约束)
- [12. 兼容性与可访问性](#12-兼容性与可访问性)
- [13. 提交规范](#13-提交规范)
- [14. 自查清单](#14-自查清单)

---

## 1. 适用范围

适用于 `832402228_calculator_frontend` 仓库中的全部 HTML、CSS、JavaScript 源码与 `server.js`。

## 2. 文件组织

1. 页面文件统一放在 `src/` 下；样式放 `src/css/`；脚本放 `src/js/`。
2. 当前只有一个脚本文件 `src/js/app.js`，它按固定顺序组织内容：
   1. 后端地址常量
   2. DOM 引用（集中在一个 `dom` 对象中）
   3. HTTP 请求封装
   4. 显示与编辑
   5. 计算
   6. 历史渲染与删除
   7. 事件绑定与初始化
3. 脚本使用 IIFE（立即执行函数）包裹，避免污染全局命名空间；不向 `window` 暴露任何全局变量。
4. 页面通过 `<script src="...">` 引入脚本，**禁止**内联事件属性（如 `onclick="..."`）与内联脚本。
5. 后端地址只在一处定义（`app.js` 顶部的 `API_BASE_URL` 常量），禁止散落在各处。

## 3. 命名规范

| 类型 | 规则 | 示例 |
| --- | --- | --- |
| 文件 | 小写 | `app.js`、`style.css` |
| 变量 / 函数 | 小驼峰，动词或名词短语 | `currentExpression`、`renderHistory` |
| 常量 | 全大写 + 下划线 | `API_BASE_URL` |
| 布尔变量 | `is` / `has` / `can` 开头 | `isHidden` |
| 私有函数 | 不加下划线，靠 IIFE 作用域隐藏 | `applyResult` |
| CSS 类名 | BEM：`block__element--modifier` | `.display__result`、`.key--operator` |
| CSS 变量 | `--kebab-case` | `--primary`、`--key-hover` |
| DOM 元素的 id | 小写 + 连字符 | `expression-input`、`history-list` |

禁止：拼音命名、`a`/`b`/`temp` 之类的无意义名称、同一含义多个名称。

## 4. JavaScript 格式规范

1. **缩进 4 个空格**，禁止 Tab。
2. **行宽上限 110 字符**。
3. **语句必须以分号结尾**（Airbnb 与 Google 规范均要求）。
4. 字符串统一使用**单引号**；包含单引号时使用双引号或转义。
5. 使用 `===` / `!==`，禁止 `==` / `!=`。
6. 文件顶部使用 `'use strict';`。
7. 左花括号不换行；`else` 与右花括号同行。
8. 逗号置于行尾（不使用前置逗号）。
9. 对象字面量最后一个属性后不加逗号（兼容旧浏览器）。
10. 每个控制结构必须使用花括号。

```javascript
// 正确
function appendValue(value) {
    dom.expressionInput.value = currentExpression() + value;
    dom.expressionInput.focus();
    clearError();
}
```

## 5. JavaScript 语言特性约定

1. 使用 `var` 声明变量，保持全文件一致，并确保老浏览器兼容。
2. 优先使用 `forEach` / `map` 等数组方法遍历数组。
3. 禁止使用 `eval`、`new Function`、`setTimeout('string')` 等以字符串执行代码的接口。
4. 禁止修改内置对象原型（如 `Array.prototype`）。
5. 使用 `parseInt(value, 10)` 并显式给出进制。
6. 异步流程统一使用 `Promise`，禁止同步阻塞式请求。
7. 函数保持单一职责，单个函数不超过 60 行。

## 6. 注释规范

1. `app.js` 顶部必须有文件级注释，说明该文件的职责与边界（尤其要写明"前端不做计算"）。
2. 所有非显然的函数必须有注释，说明参数、返回值与设计原因。
3. 复杂逻辑（如删除后重新查询）必须说明**为什么**这样做。
4. 行内注释写在被说明代码的上一行，使用 `//`。
5. 禁止保留被注释掉的死代码。
6. 注释语言：代码注释使用英文，面向课程的说明写在 README。

```javascript
/**
 * Deletes one record through the backend API and then re-queries the history, so that the
 * displayed list always reflects the current state of the database.
 */
```

## 7. DOM 操作规范

1. 所有 DOM 引用集中在 `app.js` 顶部的 `dom` 对象中，禁止重复 `document.getElementById`。
2. 使用 `textContent` / `createTextNode` 写入文本，**禁止**用 `innerHTML` 拼接来自后端的数据（防 XSS）。
3. 动态列表使用 `document.createElement` 构建节点，不使用字符串拼接 HTML。
4. 事件绑定使用 `addEventListener`，不使用 `onclick` 属性。
5. 列表使用事件委托：在容器上绑定一个监听器，通过 `data-*` 属性区分目标。
6. DOM 查询必须在 `DOMContentLoaded` 之后进行。

```javascript
// 正确：安全地插入后端返回的表达式
expressionLine.appendChild(document.createTextNode(record.expression + ' = '));
```

## 8. 网络请求规范

1. 所有请求集中在 `app.js` 的 `request()` 函数中，业务代码不得直接调用 `fetch`。
2. 每个 API 方法必须返回 `Promise`，便于统一处理错误。
3. 非 2xx 响应必须转换为带 `errorCode` 的 `Error`，由调用方统一提示。
4. 网络层失败（后端未启动）也必须转换为可读的中文提示，而不是把浏览器的英文错误抛给用户。
5. 请求头显式声明 `Content-Type: application/json`；URL 参数使用 `encodeURIComponent`。
6. 前端**不得**实现任何数学计算逻辑，只能发送表达式并展示后端返回的结果。

## 9. HTML 规范

1. 使用 HTML5 文档类型 `<!DOCTYPE html>`，并声明 `lang` 与 `charset`。
2. 标签与属性名小写，属性值使用双引号。
3. 必须有 `<meta name="viewport">`，保证移动端可用。
4. 语义化标签：`header` / `main` / `section` / `h1` / `h2` / `ul` / `button`。
5. 所有输入控件必须有 `placeholder` 或 `<label>` 提供可访问名称。
6. 按钮必须显式声明 `type="button"`，避免意外提交表单。
7. 缩进 4 个空格。

## 10. CSS 规范

1. 类名使用 BEM 风格，禁止使用标签选择器做主要样式（`body`、`*` 除外）。
2. 颜色、间距、圆角、阴影统一使用 `:root` 中定义的 CSS 变量，便于整体调整。
3. 禁止使用 `!important`，唯一例外是工具类 `.is-hidden`。
4. 选择器嵌套层级不超过 2 层。
5. 属性按"定位 → 盒模型 → 排版 → 视觉 → 动画"顺序书写。
6. 使用 Flexbox / Grid 布局，不使用 `float` 布局。
7. 缩进 4 个空格，每个属性单独一行，以分号结尾。

```css
.history__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--bg);
}
```

## 11. 安全约束

1. 禁止 `eval` / `new Function` / `innerHTML` 承载用户或后端数据。
2. 所有后端数据通过 `textContent` / `createTextNode` 渲染。
3. 不使用来源不明的第三方脚本；本项目不引入任何外部 JS 依赖。
4. 不使用 `localStorage` 保存计算历史；历史只能来自后端数据库。
5. `server.js` 必须防止路径穿越：解析后的路径必须位于文档根目录之内。

## 12. 兼容性与可访问性

1. 使用 `fetch`、`Promise`、CSS 变量等现代特性，目标浏览器为 Chrome/Edge 90+、Firefox 88+、Safari 14+。
2. 支持 Enter 计算、Esc 清空。
3. 状态与错误提示使用文本表达，不只依赖颜色。
4. 保持合理的颜色对比度与明显的焦点样式（输入框有 `:focus` 轮廓）。
5. 页面在 860px 以下宽度自动切换为单列布局。

## 13. 提交规范

采用 [Conventional Commits](https://www.conventionalcommits.org/)：

```text
<type>(<scope>): <subject>

feat(api): wrap the backend REST API and normalise errors
fix(api): surface backend error message for division by zero
style(layout): simplify the keypad to the required operations
docs(readme): document deployment and configuration
```

`type` 取值：`feat` / `fix` / `refactor` / `test` / `docs` / `style` / `chore`。
一次提交只做一件事；提交信息使用英文，祈使句。

## 14. 自查清单

提交前逐项确认：

- [ ] 4 空格缩进，无 Tab；语句以分号结尾；使用单引号
- [ ] 使用 `===` / `!==`
- [ ] 无 `eval` / `new Function` / 字符串执行代码
- [ ] 无 `innerHTML` 渲染后端数据
- [ ] DOM 引用集中在 `dom` 对象，事件使用 `addEventListener`
- [ ] 所有请求集中在 `request()`
- [ ] **前端不含任何数学计算逻辑**
- [ ] 后端地址只在一处定义
- [ ] 未使用 `localStorage` 保存历史
- [ ] CSS 类名符合 BEM，颜色使用 CSS 变量
- [ ] 页面在窄屏下布局正常，键盘可操作
