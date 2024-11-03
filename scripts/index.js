var Mine = null;
function Sweep(lv, Container, rows, cols, min, max) {
    this.lv = lv;
    this.gameContainer = Container;
    this.rows = rows;
    this.cols = cols;
    this.cells = null;
    this.min = min;
    this.max = max;
    this.mines = 0;
    this.markMines = 0; //已标记旗子数
    this.openCells = 0; //打开格子数
    this.onmarkMine = null; //标记地雷操作的回调函数
    this.onGameOver = null; //准备游戏结束时的回调函数
    this.onReset = null;
    this.playing = false;
    this.pause = false,
    this.wMark = 0; //成功排雷数
    this.lMark = 0; //失败排雷数
    this.gameState = {
        isWin: false,
        msg: "",
        states: ['EndPage', 'Playing', 'Win', 'Lost']
    }
    this.rate = 0;
    this.count = 0;
    this.winSeesion = 0;
    this.loseSeesion = 0;
    this.usems = -1;
    this.usesl = false;
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
            }
        }
    },
    setColor(td, number) {
        if (JSON.parse(localStorage.getItem("isColor"))) {
            let c = ['#7c85c1', '#2f6e19', '#af2828', '#f38b00', '#a074c4', '#0099FF', '#f2bdbdfa', '#787171'];
            switch (number) {
                case 1:
                    td.style.color = c[number - 1];
                    break;
                case 2:
                    td.style.color = c[number - 1];
                    break;
                case 3:
                    td.style.color = c[number - 1];
                    break;
                case 4:
                    td.style.color = c[number - 1];
                    break;
                case 5:
                    td.style.color = c[number - 1];
                    break;
                case 6:
                    td.style.color = c[number - 1];
                    break;
                case 7:
                    td.style.color = c[number - 1];
                    break;
                case 8:
                    td.style.color = c[number - 1];
                    break;
                default:
                    break;
            }
        }
    },
    fastPass: function () {
        if (this.playing && this.markMines == 0) {
            for (var i = 0; i < this.rows; i++) {
                for (var j = 0; j < this.cols; j++) {
                    var td = this.$("mine_" + i + "_" + j);
                    var number = this.cells[i][j];
                    if (number == 9) {
                        td.className = "redFlag";
                    }
                }
            }
            this.$("minecount").innerText = "0";
            this.markMines = this.mines;
        } else console.log("当前状态不被允许");
    },
    showAll: function () {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var td = this.$("mine_" + i + "_" + j);
                var number = this.cells[i][j];
                if (number == 9) {
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
                    if (this.usesl) {
                        this.setColor(td, number);
                        if (number != 0) {
                            td.innerText = number;
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
                td.style.color = "";
                td.className = "scaleIn";//调整动画效果，去除className scaleIn
                td.innerText = "";
            }
        }
    },
    mouseCellsShow: function (reset = false) {
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.cols; j++) {
                var self = this, num = 0;// 优化开局点击是雷的游戏体验
                (function (row, col) {
                    var td = self.$("mine_" + row + "_" + col);
                    td.onmousedown = function (e) {
                        //console.warn(this)
                        if (e.button == 0) {//左键
                            var number = self.cells[row][col];
                            if ('ontouchstart' in document.documentElement) {
                                if (this.className == "scaleIn") {
                                    if (self.markMines == self.mines) return;
                                    this.className = "redFlag";
                                    self.markMines++;
                                } else {
                                    this.className = "scaleIn";
                                    self.markMines--;
                                    if (number == 9) {
                                        num += 1;
                                        if (num == 1 && !reset) {
                                            alert(`这把第${num}次点雷，为了你的体验，已更新对局...`);
                                            while (self.cells[row][col] == 9) {
                                                self.initCells();
                                                self.setMines();
                                                self.setFigures();
                                            }
                                            self.openNumbercells(row, col, self.cells[row][col]);
                                            //num = 0;
                                        } else {
                                            this.className = "fail"
                                            self.winInfo(false, '你输了');
                                        }

                                    } else {
                                        num += 1;
                                        self.openNumbercells(row, col, number);
                                    }
                                }
                                if (self.onmarkMine != null) {
                                    self.onmarkMine(self.mines - self.markMines);
                                }
                            } else {
                                if (this.className == "redFlag" || this.className == "qm") {
                                    return;
                                }
                                if (number == 9) {
                                    num += 1;
                                    if (num == 1 && !reset) {
                                        alert(`这把第${num}次点雷，为了你的体验，已更新对局...`);
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
                                        self.winInfo(false, '你输了');
                                    }

                                } else {
                                    num += 1;
                                    self.openNumbercells(row, col, number);
                                }
                            }
                        } else if (e.button == 2) {
                            if (this.className == "scaleIn") {
                                if (self.markMines == self.mines) return;
                                this.className = "redFlag";
                                self.markMines++;
                            } else if (this.className == "redFlag" && JSON.parse(localStorage.getItem("isQm"))) {
                                this.className = "qm";
                                self.markMines--;
                            } else if (this.className == "redFlag") {
                                this.className = "scaleIn";
                                self.markMines--;
                            } else {
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
        this.setColor(td, number);
        td.onmousedown = null;
        this.openCells++;
        td.className = "number";
        if (this.openCells + this.mines == this.rows * this.cols) {
            this.winInfo(true, '你赢了');
        }
        if (number != 0) {
            td.innerText = number;
        } else {
            this.openNoNumbercells(i, j);
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
    winInfo: function (isWin, msg = '') {
        alert(msg);
        if (isWin) this.winSeesion++;
        else this.loseSeesion++;
        if (this.onGameOver != null) {
            this.onGameOver();
        }
        if (JSON.parse(localStorage.getItem("isLocalGameData"))) {
            var key = "myData";
            if (!localStorage.getItem(key)) {
                let data = {};
                data.level0 = data.level1 = data.level2 = data.level3 = [];
                localStorage.setItem(key, JSON.stringify(data));
            } var storedObject = localStorage.getItem(key);
            if (storedObject) {
                var data = JSON.parse(storedObject);
                var ta = [this.lv, isWin, this.rows, this.cols, this.mines, this.$("second").innerText, this.formatDate(), this.cells];
                switch (this.lv) {
                    case "初级":
                        data.level0.push(ta);
                        break;
                    case "中级":
                        data.level1.push(ta);
                        break;
                    case "高级":
                        data.level2.push(ta);
                        break;
                    default:
                        data.level3.push(ta);
                        break;
                }
                localStorage.setItem(key, JSON.stringify(data));
                //xzconsole.log(data);
            }
        }
        this.playing = false;
        this.gameState.isWin = isWin;
        this.gameState.currentState = msg;
        this.count = this.winSeesion + this.loseSeesion
        this.rate = Math.floor(this.winSeesion / (this.winSeesion + this.loseSeesion) * 100);
        this.showAll();
        this.removeMouse();
        console.group(`第${this.count}局“${this.lv}”战报概括。`);
        console.group("对局数据");
        console.info(this.cells);
        console.groupEnd("对局数据");
        console.log(`${msg}！目前胜率为：${this.rate}%\n本局雷数：${this.mines}个，所用时间：${this.$("second").innerText}秒\n成功标记：${this.wMark}枚，标错数量：${this.lMark}枚\n标了${this.markMines}枚，还剩${this.mines - this.markMines}枚。赢${this.winSeesion}次，输${this.loseSeesion}次`);
        console.groupEnd();
        if (this.onReset != null && !isWin && JSON.parse(localStorage.getItem("isEnbleReset"))) {
            this.onReset();
        }
    },
    overView() {
        if (this.playing && this.markMines == 0) {
            this.usesl = true;
            this.showAll();
            this.removeMouse();
            this.playing = false;
            this.onGameOver();
        } else { console.log("不允许查看") }
    },
    play: function (sl = false, reset, cells = null) {
        this.playing = true; //进行
        this.markMines = 0;
        this.usesl = sl ?? this.usesl;
        this.usems = JSON.parse(localStorage.getItem("isUseMs")) ?? this.usems;
        this.wMark = 0;
        this.lMark = 0;
        this.openCells = 0;
        this.$("second").innerText = "0"
        this.hideAll();
        if (cells != null) {
            this.cells = cells;
        }else {
            this.initCells();
            this.setMines();
            this.setFigures();
        }
        this.mouseCellsShow(reset);
    }
}
$(() => {
    var myContainer = $("#lattice"),
        levels = document.querySelectorAll('.radio-btn'), t, s;

    function usems() {
        if (Mine.usems === 1) {
            t = setInterval(function () {
                $("#second").text((parseFloat($("#second").text()) + 0.1).toFixed(1));
            }, 100);
        } else if (Mine.usems === 2) {
            t = setInterval(function () {
                $("#second").text((parseFloat($("#second").text()) + 0.01).toFixed(2));
            }, 10);
        } else {
            t = setInterval(function () {
                s++;
                $("#second").text(s);
            }, 1000);
        }
    }

    function go(r) {
        if (Mine == null || Mine == undefined) {
            alert("请先选择难度级别再开始！");
            return false;
        }
        if (Mine && Mine.playing) {
            alert("本局游戏尚未结束！");
            return false;
        }
        s = 0;
        if (r) Mine.play(true, true, Mine.cells);
        else Mine.play();
        usems();
    }

    function init(lv, Container, row, col, min, max) {
        Mine = new Sweep(lv, Container, row, col, min, max);
        $("#minecount").text("0")
        $("#second").text("0")
        Mine.draw();
        Mine.onmarkMine = function (count) {
            $("#minecount").text(count);
        }
        Mine.onGameOver = function () {
            clearInterval(t);
        }
        Mine.onReset = () => {
            if (confirm("本局游戏已经结束，是否重新再来?")) {
                go(1);
            }
        }
    }

    $("#start").click(() => {
        go();
    });

    $("#restart").click(() => {
        go(1);
    });

    $("#stoped").click(() => {
        if (Mine == null || Mine == undefined) {
            return false;
        }
        if (Mine && !Mine.pause && Mine.playing) {
            Mine.pause = true;
            Mine.onGameOver();
            Mine.removeMouse();
            $("#stoped").val("继续游戏");
        } else if (!Mine.playing) {
            alert("游戏已结束或者未开始！");
        } else {
            Mine.pause = false;
            Mine.mouseCellsShow(1);
            $("#stoped").val("暂停游戏");
            usems();
        }
    });

    $("#night").click(() => {
        $("body").toggleClass("black");
        $("#topbaner").toggleClass("black");
    });

    $('#theme-selector').change(function () {
        var selectedTheme = $(this).val();
        $('#theme-link').attr('href', selectedTheme);
    });

    const ls = {
        isColor: true,
        isEnbleReset: true,
        isLocalGameData: false,
        isQm: false,
        isUseMs: -1
    };

    let row, col, min, max;

    if (Mine == null) {
        for (const key in ls) {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, ls[key]);
            }
        }
        levels[0].classList.add('selected');
        num = 5;
        max = num + Math.ceil((num * num * 0.1));
        init("初级", myContainer, num, num, num, max);
        Mine.mines = max;
        $("#minecount").text(Mine.mines);
    }

    levels.forEach(function (btn, index) {
        let c = ["green", "blue", "orange", "red"]
        btn.style.color = c[index];
        btn.addEventListener('click', function () {
            if (Mine && Mine.playing) {
                alert("游戏还在进行，不能切换！");
                return;
            }
            levels.forEach(function (otherBtn) {
                otherBtn.classList.remove('selected');
            });
            this.classList.add('selected');
            if (this.classList.contains("selected")) {
                if (this.value == "自定义") {
                    row = prompt("请输入行数：");
                    if (row) {
                        col = prompt("请输入列数：");
                        max = parseInt(prompt("请输入雷数："));
                        init(this.value, myContainer, row, col, 0, max);
                        Mine.mines = max;
                    }
                } else if (this.value == "铺满") {
                    row = Math.floor(document.documentElement.clientHeight / 42);
                    col = Math.floor(document.documentElement.clientWidth / 33);
                    max = row + Math.ceil((row * col * 0.1));
                    init(this.value, myContainer, row, col, 0, max);
                    Mine.mines = max;
                } else {
                    min = parseInt(this.dataset.value);
                    max = min + Math.ceil((min * min * 0.1));
                    init(this.value, myContainer, min, min, min, max);
                    Mine.mines = Mine.getRandom(min, max);
                }
                $("#minecount").text(Mine.mines);
                console.clear();
            }
        });
    });

    myContainer.contextmenu(() => {
        return false;
    });
});