"use strict";
import {Field, CLOSED_CELL, FIELD_CELL, FLAG_CELL, FOCUSED_CELL} from './Field.js';



(function() {

    let position;
    const keys = {
        W: "KeyW",
        A: "KeyA",
        S: "KeyS",
        D: "KeyD",
        R: "KeyR",
        Up: "ArrowUp",
        Left: "ArrowLeft",
        Down: "ArrowDown",
        Right: "ArrowRight",
        Space: "Space",
        Enter: "Enter",
        Escape: "Escape"
    }


    let gameStart = true;
    let flags = 30;
    let gameTime = 0;
    let timerId;

    let field = new Field(document.querySelector(".main-block-field"));
    let closedCells = field.SIZE*field.SIZE - (flags >> 1);

    field.field.addEventListener("contextmenu", event=>{ event.preventDefault();});

    addMainListeners();

    const reset = document.querySelector(".reset-btn");
    reset.addEventListener("click", function(event) {
        closeResults();

        gameStart = true;
        flags = 30;
        gameTime = 0;

        field.resetAll();
        addMainListeners();
        this.blur();
    })


    document.querySelector(".close-board-btn").addEventListener("click", closeResults);
    document.addEventListener("keydown", event =>{
        if (event.code === keys.Escape) closeResults();
        else if (event.code === keys.R) restartGame();
    });


    function keyDownHandler(event) {
        if (!position)
            position = {x: 0, y: 0};
        field.getCell(position.x, position.y).classList.remove(FOCUSED_CELL);

        switch (event.code) {
            case keys.W:
            case keys.Up:
                if (position.x > 0)
                    position.x--;
                break;
            case keys.A:
            case keys.Left:
                if (position.y > 0)
                    position.y--;
                break;
            case keys.S:
            case keys.Down:
                if (position.x < field.SIZE - 1)
                    position.x++;
                break;
            case keys.D:
            case keys.Right:
                if (position.y < field.SIZE - 1)
                    position.y++;
                break;
        }

        let cell = field.getCell(position.x, position.y);
        cell.classList.add(FOCUSED_CELL);

        if (event.code === keys.Enter || event.code === keys.Space) {
            field.field.dispatchEvent(new CustomEvent('game-turn', { 
                detail: {
                    ctrlKey: event.ctrlKey,
                    type: event.type,
                    target: cell,
                    position: {
                        x: position.x,
                        y: position.y
                    }
                }
            }));
        }

    }



    function clickHandler(event) {
        field.field.dispatchEvent(new CustomEvent('game-turn', { 
            detail: {
                ctrlKey: event.ctrlKey,
                type: event.type,
                target: event.target,
                position: getPosition(event.target)
            }
        }));

    }

    function contextHandler (event) {

        field.field.dispatchEvent(new CustomEvent('game-turn', { 
            detail: {
                ctrlKey: event.ctrlKey,
                type: event.type,
                target: event.target,
                position: getPosition(event.target)
            }
        }));
    }

    function mouseOverHandler(event) {
        const target = event.target;
        if (target.classList.contains(FIELD_CELL)) {
            updatePosition(target);
        }
    }


    function openCell(event) {
        
        let position = event.detail.position;

        if (gameStart) {
            // start game-time
            gameStart = false;
            field.field.dispatchEvent(new CustomEvent("game-start", {
                detail: {
                    ctrlKey: event.ctrlKey,
                    type: event.type,
                    position: position
                }
            }));
            setTimer();

        }

        let isOpened = field.openArea(position.x, position.y);
        if (isOpened === -1 || field.openedCells === closedCells) {

            field.field.dispatchEvent(new CustomEvent("game-end", {
                detail: {
                    ctrlKey: event.ctrlKey,
                    type: event.type,
                    isWinner: field.openedCells === closedCells
                }
            }));          
                
        }
    }


    function setFlag(cell) {
        updatePosition(cell);

        if (gameTime === 0)
            setTimer();
        const gotFlag = cell.classList.contains(FLAG_CELL);
        const flagAmount = +document.querySelector(".flags-amount").textContent;

        if (gotFlag) {
            cell.classList.remove(FLAG_CELL);
            cell.classList.add(CLOSED_CELL);
            flags++;
        } else if (flagAmount > 0) {
            cell.classList.remove(CLOSED_CELL);
            cell.classList.add(FLAG_CELL);
            flags--;
        }
    }


    function updatePosition(target) {
        if (!position)
            position = {x: 0, y: 0};
        field.getCell(position.x, position.y).classList.remove(FOCUSED_CELL);
        position = getPosition(target);
        field.getCell(position.x, position.y).classList.add(FOCUSED_CELL);
    }

    function getPosition(elem) {
        let position = {};

        for (let x = 0; x < field.SIZE; x++)
            for (let y = 0; y < field.SIZE; y++)
                if (elem === field.getCell(x, y)) {
                    position.x = x;
                    position.y = y;
                    return position;
                }
    }

    function restartGame() {
        closeResults();

        clearInterval(timerId);
        removeMainListeners();

        gameStart = true;
        flags = 30;
        gameTime = 0;

        field.resetAll();
        addMainListeners();
    }

    function removeMainListeners() {
        field.field.removeEventListener('click', clickHandler);
        field.field.removeEventListener("contextmenu", contextHandler);
        field.field.removeEventListener("mouseover", mouseOverHandler);
        document.removeEventListener("keydown", keyDownHandler);
    }

    function addMainListeners() {
        field.field.addEventListener("click", clickHandler);
        field.field.addEventListener('contextmenu', contextHandler);
        field.field.addEventListener("mouseover", mouseOverHandler);
        document.addEventListener("keydown", keyDownHandler);
    }

    function setTimer() {
        const timeSpan = document.querySelector(".game-time");
        timeSpan.textContent = gameTime;
        if (gameTime === 0)
            timerId = setInterval(()=> {
                timeSpan.textContent = ++gameTime;
            }, 1000);
    }

    function showResults(isWinner) {

        const board = document.querySelector(".result-board");

        board.classList.remove("active-result-board");
        const title = board.querySelector(".main-result");
        if (isWinner)
            title.textContent = "Поздравляю, сегодня Вы не подорвались! :)";
        else
            title.textContent = "Долго Вас собирали по кусочкам...";

        let time = +document.querySelector(".game-time").textContent;
        const hh = Math.floor(time/3600);
        const mm = Math.floor(time/60%60);
        const ss = Math.floor(time%60);
        time = (hh < 10 ? '0' : "") + hh + ":" +
            (mm < 10 ? '0' : "") + mm + ":" +
            (ss < 10 ? '0' : "") + ss;
        board.querySelector(".time-result-value").textContent = time;
        board.querySelector(".cell-amount-result").textContent = field.openedCells + " из " + closedCells;
    }

    function closeResults() {
        return document.querySelector(".result-board").classList.add("active-result-board");
    }


    field.field.addEventListener("game-turn", function(event) {
        let target = event.detail.target;
        if (event.detail.type == "contextmenu" || 
            (event.detail.type == "keydown" && event.detail.ctrlKey)) {
            if (target.classList.contains(CLOSED_CELL) ||
                target.classList.contains(FLAG_CELL)) {

                setFlag(target);
                document.querySelector(".flags-amount").textContent = flags;
            }
        } else if (target.classList.contains(FIELD_CELL) &&
                   target.classList.contains(CLOSED_CELL)) {

            openCell(event);
        }
    });

    field.field.addEventListener("game-start", function(event) {
        field.setBombs(event.detail.position.x, event.detail.position.y, flags >> 1);
        document.querySelector(".flags-amount").textContent = flags;

    });

    field.field.addEventListener("game-end", function(event) {
        clearInterval(timerId);
        removeMainListeners();
        setTimeout(() => { 
            showResults(event.detail.isWinner) 
        }, 500);
    });

}());
