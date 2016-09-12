var equipment = [
    {
        "id": "c&c",
        "name": "Командный центр",
        "color": "blue"
    },
    {
        "id": "reactor1",
        "name": "Реактор 1",
        "color": "yellow"
    },
    {
        "id": "reactor2",
        "name": "Реактор 2",
        "color": "yellow"
    },
    {
        "id": "spaceport",
        "name": "Космопорт",
        "color": "blue"
    },
    {
        "id": "squadron1",
        "name": "Эскадрилья 1",
        "color": "blue"
    },
    {
        "id": "squadron2",
        "name": "Эскадрилья 2",
        "color": "blue"
    },
    {
        "id": "squadron3",
        "name": "Эскадрилья 3",
        "color": "blue"
    },
    {
        "id": "squadron4",
        "name": "Эскадрилья 4",
        "color": "blue"
    },
    {
        "id": "weapon1",
        "name": "Орудие 1",
        "color": "blue"
    },
    {
        "id": "weapon2",
        "name": "Орудие 2",
        "color": "blue"
    },
    {
        "id": "weapon3",
        "name": "Орудие 3",
        "color": "blue"
    },
    {
        "id": "weapon4",
        "name": "Орудие 4",
        "color": "blue"
    },
    {
        "id": "radar",
        "name": "Радар",
        "color": "blue"
    },
    {
        "id": "observatory",
        "name": "Система наблюдения",
        "color": "blue"
    },
    {
        "id": "transmitter1",
        "name": "Тахионный передатчик 1",
        "color": "blue"
    },
    {
        "id": "transmitter2",
        "name": "Тахионный передатчик 2",
        "color": "blue"
    },
    {
        "id": "shield1",
        "name": "Генератор щита 1",
        "color": "blue"
    },
    {
        "id": "shield2",
        "name": "Генератор щита 2",
        "color": "blue"
    },
    {
        "id": "beacon",
        "name": "Гипермаяк",
        "color": "blue"
    },
    {
        "id": "close_range_weapon",
        "name": "Орудия ближнего боя",
        "color": "blue"
    },
    {
        "id": "life_support",
        "name": "Система жизнеобеспечения",
        "color": "grey"
    },
    {
        "id": "hyperdrive",
        "name": "Гипердвигатель",
        "color": "grey"
    },
    {
        "id": "maneuvering_thrusters",
        "name": "Маневровые двигатели",
        "color": "grey"
    },
    {
        "id": "drive1",
        "name": "Двигатель 1",
        "color": "grey"
    },
    {
        "id": "drive2",
        "name": "Двигатель 2",
        "color": "grey"
    },
    // Всякое левое
    {
        "id": "water storage",
        "name": "Хранилище воды",
        "color": "red"
    },
    {
        "id": "restaurant",
        "name": "Столовая",
        "color": "green"
    },
    {
        "id": "waste_recycling",
        "name": "Системы переработки мусора",
        "color": "brown"
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
            if (vIdx !== field.hSize - 1 && !field.cells[hIdx][vIdx].right && marks[hIdx][vIdx + 1] === 0)
            {
                hIndexes.push(hIdx);
                vIndexes.push(vIdx + 1);
            }
            // down
            if (hIdx !== field.vSize - 1 && !field.cells[hIdx][vIdx].bottom && marks[hIdx + 1][vIdx] === 0)
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
function setPercent(info, percent)
{
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
    var logInfo =
        {
            'message': 'Изучаем топологию сети'
        };

    setPercent(logInfo, 0);

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
                allowedBorders.push(i * hSize * 2 + j * 2);
            }
            if (i === vSize - 1)
            {
                newCell.bottom = true;
            }
            else
            {
                allowedBorders.push(i * hSize * 2 + j * 2 + 1);
            }
            maze.cells[i].push(newCell);
        }
    }

    allowedBorders = shuffle(allowedBorders);

    for (var allowedIdx = 0; allowedIdx < allowedBorders.length; ++allowedIdx)
    {
        var borderIdx = allowedBorders[allowedIdx];

        var horizontal = borderIdx % 2 === 0;
        var hIdx = (borderIdx / (2 * hSize)) | 0;
        var vIdx = ((borderIdx / 2) | 0) % hSize;

        var cell = maze.cells[hIdx][vIdx];
        if (horizontal)
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
            if (horizontal)
            {
                cell.right = false;
            }
            else
            {
                cell.bottom = false;
            }
            --maze.borderCount;
        }

        setPercent(logInfo, ((allowedIdx + 1) / allowedBorders.length * 100) | 0);
    }

    setPercent(logInfo, 100);

    return maze;
}
function addEquipment(field)
{
    var logInfo =
        {
            'message': 'Находим подключенное оборудование'
        };

    setPercent(logInfo, 0);

    field.equipment = [];

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
        cell.equipment = equipment[i].name;
        cell.color = equipment[i].color;

        field.equipment.push({'id': equipment[i].id, 'pos': pos});

        if (!i)
        {
            field.entry_point = pos;
        }

        setPercent(logInfo, ((i + 1) / equipment.length * 100) | 0);
    }

    setPercent(logInfo, 100);
}
function generateHackField(params)
{
    var field = generateMazeWithoutLoops(params.hSize, params.vSize);
    addEquipment(field);

    var message = {};
    message.type = 'show_hack_field';
    message.data = field;
    postMessage(message);
}

onmessage =
    function(messageEvent)
    {
        var msg = messageEvent.data;
        switch (msg.type)
        {
        case 'generate_hack_field':
            generateHackField(msg.params);
            break;
        }
    }
