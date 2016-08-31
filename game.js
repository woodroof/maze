function initLog()
{
    var logField = document.getElementById('log');
    if (!logField)
    {
        logField = document.createElement('div');
        logField.id = 'log';
        logField.className = 'log';
        logField.textContent = 'Log:';
        document.body.appendChild(logField);
    }

    return logField;
}
function clearLog()
{
    var logField = document.getElementById('log');
    if (logField)
    {
        logField.textContent = 'Log:';
    }
}
function log(text)
{
    var logField = initLog();

    var entry = document.createElement('div');
    entry.className = 'log_entry';
    entry.textContent = text;
    logField.appendChild(entry);
}
function logReplace(text)
{
    var logField = document.getElementById('log');
    if (logField)
    {
        logField.lastChild.textContent = text;
    }
}

function clearField()
{
    var mazeImage = document.getElementById('main_field');
    if (mazeImage)
    {
        document.body.removeChild(mazeImage);
    }
}

function show(gameData)
{
    var cellSize = 15;

    clearField();

    var field = gameData.field;

    mazeImage = document.createElement('div');
    mazeImage.id = 'main_field'
    mazeImage.className = 'field';
    mazeImage.style.width = field.hSize * cellSize + 'px';
    document.body.appendChild(mazeImage);

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

    document.getElementById('generate_button').disabled = false;
}

var worker = new Worker("worker.js");

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
        case 'show':
            show(message.data);
            break;
        }
    };

function getIntParam(id, min, max, defaultValue)
{
    var elem = document.getElementById(id);
    var textValue = elem.value;
    var intValue = parseInt(textValue, 10);
    if (!intValue || intValue + "" !== textValue)
    {
        intValue = defaultValue;
    }
    if (intValue < min)
    {
        intValue = min;
    }
    if (intValue > max)
    {
        intValue = max;
    }
    elem.value = intValue;
    return intValue;
}
function resetGame()
{
    var hSize = getIntParam('hsize', 1, 100, 40);
    var vSize = getIntParam('vsize', 1, 100, 40);

    clearLog();
    clearField();

    document.getElementById('generate_button').disabled = true;

    var message = {};
    message.type = 'generate';
    message.params = {};
    message.params.hSize = hSize;
    message.params.vSize = vSize;

    worker.postMessage(message);
}
