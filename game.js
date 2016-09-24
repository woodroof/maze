/* TODO:
 * - Удаление связей (переразметка расстояния, определение отключённых зон, сохранение оригинальных связей)
 * - Проверка связности, завершение по нахождению в отключенной подсети
 * - Завершение взлома по истечении времени (в том числе проверка при начале другого действия)
 * - Зона неизвестного
 * - Зона устаревшего
 * - Зона видимого (до следующей развилки)
 * - Зона отключённого
 * - Игра инженера (своя зона видимого и устаревшего, восстановление связей)
 * - Рестарт игры
 * - Сохранение промежуточного состояния
 * - Реальное оборудование
 * - Заголовок страницы
 * - Связь с БД
 * Опционально:
 * - Help
 * - Сообщения о переходе в другой сектор
 * - Сообщения о нахождении оборудования
 * - Миниигры на удаление/восстановление связей
 * - Миниигры на взлом/починку
 * - "Бонусы" (положительные и отрицательные)
 */

var worker;
var gameTimerTimeout;
var actionTimerTimeout;

var hSize = 30;
var vSize = 30;
var cellSize = 15;
var equipmentCellSize = 11;
var playerPositionSize = 7;
var buttonHeight = 30;
var fieldZoneVSize = vSize * cellSize + 2;
var fieldZoneHSize = hSize * cellSize + 2;
var actionZoneHeight = buttonHeight * 3 + 30;
var timerWidth = 100;
var timerHeight = 35;
var logWidth = 500;

var singleLevelConnectionCount = 20;
var levelCount = 3;

function log(text)
{
    var logField = document.getElementById('log');

    var entry = document.createElement('div');
    entry.className = 'log_entry';
    entry.textContent = text;
    logField.insertBefore(entry, logField.firstChild);
}
function logReplace(text)
{
    document.getElementById('log').firstChild.textContent = text;
}

function getColor(name)
{
    switch (name)
    {
    case 'blue':
        return '#BAD3FF';
    case 'yellow':
        return '#FFFFA8';
    case 'grey':
        return '#C9C9C9';
    case 'red':
        return '#FFC9C9';
    case 'green':
        return '#C4FFC9';
    }

    // brown
    return '#E6CACA';
}
function getTitle(name)
{
    switch (name)
    {
    case 'blue':
        return 'Синий сектор';
    case 'yellow':
        return 'Жёлтый сектор';
    case 'grey':
        return 'Серый сектор';
    case 'red':
        return 'Красный сектор';
    case 'green':
        return 'Зелёный сектор';
    }

    // brown
    return 'Коричневый сектор';
}
function formatSecs(msecs)
{
    if (msecs <= 0)
    {
        return '0.0';
    }

    return ((msecs / 1000 | 0) % 60) + '.' + (msecs % 1000 / 100 | 0);
}
function updateActionTimerText(timer)
{
    timer.innerText = formatSecs(timer.endTime - new Date().getTime());
}
function updateActionTimer()
{
    var timer = document.getElementById('action_timer');
    if (timer !== null)
    {
        updateActionTimerText(timer);
        actionTimerTimeout = setTimeout(updateActionTimer, 100);
    }
}
function makeAction(action, description, duration)
{
    var actions = document.getElementById('actions');
    actions.innerHTML = '';

    var actionText = document.createElement('span');
    actionText.innerText = description + '... ';
    actionText.className = 'action_text';
    actions.appendChild(actionText);

    var actionTimer = document.createElement('span');
    actionTimer.id = 'action_timer';
    actionTimer.className = 'action_timer';
    actionTimer.endTime = new Date().getTime() + duration;
    actions.appendChild(actionTimer);

    updateActionTimer();

    var message = {};
    message.type = action;

    worker.postMessage(message);
}
function createMakeFunction(action, description, duration)
{
    return function() { makeAction(action, description, duration) };
}
function formatMins(msecs)
{
    if (msecs <= 0)
    {
        return '0:00';
    }

    var secs = ((msecs / 1000 | 0) % 60);
    var text = ((msecs / 60000) | 0) + ':';
    if (secs < 10)
    {
        text += '0';
    }
    text += secs;

    return text;
}
function updateGameTimerText(timer)
{
    timer.innerText = formatMins(timer.endTime - new Date().getTime());
}
function updateGameTimer()
{
    var timer = document.getElementById('game_timer');
    if (timer !== null)
    {
        updateGameTimerText(timer);
        gameTimerTimeout = setTimeout(updateGameTimer, 1000);
    }
}
function getLevel(priority)
{
    var level = levelCount - 1;
    while (priority < singleLevelConnectionCount * (levelCount - 1))
    {
        --level;
        priority += singleLevelConnectionCount;
    }
    return level;
}
function showHackField(field)
{
    window.clearTimeout(actionTimerTimeout);

    var actions = document.getElementById('actions');
    actions.innerHTML = '';
    for (var actionBlockIdx = 0; actionBlockIdx < field.actionBlocks.length; ++actionBlockIdx)
    {
        var actionBlock = field.actionBlocks[actionBlockIdx];

        var actionBlockElement = document.createElement('div');
        actionBlockElement.className = 'action_block' + actionBlockIdx;

        for (var actionLineIdx = 0; actionLineIdx < actionBlock.length; ++actionLineIdx)
        {
            var actionLine = actionBlock[actionLineIdx];

            var actionLineElement = document.createElement('div');
            actionLineElement.style.height = buttonHeight;
            actionLineElement.style.marginTop = '5px';

            for (var actionIdx = 0; actionIdx < actionLine.length; ++actionIdx)
            {
                var action = actionLine[actionIdx];

                var actionButton = document.createElement('div');
                actionButton.innerText = action.name;
                if (action.action === undefined)
                {
                    actionButton.className = 'disabled_button';
                }
                else
                {
                    actionButton.onclick = createMakeFunction(action.action, action.description, action.time);
                    actionButton.className = 'button';
                }
                actionButton.style.height = buttonHeight - 10 - 2 + 'px';
                actionButton.style.padding = '5px 0';
                actionLineElement.appendChild(actionButton);
            }

            actionBlockElement.appendChild(actionLineElement);
        }

        actions.appendChild(actionBlockElement);
    }

    var fieldImage = document.getElementById('field');
    if (fieldImage !== null)
    {
        fieldImage.innerHTML = '';
    }
    else
    {
        var fieldZone = document.getElementById('field_zone');
        fieldZone.innerHTML = '';

        fieldImage = document.createElement('div');
        fieldImage.id = 'field';
        fieldImage.className = 'field';
        fieldImage.style.width = field.hSize * cellSize + 'px';
        fieldZone.appendChild(fieldImage);
    }

    var timer = document.getElementById('game_timer');
    if (timer !== null)
    {
        updateGameTimerText(timer);
    }
    else
    {
        var timer_zone = document.createElement('div');
        timer_zone.className = 'game_timer_zone';
        timer_zone.style.width = timerWidth;
        timer_zone.style.height = timerHeight;
        timer_zone.style.padding = '2px';
        document.getElementById('field_zone').insertBefore(timer_zone, fieldImage);

        var timer_block = document.createElement('div');
        timer_block.className = 'game_timer_block';
        timer_block.style.padding = '5px';
        timer_block.style.borderWidth = '2px';
        timer_block.style.width = timerWidth - 10 - 4 + 'px';
        timer_block.style.height = timerHeight - 10 - 4 + 'px';
        timer_zone.appendChild(timer_block);

        timer = document.createElement('span');
        timer.id = 'game_timer';
        timer.endTime = field.gameEndTime;
        timer.className = 'game_timer';
        timer_block.appendChild(timer);

        updateGameTimer();
    }

    for (var i = 0; i < field.vSize; ++i)
    {
        var row = document.createElement('div');
        fieldImage.appendChild(row);

        for (var j = 0; j < field.hSize; ++j)
        {
            var cellData = field.cells[i][j];

            var cell = document.createElement('div');
            cell.className = 'field_cell';
            cell.style.width = cellSize + 'px';
            cell.style.height = cellSize + 'px';
            cell.style.backgroundColor = getColor(cellData.color);

            var title = document.createElement('div');
            title.className = 'zone_title';
            title.style.width = cellSize + 'px';
            title.style.height = cellSize + 'px';
            title.title = getTitle(cellData.color);
            cell.appendChild(title);

            if (!cellData.right)
            {
                var hPriority = cellData.priority;
                if (j !== field.hSize - 1 && field.cells[i][j + 1].priority > hPriority)
                {
                    hPriority = field.cells[i][j + 1].priority;
                }

                var hLevel = getLevel(hPriority);
                var height = hLevel < 2 ? 3 : 1;

                var hConnection = document.createElement('div');
                hConnection.className = 'connection' + hLevel;

                hConnection.style.width = cellSize + 1 + 'px';
                hConnection.style.marginLeft = cellSize / 2 | 0 + 'px';
                hConnection.style.height = height + 'px';
                hConnection.style.marginTop = (cellSize - height) / 2 | 0 + 'px';
                cell.appendChild(hConnection);
            }
            if (!cellData.bottom)
            {
                var vPriority = cellData.priority;
                if (i !== field.vSize - 1 && field.cells[i + 1][j].priority > vPriority)
                {
                    vPriority = field.cells[i + 1][j].priority;
                }

                var vLevel = getLevel(vPriority);
                var width = vLevel < 2 ? 3 : 1;

                var vConnection = document.createElement('div');
                vConnection.className = 'connection' + vLevel;

                vConnection.style.width = width + 'px';
                vConnection.style.marginLeft = (cellSize - width) / 2 | 0 + 'px';
                vConnection.style.height = cellSize + 1 + 'px';
                vConnection.style.marginTop = cellSize / 2 | 0 + 'px';
                cell.appendChild(vConnection);
            }
            if (cellData.equipment !== undefined)
            {
                var equipment = field.equipment[cellData.equipment];

                var equipmentPosition = document.createElement('div');
                if (cellData.equipment === 'c&c')
                {
                    equipmentPosition.className = 'cc';
                }
                else
                {
                    var className = 'equipment' + getLevel(cellData.priority);
                    if (equipment.status !== 'online')
                    {
                        className += '_offline';
                    }

                    equipmentPosition.className = className;
                }
                equipmentPosition.style.width = equipmentCellSize + 'px';
                equipmentPosition.style.height = equipmentCellSize + 'px';
                equipmentPosition.style.borderRadius = equipmentCellSize / 2 + 'px';
                equipmentPosition.style.marginLeft = (cellSize - equipmentCellSize) / 2 + 'px';
                equipmentPosition.style.marginTop = (cellSize - equipmentCellSize) / 2 + 'px';

                var name = equipment.name;
                if (equipment.status === 'broken')
                {
                    name += ' (сломано)';
                }

                equipmentPosition.title = name;

                cell.appendChild(equipmentPosition);
            }
            if (
                field.playerPosition.x === i &&
                field.playerPosition.y === j)
            {
                var playerPosition = document.createElement('div');
                playerPosition.className = 'player';
                playerPosition.style.width = playerPositionSize + 'px';
                playerPosition.style.height = playerPositionSize + 'px';
                playerPosition.style.borderRadius = playerPositionSize / 2 + 'px';
                playerPosition.style.marginLeft = (cellSize - playerPositionSize) / 2 + 'px';
                playerPosition.style.marginTop = (cellSize - playerPositionSize) / 2 + 'px';
                playerPosition.title = 'Ваше местоположение';

                cell.appendChild(playerPosition);
            }

            row.appendChild(cell);
        }
    }
}
function startHackGame()
{
    document.getElementById('actions').innerHTML = '';

    var message = {};
    message.type = 'generate_hack_field';
    message.params = {};
    message.params.hSize = hSize;
    message.params.vSize = vSize;

    worker.postMessage(message);
}
function showHackerGreeting()
{
    document.body.innerHTML = '';
    document.body.style.minWidth = logWidth + fieldZoneVSize + 2 * (timerWidth + 4);

    var logZone = document.createElement('div');
    logZone.className = 'log_zone';
    logZone.style.height = fieldZoneHSize + actionZoneHeight - 4 + 'px'
    logZone.style.padding = '2px';
    logZone.style.width = logWidth - 4 + 'px';

    var logField = document.createElement('div');
    logField.id = 'log';
    logField.style.borderWidth = '2px';
    logField.style.height = fieldZoneHSize + actionZoneHeight - 8 + 'px';
    logField.className = 'log';

    logZone.appendChild(logField);

    document.body.appendChild(logZone);

    var zone = document.createElement('div');
    zone.id = 'zone';
    zone.className = 'zone';

    var fieldZone = document.createElement('div');
    fieldZone.id = 'field_zone';
    fieldZone.style.height = fieldZoneHSize + 'px';

    var status = document.createElement('div');
    status.className = 'status';
    status.innerText = 'All systems online';
    status.style.marginRight = logWidth + 'px';
    fieldZone.appendChild(status);

    zone.appendChild(fieldZone);

    var actionZone = document.createElement('div');
    actionZone.className = 'action_zone';
    actionZone.style.marginRight = logWidth + 'px';
    actionZone.style.height = actionZoneHeight - 4 + 'px';
    actionZone.style.padding = '2px 0 2px 2px';

    var actionField = document.createElement('div');
    actionField.id = 'actions';
    actionField.className = 'actions';
    actionField.style.borderWidth = '2px';
    actionField.style.height = actionZoneHeight - 8 + 'px';

    var hackButton = document.createElement('div');
    hackButton.className = 'button';
    hackButton.style.height = buttonHeight - 10 - 2 + 'px';
    hackButton.style.padding = '5px';
    hackButton.style.margin = '5px';
    hackButton.onclick = function() { startHackGame(); };
    hackButton.innerText = 'Подключиться';

    actionField.appendChild(hackButton);
    actionZone.appendChild(actionField);

    zone.appendChild(actionZone);

    document.body.appendChild(zone);
}
function showEngeenerGreeting()
{
    document.body.innerHTML = '';
}

worker = new Worker("worker.js");
worker.onmessage =
    function(messageEvent)
    {
        var message = messageEvent.data;
        switch (message.type)
        {
        case 'log':
            log(message.data);
            break;
        case 'log_replace':
            logReplace(message.data);
            break;
        case 'show_hack_field':
            showHackField(message.data);
            break;
        }
    };
