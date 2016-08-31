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
function generateMazeWithoutLoops(hSize, vSize)
{
    var messagePrefix = 'Generating maze ' + hSize + 'x' + vSize + ': ';

    log(messagePrefix + '0%');

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

        var percent = ((allowedIdx + 1) / allowedBorders.length * 100) | 0;
        logReplace(messagePrefix + percent + '%');
    }

    logReplace(messagePrefix + 'done!');

    return maze;
}
function generate(params)
{
    var message = {};
    message.type = 'show';
    message.data = {};
    message.data.field = generateMazeWithoutLoops(params.hSize, params.vSize);
    postMessage(message);
}

onmessage =
    function(messageEvent)
    {
        var msg = messageEvent.data;
        switch (msg.type)
        {
        case 'generate':
            generate(msg.params);
            break;
        }
    }
