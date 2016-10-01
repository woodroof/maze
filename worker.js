var hackTime = 4 * 60 * 1000;
var endHackTimeout;

var moveTime = 500;
var breakTime = 30 * 1000;
var repairTime = 2 * breakTime;
var engineerVisibleArea = 2;
var bordersRatio = 0.1;

var dbUrl = 'http://sk.b5.langed.org/api/nosql';

var field;
var equipment = [
    {
        'id': 'c&c',
        'name': 'Командный центр',
        'color': 'blue'
    },
    {
        'id': 'reactor1',
        'serverId': 1,
        'name': 'Реактор 1',
        'color': 'yellow'
    },
    {
        'id': 'reactor2',
        'serverId': 2,
        'name': 'Реактор 2',
        'color': 'yellow'
    },
    {
        'id': 'reactor3',
        'serverId': 3,
        'name': 'Реактор 3',
        'color': 'yellow'
    },
    {
        'id': 'reactor4',
        'serverId': 4,
        'name': 'Реактор 4',
        'color': 'yellow'
    },
    {
        'id': 'transmitter1',
        'serverId': 5,
        'name': 'Тахионный передатчик 1',
        'color': 'blue'
    },
    {
        'id': 'transmitter2',
        'serverId': 6,
        'name': 'Тахионный передатчик 2',
        'color': 'blue'
    },
    {
        'id': 'beacon',
        'serverId': 7,
        'name': 'Гипермаяк',
        'color': 'blue'
    },
    {
        'id': 'weapon1',
        'serverId': 8,
        'name': 'Плазмогенератор 1',
        'color': 'blue'
    },
    {
        'id': 'weapon2',
        'serverId': 9,
        'name': 'Плазмогенератор 2',
        'color': 'blue'
    },
    {
        'id': 'weapon3',
        'serverId': 10,
        'name': 'Плазмогенератор 3',
        'color': 'blue'
    },
    {
        'id': 'weapon4',
        'serverId': 11,
        'name': 'Плазмогенератор 4',
        'color': 'blue'
    },
    {
        'id': 'close_range_weapon',
        'serverId': 12,
        'name': 'Микролуч',
        'color': 'blue'
    },
    {
        'id': 'hyperdrive',
        'serverId': 13,
        'name': 'Гипердвигатель',
        'color': 'grey'
    },
    {
        'id': 'drive1',
        'serverId': 14,
        'name': 'Двигатель 1',
        'color': 'grey'
    },
    {
        'id': 'drive2',
        'serverId': 15,
        'name': 'Двигатель 2',
        'color': 'grey'
    },
    {
        'id': 'maneuvering_thrusters',
        'serverId': 16,
        'name': 'Маневровые двигатели',
        'color': 'grey'
    },
    {
        'id': 'shield1',
        'serverId': 17,
        'name': 'Метеоритная защита 1',
        'color': 'blue'
    },
    {
        'id': 'shield2',
        'serverId': 18,
        'name': 'Метеоритная защита 2',
        'color': 'blue'
    },
    {
        'id': 'life_support',
        'serverId': 19,
        'name': 'Система жизнеобеспечения',
        'color': 'grey'
    },
    {
        'id': 'radar',
        'serverId': 20,
        'name': 'Радар',
        'color': 'blue'
    },
    {
        'id': 'observatory',
        'serverId': 21,
        'name': 'Сканер',
        'color': 'blue'
    },
    {
        'id': 'spaceport',
        'serverId': 22,
        'name': 'Космопорт',
        'color': 'blue'
    },
    {
        'id': 'squadron1',
        'serverId': 23,
        'name': 'Бот 1',
        'color': 'blue'
    },
    {
        'id': 'squadron2',
        'serverId': 24,
        'name': 'Бот 2',
        'color': 'blue'
    },
    {
        'id': 'squadron3',
        'serverId': 25,
        'name': 'Бот 3',
        'color': 'blue'
    },
    {
        'id': 'squadron4',
        'serverId': 26,
        'name': 'Бот 4',
        'color': 'blue'
    },
    {
        'id': 'lab',
        'serverId': 27,
        'name': 'Лаборатория',
        'color': 'blue'
    },
    {
        'id': 'medlab',
        'serverId': 28,
        'name': 'Медицинский отсек',
        'color': 'blue'
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

var injuryProbability = 1/3;

var injuries = [
    "Удар электрическим током пришёлся в руку. Конечность онемела и не слушается. Чтобы излечиться, вам понадобится помощь врача.",
    "Удар электрическим током пришёлся в ногу. Конечность онемела и не слушается. Чтобы излечиться, вам понадобится помощь врача.",
    "Вы получили мощный удар током прямо в спину и теряете сознание. Через 5 минут приходите в себя и чувствуете сильную слабость, с трудом можете двигаться и разговаривать. Помочь вам может только врач.",
    "Вашу голову пронзает удар током! Вы падаете без сознания. Через 5 минут, придя в себя, вы понимаете, что не можете нормально видеть - всё двоится в глазах. Срочно к доктору!",
    "Вы случайно поранили руку. Кровотечение вы остановили, но без врачебной помощи не обойтись. Конечность болит и плохо слушается. Без доктора это состояние пройдёт только через пару дней.",
    "Во время работ вы были невнимательны, на вас упал тяжёлый предмет. Удар пришёлся в голову, вы потеряли сознание на 5 минут. С тех пор у вас двоится в глазах, вас тошнит и вы не можете сосредоточиться, о применении проф. способностей речи не идёт.",
    "Плохо закреплённое оборудование наносит вам сильный удар в грудь. Вам очень больно, вы с трудом дышите и не можете стоять прямо. Не можете применять проф. способности. Вам срочно нужна помощь врача.",
    "Раскалённый провод касается вашей руки. Повреждения небольшие, но конечность не двигается. Через час подвижность восстановится сама собой.",
    "Раскалённый провод касается вашей ноги. Повреждения небольшие, но конечность не двигается. Через час подвижность восстановится сама собой.",
    "Вы упали и ударились головой. Чувствуете лёгкое головокружение, не можете быстро двигаться, громко говорить и применять проф. способности. Через 15 минут всё пройдёт."
];

function serverIdToId(serverId)
{
    return equipment.find(function(elem){ return elem.serverId === serverId; }).id;
}

function getData(callback)
{
    var request = new XMLHttpRequest();
    request.open('POST', dbUrl, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.onreadystatechange =
        function()
        {
            if (request.readyState == 4)
            {
                if (request.status == 200)
                {
console.log(request.responseText);
                    callback(JSON.parse(JSON.parse(request.responseText)[0]));
                }
                else
                {
                    callback(undefined);
                }
            }
        };
    request.send(
        JSON.stringify(
            {
                'method': 'get',
                'object_id': 1,
                'table': 'kopernik_sys',
                'id' : 732
            }));
}

function saveData(data)
{
    var request = new XMLHttpRequest();
    request.open('POST', dbUrl, true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.send(
        JSON.stringify(
            {
                'method': 'document',
                'object_id': 1,
                'table': 'kopernik_sys',
                'id' : 732,
                'data': JSON.stringify(data)
            }));
    request.onreadystatechange =
        function()
        {
            if (request.readyState == 4)
            {
            }
        };
}

function updateData()
{
    getData(
        function(data)
        {
            if (data !== undefined)
            {
                var info = data.data;
                for (var i = 0; i < info.length; ++i)
                {
                    if (field.equipment[serverIdToId(info[i].sysid)].status !== 'online')
                    {
                        info[i].sysstatus = 0;
                        info[i].sysdamage = 1;
                    }
                    else if (info[i].sysdamage === 1)
                    {
                        info[i].sysdamage = 0;
                    }
                }

                ++data.meta.mark;

                saveData(data);
            }
        });
}

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

    field.brokenEquipmentCount = 0;
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
function removeBorders(field)
{
    var logInfo = { 'message': 'Исследуем вспомогательные подключения' };

    setPercent(logInfo);

    var bordersToRemove = field.borderCount * bordersRatio | 0;
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
    field.actionsDone = 0;
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

    if (field.brokenEquipmentCount)
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
function setHackerFogOfWar(field)
{
    for (var i = 0; i < field.vSize; ++i)
    {
        for (var j = 0; j < field.hSize; ++j)
        {
            field.cells[i][j].known = false;
        }
    }
}
function updateEngineerFogOfWar(field)
{
    for (var i = 0; i < field.vSize; ++i)
    {
        for (var j = 0; j < field.hSize; ++j)
        {
            field.cells[i][j].visible = false;
        }
    }

    var x = field.playerPosition.x;
    var y = field.playerPosition.y;

    for (var i = x - engineerVisibleArea; i <= x + engineerVisibleArea; ++i)
    {
        for (var j = y - engineerVisibleArea; j <= y + engineerVisibleArea; ++j)
        {
            if (
                i >= 0 &&
                i < field.vSize &&
                j >= 0 &&
                j < field.hSize)
            {
                field.cells[i][j].visible = true;
            }
        }
    }
}
function updateHackerFogOfWar(field)
{
    for (var i = 0; i < field.vSize; ++i)
    {
        for (var j = 0; j < field.hSize; ++j)
        {
            field.cells[i][j].visible = false;
        }
    }

    var x = field.playerPosition.x;
    var y = field.playerPosition.y;
    field.cells[x][y].known = true;
    field.cells[x][y].visible = true;

    var i = x;
    while (
        i &&
        !field.cells[i - 1][y].bottom)
    {
        field.cells[i - 1][y].known = true;
        field.cells[i - 1][y].visible = true;
        if (
            field.cells[i - 1][y].equipment !== undefined ||
            !field.cells[i - 1][y].right ||
            (y && !field.cells[i - 1][y - 1].right))
        {
            break;
        }
        --i;
    }

    i = x;
    while (
        i !== field.vSize - 1 &&
        !field.cells[i][y].bottom)
    {
        field.cells[i + 1][y].known = true;
        field.cells[i + 1][y].visible = true;
        if (
            field.cells[i + 1][y].equipment !== undefined ||
            !field.cells[i + 1][y].right ||
            (y && !field.cells[i + 1][y - 1].right))
        {
            break;
        }
        ++i;
    }

    i = y;
    while (
        i &&
        !field.cells[x][i - 1].right)
    {
        field.cells[x][i - 1].known = true;
        field.cells[x][i - 1].visible = true;
        if (
            field.cells[x][i - 1].equipment !== undefined ||
            !field.cells[x][i - 1].bottom ||
            (x && !field.cells[x - 1][i - 1].bottom))
        {
            break;
        }
        --i;
    }

    i = y;
    while (
        i !== field.hSize - 1 &&
        !field.cells[x][i].right)
    {
        field.cells[x][i + 1].known = true;
        field.cells[x][i + 1].visible = true;
        if (
            field.cells[x][i + 1].equipment !== undefined ||
            !field.cells[x][i + 1].bottom ||
            (x && !field.cells[x - 1][i + 1].bottom))
        {
            break;
        }
        ++i;
    }
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
    removeBorders(field);
    extendZones(field);
    determineNodePriorities(field);
    setHackerFogOfWar(field);
    setHackerPosition(field);
    updateHackerFogOfWar(field);
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
        result = false;
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
        updateHackerFogOfWar(field);

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
        updateEngineerFogOfWar(field);

        showField();
    }
}
function calcProbabitily(probability, actionsDone)
{
    var result = probability;
    while (actionsDone)
    {
        result += (1 - result) * probability;
        --actionsDone;
    }
    return result;
}
function sleepOrBeHarmed(time)
{
    var rand = Math.random();
    var probability = calcProbabitily(injuryProbability, field.actionsDone);
    if (rand < probability)
    {
        time = randomIdx(0, time);
        if (sleep(time))
        {
            disconnect();

            var message = {};
            message.type = 'show_message';
            message.data = injuries[randomIdx(0, injuries.length - 1)];
            postMessage(message);
        }

        return false;
    }
    return sleep(time);
}
function breakEquipment()
{
    if (sleepOrBeHarmed(breakTime))
    {
        var cell = field.cells[field.playerPosition.x][field.playerPosition.y];
        field.equipment[cell.equipment].status = 'broken';
        ++field.brokenEquipmentCount;
        ++field.actionsDone;

        updateData();

        setHackerActions(field);

        showField();
    }
}
function repairEquipment()
{
    if (sleepOrBeHarmed(repairTime))
    {
        var cell = field.cells[field.playerPosition.x][field.playerPosition.y];
        field.equipment[cell.equipment].status = 'online';
        --field.brokenEquipmentCount;
        ++field.actionsDone;

        updateData();

        if (field.brokenEquipmentCount)
        {
            setEngineerActions(field);

            showField();
        }
        else
        {
            disconnect();
        }
    }
}
function connectEngineer()
{
    for (var i = 0; i < field.vSize; ++i)
    {
        for (var j = 0; j < field.hSize; ++j)
        {
            field.cells[i][j].known = true;
            field.cells[i][j].visible = false;
        }
    }

    logInfo = { 'message': 'Повышаем привилегии' };
    setPercent(logInfo, 1, 1);

    var logInfo = { 'message': 'Подключаемся к системе' };
    setPercent(logInfo, 1, 1);

    field.playerPosition = {'x': field.commandPosition.x, 'y': field.commandPosition.y};
    field.actionsDone = 0;

    updateEngineerFogOfWar(field);
    setEngineerActions(field);

    showField();
}
function start(params)
{
    getData(
        function(data)
        {
            if (data !== undefined)
            {
                var info = data.data;

                var damaged = [];

                for (var i = 0; i < info.length; ++i)
                {
                    if (info[i].sysdamage === 1)
                    {
                        damaged.push(serverIdToId(info[i].sysid));
                    }
                }

                if (damaged.length)
                {
                    field = generateMazeWithoutLoops(params.hSize, params.vSize);
                    addEquipment(field);
                    removeBorders(field);
                    extendZones(field);
                    determineNodePriorities(field);

                    for (var j = 0; j < damaged.length; ++j)
                    {
                        field.equipment[damaged[j]].status = 'broken';
                        ++field.brokenEquipmentCount;
                    }

                    var message = {};
                    message.type = 'show_engineer_greeting';
                    message.data = field;
                    postMessage(message);

                    return;
                }
            }

            var message = {};
            message.type = 'show_hacker_greeting';
            message.data = field;
            postMessage(message);
        });
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
        case 'start':
            start(msg.params);
            break;
        }
    }
