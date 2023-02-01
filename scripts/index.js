function Sweep(Container, rows, cols, min, max) {
    this.gameContainer = Container;
    this.rows = rows;
    this.cols = cols;
    this.cells = null;
    this.min = min;
    this.max = max;
    this.mines = 0; //雷数
    this.markMines = 0; //标记雷数
    this.openCells = 0; //成功打开格子数
    //this.onmarkMine = null; //标记地雷操作的回调函数
    this.onGameOver = null; //准备游戏结束时的回调函数
    this.onExit = undefined;
    this.playing = false; //未进行
    this.winmark = 0; //🚩成功排雷
    this.chacuo = 0; //🚩失败排雷
    this.gameState = {
        iswin: false,
        currentState: "EndPage",
        states: ['EndPage', 'Playing', 'Won', 'Lost']
    }
    this.rate = 0; //胜率
    this.blcount = 0; //场次
    this.winSeesion = 0;
    this.loseSeesion = 0;
    this.second = 0;
    this.sv = 0;
}
Sweep.prototype = {
    constructor: Sweep,
    $: function (id) {
        return document.getElementById(id);
    },
    draw: function () {
        var html = "";
        for (var i = 0; i < this.rows; i++) {
            html += "<tr>";
            for (var j = 0; j < this.cols; j++) {
                html += "<td id = 'mine_" + i + "_" + j + "'></td>";
            }
            html += "</tr>";
        }
        this.gameContainer.innerHTML = html;
    },
    initCells: function () {
        this.cells = [];
        for (var i = 0; i < this.rows; i++) {
            this.cells.push([]);
            for (var j = 0; j < this.cols; j++) {
                this.cells[i].push(0);
            }
        }
    },
    getRandom: function (min, max) { //得到级别数~max位随机数
        return min + Math.floor(Math.random() * (max - min + 1));
    },
    getIndex(number) { //从随机数获取索引下标
        return {
            row: Math.floor(number / this.cols),
            col: number % this.cols
        }
    },
    setMines: function () { //设置地雷
        var tempArr = {};
        for (var i = 0; i < this.mines; i++) {
            var number = this.getRandom(0, this.rows * this.cols - 1);
            if (number in tempArr) {
                i--;
            } else {
                tempArr[number] = number;
                var coordinate = this.getIndex(number);
                this.cells[coordinate.row][coordinate.col] = 9;
            }
        }
    },
    setFigures: function () {
        let ss = window.sessionStorage,
            tc,
            dcolor = ['#7c85c1', '#2f6e19', '#af2828', '#f38b00', '#a074c4'];
        if (typeof ss["theme_color"] == "undefined") {
            ss.setItem('theme_color', JSON.stringify(dcolor))
        } else {
            tc = JSON.parse(ss.getItem("theme_color"));
            if (!Array.isArray(tc) || tc.length < 5) {
                tc = dcolor;
            }
        }
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
                var td = this.$("mine_" + i + "_" + j);
                try {
                    if (number == 1) {
                        td.style.color = tc[number - 1]
                    } else if (number == 2) {
                        td.style.color = tc[number - 1]
                    } else if (number == 3) {
                        td.style.color = tc[number - 1]
                    } else if (number == 4) {
                        td.style.color = tc[number - 1]
                    } else if (number == 5) {
                        td.style.color = tc[number - 1]
                    }
                } catch (e) {
                    console.error(e)
                }

                this.cells[i][j] = number;
            }
        }
    },
    showAll: function () {
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
                    } else if (td.className == "qm") {
                        td.className = "mine3";
                    } else {
                        td.className = "mine";
                    }
                }
                else {
                    if (this.sv == 0) {
                        if (cell != 0) {
                            td.innerText = cell;
                        }
                        if (td.className == "redFlag") {
                            td.className = "flagError";
                            this.chacuo++;
                        } else if (td.className == "qm") {
                            td.className = "qmError";
                            this.chacuo++;
                        }
                        else {
                            td.className = "number";
                        }
                    }
                }
            }
        }
    },
    hideAll: function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var td = this.$("mine_" + i + "_" + j);
                td.className = "";
                td.innerText = "";
            }
        }
    },
    mouseCellsShow: function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var self = this;
                (function (row, col) {
                    var td = self.$("mine_" + row + "_" + col);
                    td.onmousedown = function (e) {
                        e = e || window.event;
                        //console.warn(this)
                        if (e.button == 2) { //点右键
                            if (this.className == "") {
                                if (self.markMines == self.mines) return;
                                this.className = "redFlag";
                                self.markMines++;
                            } else if (this.className == "redFlag") {
                                this.className = "qm";
                            } else {
                                this.className = "";
                                self.markMines--;
                            }
                            self.$("marks").innerText = self.markMines
                            /*if (self.onmarkMine != null) {
                                self.onmarkMine(self.mines - self.markMines);
                            }*/
                        } else if (e.button == 0) {
                            var number = self.cells[row][col];
                            if (this.className == "redFlag") {
                                //alert("已经标置了旗帜！");
                                return;
                            } else if (this.className == "qm") {
                                //alert("已经标置了问号！");
                                return;
                            }
                            if (number == 9) {
                                this.className = "fail"
                                self.winRate(false, 'Lost');
                            } else {
                                self.openNumbercells(row, col, number);
                            }
                        } else {
                            alert("你点到滚轮了!");
                        }
                    }
                })(i, j);
            }
        }
    },
    openNumbercells: function (i, j, number) {
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
            this.winRate(true, 'Won');
        }
    },
    openNoNumbercells: function (row, col) { //打开自己及周围空格
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
    removeMouse: function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var td = this.$("mine_" + i + "_" + j);
                td.onmousedown = null;
            }
        }
    },
    winRate: function (iswin, msg = '') {
        if (iswin)
            this.winSeesion++;
        else
            this.loseSeesion++;
        this.rate = Math.floor(this.winSeesion / (this.winSeesion + this.loseSeesion) * 100);
        this.gameState.iswin = iswin;
        this.gameState.currentState = msg;
        alert(msg);
        this.defaults();
    },
    end: function () {
        if (this.onGameOver != null) {
            this.onGameOver();
        }
        this.blcount = this.winSeesion + this.loseSeesion
    },
    datas: function () {
        this.$("djsl").innerHTML = '';
        let template1 = `<p>进行了<b>${this.winSeesion + this.loseSeesion}</b>局,胜率为<b style="color='red'">${this.rate}</b>%</p>`;
        let template2 = `<p>进行了<b>${this.winSeesion + this.loseSeesion}</b>局,胜率为<b style="color='green'">${this.rate}</b>%</p>`;
        if (this.rate < 60) {
            this.$("djsl").innerHTML += template1;
        } else {
            this.$("djsl").innerHTML += template2;
        }
        if (isNaN(this.rate) || this.gameState.iswin) {
            console.log(`第${this.winSeesion + this.loseSeesion}局，WinRate Is：0%`);
            console.log("恭喜你赢了此局！您此局所用时间：" + second.innerText + "秒," + "您此局的总雷数有：" + this.mines + "个," +
            "您标成功在雷上的红旗数有" + this.winmark + "枚," + "您标错的旗子数有" + this.chacuo + "枚," + "您此局标了" +
            this.markMines + "枚旗子" + "还有" + (this.mines - this.markMines) + "枚未标,赢了" + this.winSeesion + "次，输了" + this.loseSeesion + "次");
        }
        else {
            console.log(`第${this.winSeesion + this.loseSeesion}局，WinRate Is：${this.rate}%`);
            console.log("很遗憾你输了此局！您此局所用时间：" + second.innerText + "秒," + "您此局的总雷数有：" + this.mines + "个," +
                "您标成功在雷上的红旗数有" + this.winmark + "枚," + "您标错的旗子数有" + this.chacuo + "枚," + "您此局标了" +
                this.markMines + "枚旗子" + "还有" + (this.mines - this.markMines) + "枚未标,赢了" + this.winSeesion + "次，输了" + this.loseSeesion + "次");
        }
    },
    defaults: function () {
        this.showAll();
        this.removeMouse();
        this.playing = false;
        this.end();
        this.datas();
    },
    play: function () {
        this.hideAll();
        this.playing = true; //进行
        this.markMines = 0;
        this.openCells = 0;
        this.second = 0
        this.$("second").innerText = 0;
        this.$("marks").innerText = 0;
        this.initCells();
        this.mines = this.getRandom(this.min, this.max);
        this.$("minecount").innerText = this.mines;
        this.setMines();
        this.setFigures();
        this.mouseCellsShow();
    }
}
var Mine = null,
    t = null;
document.querySelector("table").oncontextmenu = () => {
    return false;
}
function init(banner, row, col, min, max) {
    Mine = new Sweep(banner, row, col, min, max);
    Mine.draw();
    function start() {
        if (Mine.openCells > 0 && Mine.playing) {
            if (!confirm("本局游戏尚未结束，是否重新开一局?")) {
                return;
            }
        }
        Mine.play();
        t = setInterval(function () {
            Mine.$("second").innerText = ++Mine.second;
        }, 1000);
    }
    Mine.$("start").onclick = start
    set.onchange = function () {
        let set = Mine.$("set")
        Mine.sv = set.options[set.selectedIndex].value;
    }
    /*Mine.onmarkMine = function (count) {
        Mine.$("minecount").innerText = count;
    }*/
    Mine.onGameOver = function () {
        clearInterval(t);
    }
    Mine.$("reset").onclick = null;
}
window.onload = function () {
    let myContainer = document.getElementById("lattice");
    let levels = document.getElementsByName("level");
    for (var k = 0; k < levels.length; k++) {
        levels[0].click();
        levels[k].onclick = function () {
            if (Mine && Mine.playing) {
                alert("游戏还在进行，不能切换！");
                return false;
            }
            var lv = parseInt(this.value);
            var max = lv + Math.ceil((lv * lv * 0.1));
            if (isNaN(lv) || isNaN(max)) {
                init(myContainer, 5, 5, 5, 8);
            } else {
                init(myContainer, lv, lv, lv, max);
            }
        }
    }
}