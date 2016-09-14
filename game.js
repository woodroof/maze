/* TODO:
 * - Перемещение
 * - Таймер на завершение
 * - Разметка расстояния от C&C и отображение связей разной толщины
 * - Удаление связей (переразметка расстояния, определение отключённых зон, сохранение оригинальных связей)
 * - Проверка связности, завершение по нахождению в отключенной подсети
 * - Зона неизвестного
 * - Зона устаревшего
 * - Зона видимого
 * - Зона отключённого
 * - Игра инженера (своя зона видимого и устаревшего, восстановление связей)
 * - Рестарт игры
 * - Сохранение промежуточного состояния
 * Опционально:
 * - Сообщения о нахождении оборудования
 * - "Бонусы" (положительные и отрицательные)
 * - "Честная" видимость
 * - Дополнительные возможности (ping? traceroute?)
 */

var worker;

var hSize = 30;
var vSize = 30;
var cellSize = 15;
var equipmentCellSize = 11;
var playerPositionSize = 7;
var buttonHeight = 50;
var fieldZoneSize = vSize * cellSize + 2;
var actionZoneHeight = buttonHeight * 2 + 5;
var logWidth = 500;

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
function showHackField(field)
{
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
                var hConnection = document.createElement('div');
                hConnection.className = 'connection';
                hConnection.style.width = cellSize + 1 + 'px';
                hConnection.style.marginLeft = cellSize / 2 | 0 + 'px';
                hConnection.style.height = '1px';
                hConnection.style.marginTop = cellSize / 2 | 0 + 'px';
                cell.appendChild(hConnection);
            }
            if (!cellData.bottom)
            {
                var vConnection = document.createElement('div');
                vConnection.className = 'connection';
                vConnection.style.width = '1px';
                vConnection.style.marginLeft = cellSize / 2 | 0 + 'px';
                vConnection.style.height = cellSize + 1 + 'px';
                vConnection.style.marginTop = cellSize / 2 | 0 + 'px';
                cell.appendChild(vConnection);
            }
            if (cellData.equipment !== undefined)
            {
                var equipmentPosition = document.createElement('div');
                if (cellData.equipment === 'c&c')
                {
                    equipmentPosition.className = 'cc';
                }
                else
                {
                    equipmentPosition.className = 'equipment';
                }
                equipmentPosition.style.width = equipmentCellSize + 'px';
                equipmentPosition.style.height = equipmentCellSize + 'px';
                equipmentPosition.style.borderRadius = equipmentCellSize / 2 + 'px';
                equipmentPosition.style.marginLeft = (cellSize - equipmentCellSize) / 2 + 'px';
                equipmentPosition.style.marginTop = (cellSize - equipmentCellSize) / 2 + 'px';
                equipmentPosition.title = field.equipment.find(function(equipment){ return equipment.id === cellData.equipment; }).name;

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
    document.body.style.minWidth = logWidth + hSize * cellSize + 2;

    var logZone = document.createElement('div');
    logZone.className = 'log_zone';
    logZone.style.height = fieldZoneSize + actionZoneHeight - 4 + 'px'
    logZone.style.padding = '2px';
    logZone.style.width = logWidth - 4 + 'px';

    var logField = document.createElement('div');
    logField.id = 'log';
    logField.style.borderWidth = '2px';
    logField.style.height = fieldZoneSize + actionZoneHeight - 8 + 'px';
    logField.className = 'log';

    logZone.appendChild(logField);

    document.body.appendChild(logZone);

    var zone = document.createElement('div');
    zone.id = 'zone';
    zone.className = 'zone';

    var fieldZone = document.createElement('div');
    fieldZone.id = 'field_zone';
    fieldZone.style.height = fieldZoneSize + 'px';

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
    hackButton.onclick = function() { startHackGame(); };
    hackButton.innerText = 'Сломать!';

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
