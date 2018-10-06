var CHESSBOARD_WIDTH = 300; // 
var CHESSBOARD_GRID = 27; // 每格大小
var CHESSBOARD_MARGIN = 15; // 距離
var CHESS_SIZE = 0; // 格数
var IS_BLACK = true; // 是否黑棋
var IS_GAME_OVER = false; // 是否结束
var IS_CAN_STEP = false; // 是否可以下棋
var COMPETITOR_NAME = '';    // 對手

var ctx = null;

var socket = io('http://localhost:3000');

var arrPieces = new Array();

$(document).ready(function () {
    clientSocket(socket);
    bindChangeNameClick(socket);
    bindApplyGameClick(socket);

    drawChessBoard();
    chessClick();
});

// 畫棋盤
function drawChessBoard() {
    var canvas = document.getElementById('chessboard');
    canvas.width = CHESSBOARD_WIDTH;
    canvas.height = CHESSBOARD_WIDTH;
    ctx = canvas.getContext('2d');
    ctx.lineWidth = 1;
    CHESS_SIZE = Math.floor(CHESSBOARD_WIDTH / CHESSBOARD_GRID);
    

    for (var i = 0; i < CHESS_SIZE; i++) {
        ctx.strokeStyle = "#000000";
        ctx.moveTo(CHESSBOARD_MARGIN + CHESSBOARD_GRID * i, CHESSBOARD_MARGIN);
        ctx.lineTo(CHESSBOARD_MARGIN + CHESSBOARD_GRID * i, CHESSBOARD_WIDTH - CHESSBOARD_MARGIN);
        ctx.stroke();
        ctx.moveTo(CHESSBOARD_MARGIN, CHESSBOARD_MARGIN + CHESSBOARD_GRID * i);
        ctx.lineTo(CHESSBOARD_WIDTH - CHESSBOARD_MARGIN, CHESSBOARD_MARGIN + CHESSBOARD_GRID * i);
        ctx.stroke();

        arrPieces[i] = new Array();
        for (var j = 0; j < CHESS_SIZE; j++) {
            arrPieces[i][j] = 0;
        }
    }
}

// 畫棋子
function drawPiece(i, j) {
    
    if (IS_CAN_STEP && !IS_GAME_OVER && arrPieces[i][j] === 0) {

        // 新棋子
        drawNewPiece(i, j, IS_BLACK);

        // 落下棋後行檢查
        doCheck(i, j, IS_BLACK);

        // 是否有空位
        checkIsExistEmpty();

        stepPiece(i, j, IS_GAME_OVER);
        // 黑白棋相互交換
       
    }
}

function drawNewPiece(i, j, isBlack) {
    var x = CHESSBOARD_MARGIN + i * CHESSBOARD_GRID + 1;
    var y = CHESSBOARD_MARGIN + j * CHESSBOARD_GRID + 1;
    ctx.beginPath();
    ctx.arc(x, y, Math.floor(CHESSBOARD_GRID / 2) - 2, 0, Math.PI * 2, true);
    ctx.closePath();
    var grd = ctx.createRadialGradient(x, y, Math.floor(CHESSBOARD_GRID / 3), x, y, Math.floor(CHESSBOARD_GRID / 10));
    if (isBlack) {
        grd.addColorStop(0, '#0A0A0A');
        grd.addColorStop(1, '#676767');
    } else {
        grd.addColorStop(0, '#D8D8D8');
        grd.addColorStop(1, '#F9F9F9');
    }
    ctx.fillStyle = grd;
    ctx.fill();

    // 落子情况
    arrPieces[i][j] = isBlack ? 1 : 2;
}

// 落子
function chessClick() {
    $('#chessboard').click(function (e) {
        var x = Math.floor(e.offsetX / CHESSBOARD_GRID);
        var y = Math.floor(e.offsetY / CHESSBOARD_GRID);
        drawPiece(x, y);
    })
}

// 是否存在空位
function checkIsExistEmpty() {
    var isExistEmpty = false;
    for (var i = 0; i < CHESS_SIZE; i++) {
        for (var j = 0; j < CHESS_SIZE; j++) {
            if (arrPieces[i][j] === 0) {
                isExistEmpty = true;
                break;
            }
        }
    }
    if (!isExistEmpty) {
        setTimeout(function () {
            alert('平局!')
        }, 0);
    }
}
// 是否赢得比赛
function doCheck(x, y) {
    horizontalCheck(x, y);
    verticalCheck(x, y);
    downObliqueCheck(x, y);
    upObliqueCheck(x, y);
}

// 结束
function isOver(x, y, sum) {
    if (sum === 5) {
        IS_GAME_OVER = true;
        setTimeout(function () {
            alert('Game Over!')
        }, 0);
    }
}

// 横轴方向
function horizontalCheck(x, y) {
    var sum = -1;

    for (var i = x; i >= 0; i--) {
        if (arrPieces[i][y] === arrPieces[x][y]) {
            sum++;
        } else {
            i = -1;
            break;
        }
    }
    for (var i = x; i < CHESS_SIZE; i++) {
        if (arrPieces[i][y] === arrPieces[x][y]) {
            sum++;
        } else {
            i = CHESS_SIZE;
            break;
        }
    }
    isOver(x, y, sum);
}

// 豎軸
function verticalCheck(x, y) {
    var sum = -1;

    for (var j = y; j >= 0; j--) {
        if (arrPieces[x][j] === arrPieces[x][y]) {
            sum++;
        } else {
            j = -1;
            break;
        }
    }
    for (var j = y; j < CHESS_SIZE; j++) {
        if (arrPieces[x][j] === arrPieces[x][y]) {
            sum++;
        } else {
            j = CHESS_SIZE;
            break;
        }
    }
    isOver(x, y, sum);
}

// 下斜方向
function downObliqueCheck(x, y) {
    var sum = -1;

    for (var i = x, j = y; i >= 0 && y >= 0;) {
        if (arrPieces[i][j] === arrPieces[x][y]) {
            sum++;
        } else {
            j = i = -1;
            break;
        }
        i--;
        j--;
    }
    for (var i = x, j = y; i < CHESS_SIZE && j < CHESS_SIZE;) {
        if (arrPieces[i][j] === arrPieces[x][y]) {
            sum++;
        } else {
            j = i = CHESS_SIZE;
            break;
        }
        i++;
        j++;
    }
    isOver(x, y, sum);
}

// 上斜方向
function upObliqueCheck(x, y) {
    var sum = -1;

    for (var i = x, j = y; i >= 0 && j < CHESS_SIZE;) {
        if (arrPieces[i][j] === arrPieces[x][y]) {
            sum++;
        } else {
            j = CHESS_SIZE;
            i = -1;
            break;
        }
        i--;
        j++;
    }
    for (var i = x, j = y; i < CHESS_SIZE && j >= 0;) {
        if (arrPieces[i][j] === arrPieces[x][y]) {
            sum++;
        } else {
            i = CHESS_SIZE;
            j = -1;
            break;
        }
        i++;
        j--;
    }
    isOver(x, y, sum);
}

// 客户端socket
function clientSocket(socket) {
    socket.on('userName', function (name) {
        $('#my_name').val(name).attr('data-oldvalue', name);
    });

    socket.on('allUsers', function (userList) {
        console.log(userList);
        handlebarsUserList(userList, socket.id, socket);
    });

    socket.on('beginGame', function (gameInfo) {
        IS_CAN_STEP = gameInfo.currentStep;
        IS_BLACK = gameInfo.isBlack;
        var status = '';
        if(IS_CAN_STEP) {
            status = '該我下棋了...';
        } else {
            status = '等待 ' + COMPETITOR_NAME + ' 下棋中...';
        }
        setGameStatus(status);
    });

    socket.on('competitorStep', function (info) {
        var ownInfo = info.ownInfo,
            stepInfo = info.stepInfo;

        IS_CAN_STEP = ownInfo.currentStep;
        drawNewPiece(stepInfo.x, stepInfo.y, !ownInfo.isBlack);
        IS_GAME_OVER = stepInfo.isGameOver;
        var status = '';
        if(IS_GAME_OVER) {
            setTimeout(function(){
                alert('Game Over!');
            }, 0);

            satus = '遊戲结束了。';
        } else {
            if(IS_CAN_STEP) {
                status = '該我下棋了...';
            } else {
                status = '等待 ' + COMPETITOR_NAME + ' 下棋中...';
            }
        }
        setGameStatus(status);
        
    });
}

// 绑定修改ID事件
function bindChangeNameClick(socket) {
    $('#change_name').click(function (e) {
        var $name = $('#my_name'),
            value = $name.val();
        if (value.trim() === '') {
            alert('ID不能空白！');
            return;
        }
        if (value !== $name.attr('data-oldvalue')) {
            socket.emit('setName', value);
        }
    });
}

// 绑定申請事件
function bindApplyGameClick(socket) {
    $('.user-status').click(function (e) {
        var $this = $(this);
        socket.emit('applyGame', $this.data('id'));
        COMPETITOR_NAME = $this.data('name');
    });
}

// 加载玩家列表
function handlebarsUserList(userList, ownId, socket) {
    var source = $("#user_template").html();
    var template = Handlebars.compile(source);
    var result = [];
    $.each(userList, function (index, value) {
        value.statusClass = '';
        value.statusText = '申請對戰';
        if (value.competitor) {
            value.statusClass = 'gaming-status';
            value.statusText = '對戰中';
        }
        if (value.competitor === ownId) {
            value.statusClass = 'gaming-current';
            value.statusText = '當前對手';
            COMPETITOR_NAME = value.name;
        }
        if (value.id !== ownId) {
            result.push(value);
        }
    });
    var html = template({
        userList: result
    });
    $('#user_list').html(html);
    bindApplyGameClick(socket);
}

// 下棋觸發socket
function stepPiece(x, y, isGameOver) {
    IS_CAN_STEP = false;
    var status = '等待 ' + COMPETITOR_NAME + ' 下棋中...';
    if(isGameOver) {
        status = '遊戲結束.'
    }
    setGameStatus(status);
    socket.emit('step', {
        x: x,
        y: y,
        isGameOver: isGameOver
    });
}

// 設定遊戲狀態
function setGameStatus(status) {
    $('#current_status').text(status);
}