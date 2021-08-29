"use strict";

const CLOSED_CELL = "closed-field-cell";
const FIELD_CELL = "field-cell";
const FIELD_LINE = "field-line";
const FLAG_CELL = "flag";
const FOCUSED_CELL = "focused-cell";


export class Field {

    constructor(field, size = 12) {
        this.SIZE = size;
        this.field = field;
        this.fieldArray = [0];
        this.BOMB = -1;
        this.openedCells = 0;
        this.generateField();
    }

    generateField() {
        for (let i = 0; i < this.SIZE; i++) {
            let line = document.createElement("div");
            line.classList.add(FIELD_LINE);
            this.fieldArray[i] = [0];

            for (let j = 0; j < this.SIZE; j++) {
                let fieldCell = document.createElement("div");
                fieldCell.classList.add(FIELD_CELL, CLOSED_CELL);
                line.append(fieldCell);
                this.fieldArray[i][j] = 0;
            }
            this.field.append(line);
        }
    }

    setBombs(x, y, bombs = 15) {
        if (x < 0 || y < 0 || x >= this.SIZE || y >= this.SIZE)
            return;

        while (bombs--) {
            let row = getRandom(this.SIZE);
            let col = getRandom(this.SIZE);
            while (!this.isEmpty(row, col) || row == x && col == y) {
                row = getRandom(this.SIZE);
                col = getRandom(this.SIZE);
            }
            this.fieldArray[row][col] = this.BOMB;
            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++) {
                    if (row + i < 0 || row + i >= this.SIZE ||
                        col + j < 0 || col + j >= this.SIZE ||
                        (i == 0 && j == 0))
                        continue;
                    if (this.isEmpty(row + i, col + j))
                        this.fieldArray[row + i][col + j] += 1;
                }
        }
    }

    getCell(x, y) {
        return this.field.children[x].children[y];
    }

    openArea(x, y) {
        if (x < 0 || y < 0 || x >= this.SIZE || y >= this.SIZE)
            return;
        if (!this.isEmpty(x, y)) {
            this.openBombs();
            return -1;
        }
        let queue = [[x, y]];
        // let row, col;
        while (queue.length) {
            x = queue.shift();
            y = x[1];
            x = x[0];
            if (this.isEmpty(x, y) && this.fieldArray[x][y] &&
                !this.getCell(x, y).classList.contains(FLAG_CELL))
                this.openCell(x, y);
            else {
                for (let i = -1; i <= 1; i++)
                    if (x + i >= 0 && x + i < this.SIZE)
                        for (let j = -1; j <= 1; j++)
                            if (y + j >= 0 && y + j < this.SIZE &&
                                this.getCell(x + i, y + j).classList.contains(CLOSED_CELL) &&
                                this.isEmpty(x + i, y + j)) {
                                    
                                this.openCell(x + i, y + j);
                                if (this.fieldArray[x + i][y + j] == 0)
                                    queue.push([x + i, y + j]);
                            }
            }          
        }
        return 1;
    }

    openCell(x, y) {
        const cell = this.getCell(x, y);
        cell.classList.remove(CLOSED_CELL);
        
        if (!this.isEmpty(x, y)) {
            cell.classList.remove(FLAG_CELL);
            cell.classList.add("bomb");
        } else {
            switch (this.fieldArray[x][y]) {
                case 1:
                    cell.classList.add("one");
                    break;
                case 2:
                    cell.classList.add("two");
                    break;
                case 3: 
                    cell.classList.add("three");
                    break;
                case 4: 
                    cell.classList.add("four");
                    break;
                case 5: 
                    cell.classList.add("five");
                    break;
                case 6:
                    cell.classList.add("six");
                    break;
                case 7: 
                    cell.classList.add("seven");
                    break;
                case 8: 
                    cell.classList.add("eight");
                    break;
                default: break;
            }
            if (this.fieldArray[x][y])
                cell.innerText = this.fieldArray[x][y];
            this.openedCells++;
            
        }
        
    }

    openBombs() {
        for (let i = 0; i < this.SIZE; i++)
            for (let j = 0; j < this.SIZE; j++)
                if (!this.isEmpty(i, j))
                    this.openCell(i, j);
            
    }

    isEmpty(x, y) {
        return this.fieldArray[x][y] !== this.BOMB;
    }

    print() {
        console.log(this.fieldArray);
    }

    resetAll() {
        for (let i = 0; i < this.SIZE; i++)
            for (let j = 0; j < this.SIZE; j++) {
                const cell = this.getCell(i, j);
                cell.className = FIELD_CELL + " " + CLOSED_CELL;

                cell.innerText = "";
                this.fieldArray[i][j] = 0;
            }
        this.openedCells = 0;
    }
}

function getRandom(n) {
    return Math.floor(Math.random() * n);
}

export {CLOSED_CELL, FIELD_CELL, FLAG_CELL, FOCUSED_CELL};