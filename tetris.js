var tetris = {
    /**
     * The canvas context
     * @type object
     */
    ctx: null,

    /**
     * The map
     * @type array
     */
    map: [],

    /**
     * Ticker
     * @type object
     */
    interval: null,

    /**
     * The current block
     * @type array
     */
    currentBlock: null,

    /**
     * Current block position
     * @type array
     */
    currentBlockPos: [0, 0],

    /**
     * Available blocks
     * @type array
     */
    blocks: [
        [
            // I
            [1],
            [1],
            [1],
            [1]
        ],
        [
            // T
            [2, 2, 2],
            [0, 2, 0]
        ],
        [
            // J
            [3, 3, 3],
            [0, 0, 3]
        ],
        [
            // L
            [4, 4, 4],
            [4, 0, 0]
        ],
        [
            // Z
            [5, 5, 0],
            [0, 5, 5]
        ],
        [
            // S
            [0, 6, 6],
            [6, 6, 0]
        ],
        [
            // O
            [7, 7],
            [7, 7]
        ]
    ],

    /**
     * Colours
     * @type array
     */
    colours: [
        "",
        "rgba(38, 118, 217, 1)",
        "rgba(40, 174, 22, 1)",
        "rgba(244, 247, 18, 1)",
        "rgba(113, 207, 251, 1)",
        "rgba(240, 82, 82, 1)",
        "rgba(174, 50, 220, 1)",
        "rgba(243, 157, 33, 1)"
    ],

    /**
     * Score
     * @type integer
     */
    score: 0,

    /**
     * On score change
     * @type closure
     */
    onscorechange: null,

    /**
     * Start
     * @return void
     */
    start: function() {
        this.ctx = document.getElementById('canvas').getContext('2d');

        document.onkeydown = function(event) {
            if (event.keyCode == 37) {
                tetris.moveLeft();
            } else if (event.keyCode == 39) {
                tetris.moveRight();
            } else if(event.keyCode == 38) {
                tetris.rotate();
            } else if(event.keyCode == 40) {
                tetris.drop();
            }
        }

        // Create the map
        this.map = this.createMap();
        this.currentBlock = this.getBlock();
        this.draw();
        this.createInterval(250);
    },

    /**
     * Score
     * @param integer score
     */
    addScore: function(score) {
        this.score = this.score + score;

        if (this.onscorechange !== null) {
            this.onscorechange(this.score);
        }
    },

    /**
     * Create interval
     * @return void
     */
    createInterval: function(speed) {
        clearInterval(this.interval);

        this.interval = setInterval(function() {
            if (tetris.checkCollision()) {
                tetris.checkFullLine();

                //clearInterval(tetris.interval);
                tetris.currentBlockPos = [0, 0];
                tetris.currentBlock = tetris.getBlock();
            } else {
                tetris.currentBlockPos[0] = tetris.currentBlockPos[0] + 1;
            }

            tetris.draw();
        }, speed);
    },

    /**
     * Get block
     * @return void
     */
    getBlock: function() {
        var block = Math.floor(Math.random() * 7);
        return this.blocks[block];
    },

    /**
     * Create map
     * @return array
     */
    createMap: function() {
        var map = [];

        for (i = 0; i < 16; i++) {
            map[i] = [];

            for (c = 0; c < 10; c++) {
                map[i][c] = 0;
            }
        }

        return map;
    },

    /**
     * Get map
     * @return array
     */
    getMap: function() {
        var map = [];

        // Clone map
        for (i = 0; i < this.map.length; i++) {
            map[i] = [];

            for (c = 0; c < this.map[i].length; c++) {
                map[i][c] = this.map[i][c];
            }
        }

        // Add current block to map
        for (i = 0; i < this.currentBlock.length; i++) {
            for (c = 0; c < this.currentBlock[i].length; c++) {
                if (this.currentBlock[i][c] !== 0) {
                    map[i + this.currentBlockPos[0]][c + this.currentBlockPos[1]] = this.currentBlock[i][c];
                }
            }
        }

        return map;
    },

    /**
     * Draw
     * @return void
     */
    draw: function() {
        tetris.ctx.clearRect(0, 0, 300 , 480);

        map = this.getMap();

        // Draw
        for (i = 0; i < map.length; i++) {
            for (c = 0; c < map[i].length; c++) {
                if (map[i][c] !== 0) {
                    this.ctx.fillStyle = this.colours[map[i][c]];
                    this.ctx.fillRect(c * 30, i * 30, 30, 30);

                    this.ctx.strokeStyle = "black";
                    this.ctx.strokeRect(c * 30, i * 30, 30, 30);
                }
            }
        }
    },

    /**
     * Move right
     * @return void
     */
    moveRight: function() {
        var y = this.currentBlockPos[0];
        var x = this.currentBlockPos[1];
        var height = this.currentBlock.length;
        var width = this.currentBlock[0].length;

        if ((x + width) >= 10) {
            return;
        }

        for (i = 0; i < height; i++) {
            if (this.currentBlock[i][width - 1] !== 0 && this.map[y + i][x + width] !== 0) {
                return;
            }
        }

        this.currentBlockPos[1]++;
        this.draw();
    },

    /**
     * Move left
     * @return void
     */
    moveLeft: function() {
        var y = this.currentBlockPos[0];
        var x = this.currentBlockPos[1];
        var height = this.currentBlock.length;
        var width = this.currentBlock[0].length;

        if (x <= 0) {
            return;
        }

        // THIS IS NOT WORKING PROPERLY
        // TODO: fix
        for (i = 0; i < height; i++) {
            if (this.currentBlock[i][0] !== 0 && this.map[y + i][x - 1] !== 0) {
                return;
            }
        }

        this.currentBlockPos[1]--;
        this.draw();
    },

    /**
     * Rotate
     * @return void
     */
    rotate: function() {
        var currentBlock = this.currentBlock;
        var height = currentBlock[0].length;
        var width = currentBlock.length;
        var newBlock = [];

        for (i = 0; i < height; i++) {
            newBlock[i] = [];

            for (c = 0; c < width; c++) {
                newBlock[i][c] = 0;
            }
        }

        for (i = 0; i < currentBlock.length; i++) {
            for (c = 0; c < currentBlock[i].length; c++) {
                newBlock[c][Math.abs(i - width)] = currentBlock[i][c];
            }
        }

        for (i = 0; i < newBlock.length; i++) {
            newBlock[i].shift();
        }

        this.currentBlock = newBlock;
        this.draw();
    },

    /**
     * Drop
     * @return void
     */
    drop: function() {
        while (this.currentBlockPos[0] !== 15) {
            if (this.checkCollision()) {
                return;
            }

            this.currentBlockPos[0]++;
            this.draw();
        }
    },

    /**
     * Check collision
     * @return void
     */
    checkCollision: function() {
        var collided = false;

        for (i = 0; i < this.currentBlock.length; i++) {
            for (c = 0; c < this.currentBlock[i].length; c++) {
                if (i + this.currentBlockPos[0] >= 15) {
                    collided = true;
                    break;
                } else if(this.currentBlock[i][c] !== 0) {
                    var x = this.currentBlockPos[1] + c;
                    var y = this.currentBlockPos[0] + i + 1;

                    if (typeof this.map[y] !== "undefined" && this.map[y][x] !== 0) {
                        collided = true;
                        break;
                    }
                }
            }
        }

        // If the block has collided, add it to the map
        if (collided) {
            for (i = 0; i < this.currentBlock.length; i++) {
                for (c = 0; c < this.currentBlock[i].length; c++) {
                    if (this.currentBlock[i][c] !== 0) {
                        this.map[i + this.currentBlockPos[0]][c + this.currentBlockPos[1]] = this.currentBlock[i][c];
                    }
                }
            }
        }

        return collided;
    },

    /**
     * Check full line
     * @return bool
     */
    checkFullLine: function() {
        var combo = 0;

        for (i = 0; i < this.map.length; i++) {
            var full = true;

            for (c = 0; c < this.map[i].length; c++) {
                if (this.map[i][c] == 0) {
                    full = false;
                    break;
                }
            }

            if (full) {
                this.map.splice(i, 1);
                this.map.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

                switch (combo) {
                    case 0:
                        this.addScore(10);
                        break;

                    case 1:
                        this.addScore(12);
                        break;

                    case 2:
                        this.addScore(15);
                        break;

                    case 3:
                        this.addScore(20);
                        break;
                }

                combo++;
            }
        }
    }
};

tetris.start();