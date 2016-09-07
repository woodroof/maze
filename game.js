/* TODO:
 * - Выбор центральной точки
 * - Размещение оборудования
 * - Добавление связей
 * - Разметка зон (от оборудования)
 * - Зона неизвестного
 * - Зона устаревшего
 * - Зона видимого
 * - Перемещение
 * - Таймер на завершение
 * - Удаление связей
 * - Проверка связности, завершение по нахождению в отключенной подсети
 * - Игра инженера (своя зона видимого и устаревшего, восстановление связей)
 * - Рестарт игры
 * - Отображение сети как сети
 * Желательно:
 * - Настройка внешнего вида
 * Опционально:
 * - Сообщения о нахождении оборудования
 * - "Бонусы" (положительные и отрицательные)
 * - Дополнительные возможности (ping? traceroute?)
 */

var worker;

var hSize = 30;
var vSize = 30;
var cellSize = 15;
var logWidth = 350;

function log(text)
{
    var logField = document.getElementById('log');

    var entry = document.createElement('div');
    entry.className = 'log_entry';
    entry.textContent = text;
    logField.appendChild(entry);
}
function logReplace(text)
{
    document.getElementById('log').lastChild.textContent = text;
}

function showHackField(field)
{
    var mazeImage = document.getElementById('field');
    if (mazeImage)
    {
        mazeImage.innerHTML = '';
    }
    else
    {
        mazeImage = document.createElement('div');
        mazeImage.id = 'field';
        mazeImage.className = 'hack_field';
        mazeImage.style.width = field.hSize * cellSize + 'px';
        document.getElementById('field_zone').appendChild(mazeImage);
    }

    for (var i = 0; i < field.vSize; ++i)
    {
        var row = document.createElement('div');
        mazeImage.appendChild(row);

        for (var j = 0; j < field.hSize; ++j)
        {
            var cellData = field.cells[i][j];

            var cell = document.createElement('span');
            cell.className = 'field_cell';
            if (cellData.right)
            {
                cell.style.width = cellSize - 1 + 'px';
                cell.style.borderRightWidth = '1px';
            }
            else
            {
                cell.style.width = cellSize + 'px';
                cell.style.borderRightWidth = 0;
            }
            if (cellData.bottom)
            {
                cell.style.height = cellSize - 1 + 'px';
                cell.style.borderBottomWidth = '1px';
            }
            else
            {
                cell.style.height = cellSize + 'px';
                cell.style.borderBottomWidth = 0;
            }
            row.appendChild(cell);
        }
    }
}
function startHackGame()
{
    console.log('startHackGame');

    document.getElementById('action_zone').innerHTML = '';

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
    document.body.style.minWidth = logWidth + hSize * cellSize + 1;

    var logField = document.createElement('div');
    logField.id = 'log';
    logField.className = 'hack_log';
    logField.style.width = logWidth + 'px';

    document.body.appendChild(logField);

    var zone = document.createElement('div');
    zone.id = 'zone';
    zone.className = 'zone';

    var fieldZone = document.createElement('div');
    fieldZone.id = 'field_zone';
    fieldZone.style.height = vSize * cellSize + 1 + 'px';

    zone.appendChild(fieldZone);

    var actionZone = document.createElement('div');
    actionZone.id = 'action_zone';
    actionZone.className = 'action_zone';

    var hackButton = document.createElement('input');
    hackButton.className = 'hack_button';
    hackButton.onclick = function() { startHackGame(); };
    hackButton.type = 'button';
    hackButton.value = 'Взломать!';

    actionZone.appendChild(hackButton);

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
