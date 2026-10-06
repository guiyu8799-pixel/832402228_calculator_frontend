/**
 * Calculator front end.
 *
 * Responsibilities kept on this side (exactly what the assignment assigns to the client):
 *   - user interface presentation and keypad interaction
 *   - expression input
 *   - sending calculation requests to the backend
 *   - displaying the result returned by the backend
 *   - displaying the calculation history returned by the backend
 *   - sending delete requests for a specified history record
 *   - displaying the error messages returned by the backend
 *
 * The front end never evaluates an expression itself and contains no arithmetic logic: it only
 * displays what the API returns.
 */
(function () {
    'use strict';

    // The backend address; change it here if the service runs on another host or port.
    var API_BASE_URL = 'http://localhost:8080';

    var dom = {
        expressionInput: document.getElementById('expression-input'),
        resultValue: document.getElementById('result-value'),
        errorLine: document.getElementById('expression-error'),
        keypad: document.querySelector('.keypad'),
        historyList: document.getElementById('history-list'),
        historySummary: document.getElementById('history-summary')
    };

    /* ------------------------------------------------------------------ HTTP */

    /**
     * Sends a request to the backend.
     *
     * Resolves with the parsed JSON body, or rejects with an Error carrying the message and the
     * errorCode produced by the backend.
     */
    function request(path, options) {
        return fetch(API_BASE_URL + path, options).then(function (response) {
            return response.text().then(function (text) {
                var body = null;
                try {
                    body = text ? JSON.parse(text) : null;
                } catch (error) {
                    body = null;
                }
                if (!response.ok) {
                    var apiError = new Error(
                        (body && body.message) || ('请求失败：HTTP ' + response.status));
                    apiError.errorCode = body && body.errorCode;
                    throw apiError;
                }
                return body;
            });
        }, function () {
            // Network level failure: the backend is not reachable.
            throw new Error('无法连接后端服务，请确认后端已启动（' + API_BASE_URL + '）');
        });
    }

    function calculateOnServer(expression) {
        return request('/api/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ expression: expression })
        });
    }

    function fetchHistory() {
        return request('/api/history', { method: 'GET' });
    }

    function deleteHistory(id) {
        return request('/api/history/' + encodeURIComponent(id), { method: 'DELETE' });
    }

    /* ------------------------------------------------------------------ display */

    function setResult(value) {
        dom.resultValue.textContent = value;
    }

    function showError(message) {
        dom.errorLine.textContent = message;
        dom.errorLine.classList.remove('is-hidden');
    }

    function clearError() {
        dom.errorLine.textContent = '';
        dom.errorLine.classList.add('is-hidden');
    }

    /* ------------------------------------------------------------------ editing */

    function currentExpression() {
        return dom.expressionInput.value;
    }

    function appendValue(value) {
        dom.expressionInput.value = currentExpression() + value;
        dom.expressionInput.focus();
        clearError();
    }

    function backspace() {
        dom.expressionInput.value = currentExpression().slice(0, -1);
        dom.expressionInput.focus();
        clearError();
    }

    function clearExpression() {
        dom.expressionInput.value = '';
        setResult('0');
        clearError();
        dom.expressionInput.focus();
    }

    /* ------------------------------------------------------------------ calculation */

    function calculate() {
        var expression = currentExpression();
        if (!expression.trim()) {
            showError('请输入要计算的表达式');
            return;
        }
        clearError();
        setResult('…');
        calculateOnServer(expression).then(function (response) {
            setResult(String(response.result));
            loadHistory();
        }).catch(function (error) {
            setResult('0');
            showError(error.message);
        });
    }

    /* ------------------------------------------------------------------ history */

    function createHistoryItem(record) {
        var item = document.createElement('li');
        item.className = 'history__item';

        var body = document.createElement('div');
        body.className = 'history__item-body';

        var expressionLine = document.createElement('div');
        expressionLine.className = 'history__item-expression';
        expressionLine.appendChild(document.createTextNode(record.expression + ' = '));
        var resultSpan = document.createElement('span');
        resultSpan.className = 'history__item-result';
        resultSpan.textContent = String(record.result);
        expressionLine.appendChild(resultSpan);

        var timeLine = document.createElement('div');
        timeLine.className = 'history__item-time';
        timeLine.textContent = record.createdAt || '';

        body.appendChild(expressionLine);
        body.appendChild(timeLine);

        var deleteButton = document.createElement('button');
        deleteButton.type = 'button';
        deleteButton.className = 'btn--danger';
        deleteButton.textContent = '删除';
        deleteButton.addEventListener('click', function () {
            removeRecord(record.id);
        });

        item.appendChild(body);
        item.appendChild(deleteButton);
        return item;
    }

    function renderHistory(response) {
        dom.historyList.innerHTML = '';
        if (!response.data || response.data.length === 0) {
            var empty = document.createElement('li');
            empty.className = 'history__empty';
            empty.textContent = '暂无历史记录';
            dom.historyList.appendChild(empty);
        } else {
            response.data.forEach(function (record) {
                dom.historyList.appendChild(createHistoryItem(record));
            });
        }
        dom.historySummary.textContent = '共 ' + response.total + ' 条记录（来自后端数据库）';
    }

    function loadHistory() {
        dom.historySummary.textContent = '加载中…';
        return fetchHistory().then(function (response) {
            renderHistory(response);
        }).catch(function (error) {
            dom.historyList.innerHTML = '';
            var item = document.createElement('li');
            item.className = 'history__empty';
            item.textContent = '历史记录加载失败：' + error.message;
            dom.historyList.appendChild(item);
            dom.historySummary.textContent = '后端不可用';
        });
    }

    /**
     * Deletes one record through the backend API and then re-queries the history, so that the
     * displayed list always reflects the current state of the database.
     */
    function removeRecord(id) {
        if (!window.confirm('确定删除历史记录 #' + id + ' 吗？')) {
            return;
        }
        deleteHistory(id).then(function () {
            return loadHistory();
        }).catch(function (error) {
            showError(error.message);
        });
    }

    /* ------------------------------------------------------------------ events */

    function bindKeypad() {
        dom.keypad.addEventListener('click', function (event) {
            var key = event.target.closest('button');
            if (!key) {
                return;
            }
            var action = key.getAttribute('data-action');
            var value = key.getAttribute('data-value');
            if (action === 'clear') {
                clearExpression();
            } else if (action === 'backspace') {
                backspace();
            } else if (action === 'equals') {
                calculate();
            } else if (action === 'negate') {
                appendValue('-');
            } else if (value) {
                appendValue(value);
            }
        });
    }

    function bindKeyboard() {
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                calculate();
            } else if (event.key === 'Escape') {
                clearExpression();
            } else {
                return;
            }
            event.preventDefault();
        });
    }

    function init() {
        bindKeypad();
        bindKeyboard();
        dom.expressionInput.addEventListener('input', clearError);
        dom.expressionInput.focus();
        loadHistory();
    }

    document.addEventListener('DOMContentLoaded', init);
})();
