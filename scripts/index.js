var Mine = null, t = null, s;
function Sweep(lv, Container, rows, cols, min, max) {
    this.lv = lv;
    this.gameContainer = Container;
    this.rows = rows;
    this.cols = cols;
    this.cells = null;
    this.min = min;
    this.max = max;
    this.mines = 0; //雷数
    this.markMines = 0; //已标记旗子数
    this.openCells = 0; //打开格子数
    this.onmarkMine = null; //标记地雷操作的回调函数
    this.onGameOver = null; //准备游戏结束时的回调函数
    this.playing = false;
    this.wMark = 0; //成功排雷数
    this.lMark = 0; //失败排雷数
    this.gameState = {
        isWin: false,
        msg: "",
        states: ['EndPage', 'Playing', 'Won', 'Lost', { isplaying: false }]
    }
    this.rate = 0; //胜率
    this.count = 0; //场次
    this.winSeesion = 0;
    this.loseSeesion = 0;
    this.sw = false;
    this.isLocalGameData = false; //保存游戏数据到本地
    this.isQm = false; //❓使用问号
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
                html += "<td id = 'mine_" + i + "_" + j + "' ></td>";
            }
            html += "</tr>";
        }
        this.gameContainer.html(html);
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
    setFigures: function () { //设置数字
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
                var td = this.$("mine_" + i + "_" + j);
                let c = ['#7c85c1', '#2f6e19', '#af2828', '#f38b00', '#a074c4'];
                switch (number) {
                    case 1:
                        td.style.color = c[number - 1]
                        break;
                    case 2:
                        td.style.color = c[number - 1]
                        break;
                    case 3:
                        td.style.color = c[number - 1]
                        break;
                    case 4:
                        td.style.color = c[number - 1]
                        break;
                    case 5:
                        td.style.color = c[number - 1]
                        break;
                    default:
                        //td.style.color = "black"
                        break;
                }
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
                        this.wMark++;
                    } else if (td.className == "fail") {
                        td.className = "mine2";
                    } else if (td.className == "qm") {
                        td.className = "mine3";
                        // this.wMark++;
                    } else {
                        td.className = "mine";
                    }
                }
                else {
                    if (td.className == "redFlag")
                        this.lMark++;
                    if (this.sw) {
                        if (cell != 0) {
                            td.innerText = cell;
                        }
                        if (td.className == "redFlag") {
                            td.className = "flagError";
                        } else if (td.className == "qm") {
                            td.className = "qmError";
                            // this.lMark++;
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
        // 为每行添加渐入动画  
        var delay = 50; // 初始延迟 
        for (var i = 0; i < this.rows; i++) {
            // 设置setTimeout的延迟，以实现逐行效果  
            setTimeout(function (row) {
                return function () {
                    // 选择当前行的所有td并添加fadeIn类以触发动画  
                    var tds = document.querySelectorAll('#lattice tr:nth-child(' + (row + 1) + ') td');
                    tds.forEach(function (td) {
                        td.classList.add('scaleIn');
                    });
                };
            }(i), delay);

            // 为下一行增加延迟  
            delay += 100; // 例如，每行之间延迟500毫秒  
            for (var j = 0; j < this.cols; j++) {
                var td = this.$("mine_" + i + "_" + j);
                td.className = "scaleIn";
                td.innerText = "";
            }
        }
    },
    mouseCellsShow: function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var self = this, num = 0;// 优化开局点击是雷的游戏体验
                (function (row, col) {
                    var td = self.$("mine_" + row + "_" + col);
                    td.onmousedown = function (e) {
                        //console.warn(this)
                        if (e.button == 0) {//左键
                            var number = self.cells[row][col];
                            if (this.className == "redFlag" || this.className == "qm") {
                                return;
                            }
                            if (number == 9) {
                                num += 1;
                                if (num == 1) {
                                    console.log(`这把第${num}次点雷，为了你的体验，已重新设置...`);
                                    self.initCells();
                                    self.setMines();
                                    self.setFigures();
                                    while (self.cells[row][col] == 9) {
                                        self.initCells();
                                        self.setMines();
                                        self.setFigures();
                                    }
                                    self.openNumbercells(row, col, self.cells[row][col]);
                                    //num = 0;
                                } else {
                                    this.className = "fail"
                                    self.winRate(false, '你输了');
                                }

                            } else {
                                num += 1;
                                self.openNumbercells(row, col, number);
                            }
                        } else if (e.button == 2) {
                            if (this.className == "scaleIn") {
                                if (self.markMines == self.mines) return;
                                this.className = "redFlag";
                                self.markMines++;
                            } else if (this.className == "redFlag" && self.isQm) {
                                this.className = "qm";
                                self.markMines--;
                            } else if(this.className =="redFlag"){
                                this.className = "scaleIn";
                                self.markMines--;
                            }else{
                                this.className = "scaleIn";
                            }
                            if (self.onmarkMine != null) {
                                self.onmarkMine(self.mines - self.markMines);
                            }
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
            this.winRate(true, '你赢了');
        }
    },
    openNoNumbercells: function (row, col) { //打开自己及周围空格
        for (var i = row - 1; i <= row + 1; i++) {
            for (var j = col - 1; j <= col + 1; j++) {
                if (!(i == row && j == col)) { //排除中间
                    var td = this.$("mine_" + i + "_" + j);
                    if (td && td.className == "scaleIn") {
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
    formatDate(ReturnTime = true, date = new Date()) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0'); // 使用padStart来确保月份始终是两位数
        let day = date.getDate().toString().padStart(2, '0'); // 同样确保日期始终是两位数
        if (ReturnTime) {
            let hours = date.getHours().toString().padStart(2, '0');
            let minutes = date.getMinutes().toString().padStart(2, '0');
            let seconds = date.getSeconds().toString().padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }
        else return `${year}-${month}-${day}`;
    },
    end: function (msg) {
        if (this.onGameOver != null) {
            this.onGameOver();
        }
        this.count = this.winSeesion + this.loseSeesion
        if (this.isLocalGameData) {
            var key = "myData";
            if (!localStorage.getItem(key)) {
                let data = {};
                data.level1 = [];
                data.level2 = [];
                data.level3 = [];
                localStorage.setItem(key, JSON.stringify(data));
            } var storedObject = localStorage.getItem(key);
            if (storedObject) {
                var data = JSON.parse(storedObject);
                var ta = [this.gameState.isWin, this.mines, this.$("second").innerText, this.formatDate(), this.cells]
                switch (this.lv) {
                    case "简易":
                        data.level1.push(ta)
                        localStorage.setItem(key, JSON.stringify(data))
                        break;
                    case "中等":
                        data.level2.push(ta)
                        localStorage.setItem(key, JSON.stringify(data))
                        break;
                    case "困难":
                        data.level3.push(ta)
                        localStorage.setItem(key, JSON.stringify(data))
                        break;
                    default:
                        break;
                }
                console.log(data);
            }
        }
        console.group(`第${this.count}局”${this.lv}“战报概括。`)
        console.group("详情")
        console.info(this.cells);
        console.groupEnd("详情");
        console.log(`${msg}！目前胜率为：${this.rate}%\n本局雷数：${this.mines}个，所用时间：${this.$("second").innerText}秒\n成功标记：${this.wMark}枚，标错数量：${this.lMark}枚\n标了${this.markMines}枚，还剩${this.mines - this.markMines}枚。赢${this.winSeesion}次，输${this.loseSeesion}次`);
        console.groupEnd();
    },
    winRate: function (isWin, msg = '') {
        if (isWin)
            this.winSeesion++;
        else
            this.loseSeesion++;
        this.rate = Math.floor(this.winSeesion / (this.winSeesion + this.loseSeesion) * 100);
        this.gameState.isWin = isWin;
        this.gameState.currentState = msg;
        alert(msg);
        this.showAll();
        this.removeMouse();
        this.playing = false;
        this.end(msg);
    },
    play: function (sw = false, cells = null) {
        this.playing = true; //进行
        this.markMines = 0;
        this.sw = this.sw ?? sw;
        this.isLocalGameData = JSON.parse(localStorage.getItem("isLocalGameData")) ?? this.isLocalGameData;
        this.wMark = 0;
        this.lMark = 0;
        this.openCells = 0;
        this.$("second").innerText = "0"
        this.hideAll();
        if (cells != null) {
            this.cells = cells;
        } else {
            this.initCells();
            this.mines = this.getRandom(this.min, this.max);
            this.setMines();
            this.setFigures();
        }
        this.mouseCellsShow();
    }
}
$(() => {
    var myContainer = $("#lattice"),
        levels = document.querySelectorAll('.radio-btn');
    function go(sw, cells) {
        if (Mine.playing) {
            // if (!confirm("本局游戏尚未结束，是否重新开一局?")) {
            //     return;
            // }
            return;
        }
        s = 0;
        Mine.play(sw, cells);
        $("#minecount").text(Mine.mines);
        t = setInterval(function () {
            s++;
            $("#second").text(s);
        }, 1000);
    }
    function init(lv, Container, row, col, min, max) {
        Mine = new Sweep(lv, Container, row, col, min, max);
        $("#minecount").text("0")
        $("#second").text("0")
        Mine.draw();
        $("#start").click(() => {
            go();
        });
        $("#reset").click(() => {
            go(true, Mine.cells)

        });
        Mine.onmarkMine = function (count) {
            $("#minecount").text(count);
        }
        Mine.onGameOver = function () {
            clearInterval(t);
        }
    }

    if (!localStorage.getItem("isQm") || !localStorage.getItem("isLocalGameData")) {
        let set = {
            "isQm": false,
            "isLocalGameData": false
        }
        for (let key in set) {
            localStorage.setItem(key, set[key])
        }
    }
    levels.forEach(function (btn, index) {
        let c = ["green", "blue", "red"]
        btn.style.color = c[index];
        btn.addEventListener('click', function () {
            if (Mine && Mine.playing) {
                alert("游戏还在进行，不能切换！");
                return;
            }
            levels.forEach(function (otherBtn) {
                otherBtn.classList.remove('selected');
            });
            // 设置当前按钮为“选中”状态
            this.classList.add('selected');
            if (this.classList.contains("selected")) {
                var min = parseInt(this.dataset.value);
                var max = min + Math.ceil((min * min * 0.1));
                init(this.value, myContainer, min, min, min, max);
                console.clear();
            }
        });
    });
    myContainer.contextmenu(() => {
        return false;
    });
}); 