var hackTime = 10 * 60 * 1000;
var endHackTimeout;

var moveTime = 1000;
var breakTime = 30 * 1000;
var repairTime = 2 * breakTime;

var field;
var equipment = [
    {
        'id': 'c&c',
        'name': 'Командный центр',
        'color': 'blue'
    },
    {
        'id': 'reactor1',
        'name': 'Реактор 1',
        'color': 'yellow'
    },
    {
        'id': 'reactor2',
        'name': 'Реактор 2',
        'color': 'yellow'
    },
    {
        'id': 'spaceport',
        'name': 'Космопорт',
        'color': 'blue'
    },
    {
        'id': 'squadron1',
        'name': 'Эскадрилья 1',
        'color': 'blue'
    },
    {
        'id': 'squadron2',
        'name': 'Эскадрилья 2',
        'color': 'blue'
    },
    {
        'id': 'squadron3',
        'name': 'Эскадрилья 3',
        'color': 'blue'
    },
    {
        'id': 'squadron4',
        'name': 'Эскадрилья 4',
        'color': 'blue'
    },
    {
        'id': 'weapon1',
        'name': 'Орудие 1',
        'color': 'blue'
    },
    {
        'id': 'weapon2',
        'name': 'Орудие 2',
        'color': 'blue'
    },
    {
        'id': 'weapon3',
        'name': 'Орудие 3',
        'color': 'blue'
    },
    {
        'id': 'weapon4',
        'name': 'Орудие 4',
        'color': 'blue'
    },
    {
        'id': 'radar',
        'name': 'Радар',
        'color': 'blue'
    },
    {
        'id': 'observatory',
        'name': 'Система наблюдения',
        'color': 'blue'
    },
    {
        'id': 'transmitter1',
        'name': 'Тахионный передатчик 1',
        'color': 'blue'
    },
    {
        'id': 'transmitter2',
        'name': 'Тахионный передатчик 2',
        'color': 'blue'
    },
    {
        'id': 'shield1',
        'name': 'Генератор щита 1',
        'color': 'blue'
    },
    {
        'id': 'shield2',
        'name': 'Генератор щита 2',
        'color': 'blue'
    },
    {
        'id': 'beacon',
        'name': 'Гипермаяк',
        'color': 'blue'
    },
    {
        'id': 'close_range_weapon',
        'name': 'Орудия ближнего боя',
        'color': 'blue'
    },
    {
        'id': 'life_support',
        'name': 'Система жизнеобеспечения',
        'color': 'grey'
    },
    {
        'id': 'hyperdrive',
        'name': 'Гипердвигатель',
        'color': 'grey'
    },
    {
        'id': 'maneuvering_thrusters',
        'name': 'Маневровые двигатели',
        'color': 'grey'
    },
    {
        'id': 'drive1',
        'name': 'Двигатель 1',
        'color': 'grey'
    },
    {
        'id': 'drive2',
        'name': 'Двигатель 2',
        'color': 'grey'
    },
    // Всякое левое
    {
        'id': 'water storage',
        'name': 'Хранилище воды',
        'color': 'red'
    },
    {
        'id': 'restaurant',
        'name': 'Столовая',
        'color': 'green'
    },
    {
        'id': 'waste_recycling',
        'name': 'Системы переработки мусора',
        'color': 'brown'
    }
];

function log(text)
{
    var message = {};
    message.type = 'log';
    message.data = text;
    postMessage(message);
}
function logReplace(text)
{
    var message = {};
    message.type = 'log_replace';
    message.data = text;
    postMessage(message);
}

function randomIdx(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function lowerBound(sortedArray, value)
{
    var minIdx = 0;
    var maxIdx = sortedArray.length - 1;
    var currentIdx;

    while (minIdx <= maxIdx)
    {
        currentIdx = ((minIdx + maxIdx) / 2) | 0;
        var currentValue = sortedArray[currentIdx];
        if (currentValue < value)
        {
            minIdx = currentIdx + 1;
        }
        else if (currentValue > value)
        {
            maxIdx = currentIdx - 1;
        }
        else
        {
            return currentIdx;
        }
    }

    return minIdx;
}
function checkConnections(field)
{
    var marks = [];
    for (var i = 0; i < field.vSize; ++i)
    {
        marks.push([]);
        for (var j = 0; j < field.hSize; ++j)
        {
            marks[i].push(0);
        }
    }

    var markCount = 0;

    var hIndexes = [0];
    var vIndexes = [0];

    while (hIndexes.length)
    {
        var hIdx = hIndexes.pop();
        var vIdx = vIndexes.pop();

        if (!marks[hIdx][vIdx])
        {
            marks[hIdx][vIdx] = 1;
            ++markCount;

            // right
            if (!field.cells[hIdx][vIdx].right && marks[hIdx][vIdx + 1] === 0)
            {
                hIndexes.push(hIdx);
                vIndexes.push(vIdx + 1);
            }
            // down
            if (!field.cells[hIdx][vIdx].bottom && marks[hIdx + 1][vIdx] === 0)
            {
                hIndexes.push(hIdx + 1);
                vIndexes.push(vIdx);
            }
            // left
            if (vIdx !== 0 && !field.cells[hIdx][vIdx - 1].right && marks[hIdx][vIdx - 1] === 0)
            {
                hIndexes.push(hIdx);
                vIndexes.push(vIdx - 1);
            }
            // up
            if (hIdx !== 0 && !field.cells[hIdx - 1][vIdx].bottom && marks[hIdx - 1][vIdx] === 0)
            {
                hIndexes.push(hIdx - 1);
                vIndexes.push(vIdx);
            }
        }
    }

    return markCount === field.hSize * field.vSize;
}
function shuffle(array)
{
    var currentIdx = array.length;

    while (currentIdx)
    {
        --currentIdx;
        var idx = randomIdx(0, currentIdx);
        var tmp = array[currentIdx];
        array[currentIdx] = array[idx];
        array[idx] = tmp;
    }

    return array;
}
function setPercent(info, done = 0, total = 1)
{
    var percent = (done * 100 / total) | 0;
    if (info.reportedPercent === undefined || info.reportedPercent !== percent)
    {
        var logFunction = info.reportedPercent === undefined ? log : logReplace;
        if (percent === 100)
        {
            logFunction(info.message + '... готово!');
        }
        else
        {
            logFunction(info.message + '... ' + percent + '%');
        }
        info.reportedPercent = percent;
    }
}
function generateMazeWithoutLoops(hSize, vSize)
{
    var logInfo = { 'message': 'Изучаем топологию сети' };

    setPercent(logInfo);

    var maze = {};
    maze.hSize = hSize;
    maze.vSize = vSize;
    maze.cells = [];
    maze.borderCount = 0;

    // 2 * vSize * hSize borders: first vertical, first horizontal, second vertical...
    var allowedBorders = [];

    for (var i = 0; i < vSize; ++i)
    {
        maze.cells.push([]);

        for (var j = 0; j < hSize; ++j)
        {
            var newCell = {'right': false, 'bottom': false};

            if (j === hSize - 1)
            {
                newCell.right = true;
            }
            else
            {
                allowedBorders.push({'x': i, 'y': j, 'horizontal': true});
            }
            if (i === vSize - 1)
            {
                newCell.bottom = true;
            }
            else
            {
                allowedBorders.push({'x': i, 'y': j, 'horizontal': false});
            }
            maze.cells[i].push(newCell);
        }
    }

    allowedBorders = shuffle(allowedBorders);

    for (var allowedIdx = 0; allowedIdx < allowedBorders.length; ++allowedIdx)
    {
        var border = allowedBorders[allowedIdx];

        var cell = maze.cells[border.x][border.y];
        if (border.horizontal)
        {
            cell.right = true;
        }
        else
        {
            cell.bottom = true;
        }
        ++maze.borderCount;

        if (!checkConnections(maze))
        {
            if (border.horizontal)
            {
                cell.right = false;
            }
            else
            {
                cell.bottom = false;
            }
            --maze.borderCount;
        }

        setPercent(logInfo, allowedIdx + 1, allowedBorders.length);
    }

    setPercent(logInfo, 1, 1);

    return maze;
}
function addEquipment(field)
{
    var logInfo = { 'message': 'Находим подключенное оборудование' };

    setPercent(logInfo);

    field.equipment = {};

    for (var i = 0; i < equipment.length; ++i)
    {
        var pos = {};

        do
        {
            pos.x = randomIdx(0, field.vSize - 1);
            pos.y = randomIdx(0, field.hSize - 1);
        }
        while (field.cells[pos.x][pos.y].equipment);

        var cell = field.cells[pos.x][pos.y];
        cell.equipment = equipment[i].id;
        cell.color = equipment[i].color;

        field.equipment[equipment[i].id] = {'pos': pos, 'name': equipment[i].name, 'status': 'online'};

        if (equipment[i].id === 'c&c')
        {
            field.commandPosition = pos;
        }

        if (!i)
        {
            field.entry_point = pos;
        }

        setPercent(logInfo, i + 1, equipment.length);
    }

    setPercent(logInfo, 1, 1);
}
function removeBorders(field, ratio)
{
    var logInfo = { 'message': 'Исследуем вспомогательные подключения' };

    setPercent(logInfo);

    var bordersToRemove = field.borderCount * ratio | 0;
    if (bordersToRemove)
    {
        var borders = [];

        for (var i = 0; i < field.vSize; ++i)
        {
            for (var j = 0; j < field.hSize; ++j)
            {
                if (j != field.hSize - 1 && field.cells[i][j].right)
                {
                    borders.push({'x': i, 'y': j, 'horizontal': true});
                }
                if (i != field.vSize - 1 && field.cells[i][j].bottom)
                {
                    borders.push({'x': i, 'y': j, 'horizontal': false});
                }
            }
        }

        borders = shuffle(borders);

        for (var i = 0; i < bordersToRemove; ++i)
        {
            var border = borders[i];
            if (border.horizontal)
            {
                field.cells[border.x][border.y].right = false;
            }
            else
            {
                field.cells[border.x][border.y].bottom = false;
            }

            setPercent(logInfo, i + 1, bordersToRemove);
        }
    }

    setPercent(logInfo, 1, 1);

    field.borderCount -= bordersToRemove;
}
function push(cells, pos, queue, propertyName, valueFunction)
{
    var cell = cells[pos.x][pos.y];
    var value = valueFunction(cell);

    // right
    if (!cell.right)
    {
        queue.push({'x': pos.x, 'y': pos.y + 1});
        queue[queue.length - 1][propertyName] = value;
    }
    // down
    if (!cell.bottom)
    {
        queue.push({'x': pos.x + 1, 'y': pos.y});
        queue[queue.length - 1][propertyName] = value;
    }
    // left
    if (pos.y !== 0 && !cells[pos.x][pos.y - 1].right)
    {
        queue.push({'x': pos.x, 'y': pos.y - 1});
        queue[queue.length - 1][propertyName] = value;
    }
    // up
    if (pos.x !== 0 && !cells[pos.x - 1][pos.y].bottom)
    {
        queue.push({'x': pos.x - 1, 'y': pos.y});
        queue[queue.length - 1][propertyName] = value;
    }
}
function pushColor(cells, pos, queue)
{
    push(cells, pos, queue, 'color', function(cell){ return cell.color; });
}
function extendZones(field)
{
    var logInfo = { 'message': 'Определяем принадлежность узлов' };

    setPercent(logInfo);

    var done = 0;

    var queue = [];
    for (var nextEquipment in field.equipment)
    {
        ++done;
        pushColor(field.cells, field.equipment[nextEquipment].pos, queue);
    }

    while (queue.length)
    {
        var idx = randomIdx(0, queue.length - 1);
        var queueElem = queue[idx];
        queue.splice(idx, 1);

        var nextCell = field.cells[queueElem.x][queueElem.y];

        if (nextCell.color !== undefined)
        {
            continue;
        }

        nextCell.color = queueElem.color;

        ++done;
        pushColor(field.cells, queueElem, queue);

        setPercent(logInfo, done, field.vSize * field.hSize);
    }

    setPercent(logInfo, 1, 1);
}
function pushPriority(cells, pos, queue, priority)
{
    push(cells, pos, queue, 'priority', function(cell) { return priority; });
}
function determineNodePriorities(field)
{
    var logInfo = { 'message': 'Подсчитываем пропускную способность подключений' };

    setPercent(logInfo);

    var queue = [];
    pushPriority(field.cells, field.commandPosition, queue, 0);

    var done = 1;

    while (queue.length)
    {
        var queueElem = queue[0];
        queue.splice(0, 1);

        var nextCell = field.cells[queueElem.x][queueElem.y];

        if (nextCell.priority !== undefined)
        {
            continue;
        }

        nextCell.priority = queueElem.priority;

        ++done;
        pushPriority(field.cells, queueElem, queue, queueElem.priority + 1);

        setPercent(logInfo, done, field.vSize * field.hSize);
    }

    setPercent(logInfo, 1, 1);
}
function setHackerPosition(field)
{
    var logInfo = { 'message': 'Подключаемся к системе' };

    setPercent(logInfo, 1, 1);

    var x = randomIdx(0, field.vSize - 1);
    var y = randomIdx(0, field.hSize - 1);
    field.playerPosition = {'x': x, 'y': y};
}
function addCutActions(field)
{
    var actionLines = [];

    // TODO

    field.actionBlocks.push(actionLines);
}
function addConnectActions(field)
{
    var actionLines = [];

    // TODO

    field.actionBlocks.push(actionLines);
}
function addMoveHackerActions(field)
{
    var actionLines = [];
    var actionLine = [];
    if (field.playerPosition.x && !field.cells[field.playerPosition.x - 1][field.playerPosition.y].bottom)
    {
        actionLine.push({'name': 'Вверх', 'action': 'move_hacker_up', 'time': moveTime, 'description': 'Перемещаемся вверх'});
    }
    else
    {
        actionLine.push({'name': 'Вверх'});
    }
    actionLines.push(actionLine);

    actionLine = [];
    if (field.playerPosition.y && !field.cells[field.playerPosition.x][field.playerPosition.y - 1].right)
    {
        actionLine.push({'name': 'Влево', 'action': 'move_hacker_left', 'time': moveTime, 'description': 'Перемещаемся влево'});
    }
    else
    {
        actionLine.push({'name': 'Влево'});
    }
    if (!field.cells[field.playerPosition.x][field.playerPosition.y].right)
    {
        actionLine.push({'name': 'Вправо', 'action': 'move_hacker_right', 'time': moveTime, 'description': 'Перемещаемся вправо'});
    }
    else
    {
        actionLine.push({'name': 'Вправо'});
    }
    actionLines.push(actionLine);

    actionLine = [];
    if (!field.cells[field.playerPosition.x][field.playerPosition.y].bottom)
    {
        actionLine.push({'name': 'Вниз', 'action': 'move_hacker_down', 'time': moveTime, 'description': 'Перемещаемся вниз'});
    }
    else
    {
        actionLine.push({'name': 'Вниз'});
    }
    actionLines.push(actionLine);

    field.actionBlocks.push(actionLines);
}
function addMoveEngineerActions(field)
{
    var actionLines = [];
    var actionLine = [];
    if (field.playerPosition.x)
    {
        actionLine.push({'name': 'Вверх', 'action': 'move_engineer_up', 'time': moveTime, 'description': 'Перемещаемся вверх'});
    }
    else
    {
        actionLine.push({'name': 'Вверх'});
    }
    actionLines.push(actionLine);

    actionLine = [];
    if (field.playerPosition.y)
    {
        actionLine.push({'name': 'Влево', 'action': 'move_engineer_left', 'time': moveTime, 'description': 'Перемещаемся влево'});
    }
    else
    {
        actionLine.push({'name': 'Влево'});
    }
    if (field.playerPosition.y !== field.hSize - 1)
    {
        actionLine.push({'name': 'Вправо', 'action': 'move_engineer_right', 'time': moveTime, 'description': 'Перемещаемся вправо'});
    }
    else
    {
        actionLine.push({'name': 'Вправо'});
    }
    actionLines.push(actionLine);

    actionLine = [];
    if (field.playerPosition.x !== field.vSize - 1)
    {
        actionLine.push({'name': 'Вниз', 'action': 'move_engineer_down', 'time': moveTime, 'description': 'Перемещаемся вниз'});
    }
    else
    {
        actionLine.push({'name': 'Вниз'});
    }
    actionLines.push(actionLine);

    field.actionBlocks.push(actionLines);
}
function addHackerSingleActions(field)
{
    var singleActionsBlock = [];
    singleActionsBlock.push([]);

    var cellEquipment = field.cells[field.playerPosition.x][field.playerPosition.y].equipment;
    if (
        cellEquipment !== undefined &&
        cellEquipment !== 'c&c' &&
        field.equipment[cellEquipment].status === 'online')
    {
        singleActionsBlock[0].push({'name': 'Взломать', 'action': 'break', 'time': breakTime, 'description': 'Взламываем узел'});
    }
    else
    {
        singleActionsBlock[0].push({'name': 'Взломать'});
    }

    singleActionsBlock.push([]);
    singleActionsBlock[1].push({'name': 'Отключиться', 'action': 'disconnect', 'description': 'Отключаемся'})

    field.actionBlocks.push(singleActionsBlock);
}
function addEngineerSingleActions(field)
{
    var singleActionsBlock = [];
    singleActionsBlock.push([]);

    var cellEquipment = field.cells[field.playerPosition.x][field.playerPosition.y].equipment;
    if (
        cellEquipment !== undefined &&
        field.equipment[cellEquipment].status === 'broken')
    {
        singleActionsBlock[0].push({'name': 'Починить', 'action': 'repair', 'time': repairTime, 'description': 'Восстанавливаем узел'});
    }
    else
    {
        singleActionsBlock[0].push({'name': 'Починить'});
    }

    singleActionsBlock.push([]);
    singleActionsBlock[1].push({'name': 'Отключиться', 'action': 'disconnect', 'description': 'Отключаемся'})

    field.actionBlocks.push(singleActionsBlock);
}
function setHackerActions(field)
{
    field.actionBlocks = [];

    addCutActions(field);
    addMoveHackerActions(field);
    addHackerSingleActions(field);
}
function setEngineerActions(field)
{
    field.actionBlocks = [];

    addConnectActions(field);
    addMoveEngineerActions(field);
    addEngineerSingleActions(field);
}
function disconnect()
{
    clearTimeout(endHackTimeout);
    field.gameEndTime = undefined;

    var message = {};

    var broken = false;
    for (var currentEquipment in field.equipment)
    {
        if (field.equipment[currentEquipment].status !== 'online')
        {
            broken = true;
            break;
        }
    }
    if (broken)
    {
        message.type = 'show_engineer_greeting';
    }
    else
    {
        message.type = 'show_hacker_greeting';
    }

    message.data = field;
    postMessage(message);
}
function setGameEndTime(field)
{
    field.gameEndTime = new Date().getTime() + hackTime;
    endHackTimeout = setTimeout(disconnect, hackTime);
}
function showField()
{
    var message = {};
    message.type = 'show_field';
    message.data = field;
    postMessage(message);
}
function connectHacker(params)
{
    field = generateMazeWithoutLoops(params.hSize, params.vSize);
    addEquipment(field);
    removeBorders(field, 0.1);
    extendZones(field);
    determineNodePriorities(field);
    setHackerPosition(field);
    setHackerActions(field);
    setGameEndTime(field);

    showField();
}
function sleep(time)
{
    var now = new Date().getTime();
    var desiredTime = now + time;

    var result = true;

    if (
        field.gameEndTime !== undefined &&
        desiredTime > field.gameEndTime)
    {
        desiredTime = field.gameEndTime;
    }

    while(new Date().getTime() < desiredTime){}

    if (!result)
    {
        disconnect();
    }

    return result;
}
function moveHacker(dx, dy)
{
    if (sleep(moveTime))
    {
        field.playerPosition.x += dx;
        field.playerPosition.y += dy;

        setHackerActions(field);

        showField();
    }
}
function moveEngineer(dx, dy)
{
    if (sleep(moveTime))
    {
        field.playerPosition.x += dx;
        field.playerPosition.y += dy;

        setEngineerActions(field);

        showField();
    }
}
function breakEquipment()
{
    if (sleep(breakTime))
    {
        var cell = field.cells[field.playerPosition.x][field.playerPosition.y];
        field.equipment[cell.equipment].status = 'broken';

        setHackerActions(field);

        showField();
    }
}
function repairEquipment()
{
    if (sleep(repairTime))
    {
        var cell = field.cells[field.playerPosition.x][field.playerPosition.y];
        field.equipment[cell.equipment].status = 'online';

        setEngineerActions(field);

        showField();
    }
}
function connectEngineer()
{
    logInfo = { 'message': 'Повышаем привилегии' };
    setPercent(logInfo, 1, 1);

    var logInfo = { 'message': 'Подключаемся к системе' };
    setPercent(logInfo, 1, 1);

    field.playerPosition = {'x': field.commandPosition.x, 'y': field.commandPosition.y};

    setEngineerActions(field);

    showField();
}

onmessage =
    function(messageEvent)
    {
        var msg = messageEvent.data;
        switch (msg.type)
        {
        case 'connect_hacker':
            connectHacker(msg.params);
            break;
        case 'connect_engineer':
            connectEngineer();
            break;
        case 'move_hacker_left':
            moveHacker(0, -1);
            break;
        case 'move_hacker_right':
            moveHacker(0, 1);
            break;
        case 'move_hacker_up':
            moveHacker(-1, 0);
            break;
        case 'move_hacker_down':
            moveHacker(1, 0);
            break;
        case 'move_engineer_left':
            moveEngineer(0, -1);
            break;
        case 'move_engineer_right':
            moveEngineer(0, 1);
            break;
        case 'move_engineer_up':
            moveEngineer(-1, 0);
            break;
        case 'move_engineer_down':
            moveEngineer(1, 0);
            break;
        case 'break':
            breakEquipment();
            break;
        case 'repair':
            repairEquipment();
            break;
        case 'disconnect':
            disconnect();
            break;
        }
    }
