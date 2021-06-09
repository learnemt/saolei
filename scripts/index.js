function get(id) {
    return document.getElementById(id);
}
var start = get("start");
var end = get("end");
var minecount = get("minecount");
var second = get("second");
var backGround = get("backGround");
var seconds, minutes, hours;
var Mine = null; //创建表格
var t = null;

function Sweep(id, rows, cols, min, max) {
    this.id = id; //thead
    this.rows = rows; //行
    this.cols = cols; //列
    this.cells = null //格子
    this.min = min;
    this.max = max;
    this.mines = 0; //随机总雷数
    this.markMines = 0; //标记雷数
    this.onmarkMine = null; //标记地雷操作的回调函数
    this.openCells = 0; //成功打开格子数
    this.onGameOver = null; //准备游戏结束时的回调函数
    this.playing = false; //刚开始是未进行
    this.winmark = 0; //红旗插在雷上成功排雷
    this.chacuo = 0; //插错的雷插到数字之类
}
//创建方法
Sweep.prototype = {
    constructor: Sweep,
    $: function(id) {
        return document.getElementById(id);
    },
    draw: function() { //画格子
        var lattices = this.$("lattice"); //thead格子
        var html = "";
        for (var i = 0; i < this.rows; i++) {
            html += "<tr>";
            for (var j = 0; j < this.cols; j++) {
                html += "<td id = 'mine_" + i + "_" + j + "'></td>"; // id = 'mine_" + i + "_" + j + "'
            }
            html += "</tr>";
        }
        lattices.innerHTML = html;
    },
    initcells: function() { //模拟二维数组
        this.cells = [];
        for (var i = 0; i < this.rows; i++) {
            this.cells.push([]);
            for (var j = 0; j < this.cols; j++) {
                this.cells[i].push(0);
            }
        }
        //console.log(this.cells);
    },

    getRandom: function(min, max) { //得到5-8位随机数
        return min + Math.floor(Math.random() * (max - min + 1));
    },
    getIndex(number) { //从随机数获取索引下标
        return {
            row: Math.floor(number / this.cols),
            col: number % this.cols
        }
    },

    setMines: function() { //设置地雷
        var tempArr = {};
        for (var i = 0; i < this.mines; i++) {
            var number = this.getRandom(0, this.rows * this.cols - 1); //从0-24随机5-8个雷
            //console.log(number + "                     " + tempArr+"   "+i+"   "+ (number in tempArr) );
            if (number in tempArr) {
                i--;
            } else {
                tempArr[number] = number;
                var coordinate = this.getIndex(number); //坐标
                this.cells[coordinate.row][coordinate.col] = 9; //这个格子行列
            }
        }
    },
    showcount: function() { //给9周围添加数字
        //console.log(this.cells);
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var number = 0
                if (this.cells[i][j] == 9) {
                    continue;
                }
                //上
                if (i > 0 && this.cells[i - 1][j] == 9) {
                    number++;
                } //右上
                if ((i > 0 && j < this.cols - 1) && this.cells[i - 1][j + 1] == 9) {
                    number++;
                } //右
                if (j < this.cols - 1 && this.cells[i][j + 1] == 9) {
                    number++;
                } //右下
                if ((i < this.rows - 1 && j < this.cols - 1) && this.cells[i + 1][j + 1] == 9) {
                    number++;
                } //下
                if (i < this.rows - 1 && this.cells[i + 1][j] == 9) {
                    number++;
                } //左下
                if ((i < this.rows - 1 && j > 0) && this.cells[i + 1][j - 1] == 9) {
                    number++;
                } //左
                if (j > 0 && this.cells[i][j - 1] == 9) {
                    number++;
                } //左上
                if ((i > 0 && j > 0) && this.cells[i - 1][j - 1] == 9) {
                    number++;
                }
                this.cells[i][j] = number;
            }
        }
    },
    showAll: function(i, j) //显示所有包括雷等等
        {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.cols; j++) {
                    var td = this.$("mine_" + i + "_" + j);
                    var cell = this.cells[i][j];
                    if (cell == 9) {
                        if (td.className == "redFlag") {
                            td.className = "flagOk";
                            this.winmark++;
                        } else if (td.className == "fail") {
                            td.className = "mine2";
                        } else {
                            td.className = "mine";
                        }
                    } else {
                        if (cell != 0)
                            td.innerText = cell;
                        if (td.className == "redFlag") {
                            td.className = "flagError";
                            this.chacuo++;
                        } else {
                            td.className = "number";
                        }
                    }
                }
            }
        },
    hideAll: function() { //隐藏
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var td = this.$("mine_" + i + "_" + j);
                td.className = "";
                td.innerText = "";
            }
        }
    },
    mousecellsshow: function() //在这可以点格子判断
        {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.cols; j++) {
                    var self = this;
                    (function(row, col) {
                        var td = self.$("mine_" + row + "_" + col);
                        td.onmousedown = function(e) {
                            e = e || window.event; //event获取事件对象
                            //console.log(e.button); //查看鼠标code
                            if (e.button == 2) { //点右键
                                if (this.className == "") {
                                    if (self.markMines == self.mines) return;
                                    this.className = "redFlag";
                                    self.markMines++;

                                } else {
                                    this.className = "";
                                    self.markMines--;
                                }
                                if (self.onmarkMine != null) {
                                    self.onmarkMine(self.mines - self.markMines);
                                }
                            } else if (e.button == 0) {
                                var number = self.cells[row][col];
                                if (this.className == "redFlag") {
                                    alert("已经标了旗，不能左击");
                                    return;
                                }
                                if (number == 9) //是雷
                                {
                                    this.className = "fail";
                                    alert("游戏结束!");
                                    self.defaults();
                                } else {
                                    self.openNumbercells(row, col, number); //数字
                                }
                            } else {
                                alert("你点到滚轮了!");
                            }
                        }
                    })(i, j);
                }
            }
        },
    openNumbercells: function(i, j, number) { //打开数字
        var td = this.$("mine_" + i + "_" + j);
        td.onmousedown = null;
        this.openCells++;
        td.className = "number";
        if (number != 0) {
            td.innerText = number;
        } else {
            this.openNoNumbercells(i, j);
        }
        if (this.openCells + this.mines == this.rows * this.cols) {
            alert("gameWin!");
            this.defaults();
        }
    },
    openNoNumbercells: function(row, col) { //打开自己及周围空格
        for (var i = row - 1; i <= row + 1; i++) {
            for (var j = col - 1; j <= col + 1; j++) {
                if (!(i == row && j == col)) { //排除中间
                    var td = this.$("mine_" + i + "_" + j);
                    if (td && td.className == "") {
                        this.openNumbercells(i, j, this.cells[i][j]);
                    }
                }
            }
        }
    },
    removeMouse: function() { //移除事件
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var td = this.$("mine_" + i + "_" + j);
                td.onmousedown = null;
            }
        }
    },
    end: function() { //结束就停止
        if (this.onGameOver != null) {
            this.onGameOver();
        }
    },
    datas: function(i, j) //打印数据
        {
            console.log("您此局所用时间：" + second.innerText + "秒," + "您此局的总雷数有：" + this.mines + "个," +
                "您标成功在雷上的红旗数有" + this.winmark + "枚," + "您标错的旗子数有" + this.chacuo + "枚," + "您此局标了" +
                this.markMines + "枚旗子" + "还有" + (this.mines - this.markMines) + "枚未标");
        },
    defaults: function() { //表示成功与失败结果
        this.showAll();
        this.removeMouse();
        this.playing = false; //成功与失败都表示结束了 
        this.end();
        this.datas();
    },
    play: function() { //开始按钮点击
        this.markMines = 0;
        this.openCells = 0;
        this.hideAll();
        this.initcells();
        this.playing = true; //点击开始就表示进行
        this.mines = this.getRandom(this.min, this.max);
        this.setMines();
        this.showcount();
        this.mousecellsshow();
        this.end();
        second.innerText = 0; //开始就归零
    },
    //integration: function() { //将方法整合一个方法调用
    //    this.draw();
    //},
}
window.onload = function () {
    var levels = document.getElementsByName("level"); //等级
    for (var k = 0; k < levels.length; k++) {
        levels[k].onclick = function() {
            if (Mine && Mine.playing) {
                alert("游戏还在进行，不能切换！");
                return false;
            }
            minecount.innerHTML = "0";
            var levelValue = parseInt(this.value);
            var min = levelValue;
            var max = min + Math.ceil((min * min * 0.1));
            init(levelValue, levelValue, min, max);
        }
    }
    init(5, 5, 5, 8);
}

function init(row, col, min, max) {
    Mine = new Sweep("lattices", row, col, min, max);
    Mine.draw();
    minecount.innerText = "0";
    second.innerText = "0";
    Mine.onmarkMine = function(count) {
        minecount.innerText = count;
    }
    Mine.onGameOver = function() {
        clearInterval(t);
    }
    start.onclick = function() {
        seconds = minutes = hours = 0;
        if (Mine.playing) {
            if (!confirm("本局游戏尚未结束，是否重新开一局?")) {
                return;
            } else {
                seconds = minutes = hours = 0; //每次开始就清
            }
        }
        Mine.play();
        minecount.innerHTML = Mine.mines;
        t = setInterval(function() {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes += 1;
            }
            if (minutes >= 60) {
                minutes = 0;
                hours += 1;
            }
            second.innerText = hours + "时" + minutes + "分" + seconds;
        }, 1000);
        console.log(Mine.mines);
        console.log(Mine.cells);
    }
    end.onclick = function() {
        if (!Mine.playing) {
            alert("游戏还未开始呢！");
            return;
        }
        Mine.defaults();
    }
    backGround.oncontextmenu = function() { //右键菜单禁止右击
        return false;
    }
}
init();
