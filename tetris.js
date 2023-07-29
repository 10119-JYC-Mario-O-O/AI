const playground = document.querySelector('.playground > ul');
const gameText = document.querySelector('.game-text');
const scoreDisplay = document.querySelector('.score');
const retryButton = document.querySelector('.game-text > button');

const matrix_height = 20;
const matrix_width = 10;

const BLOCKS = {
    O: [
        [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ],
        [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ],
        [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ],
        [
            [0, 0],
            [0, 1],
            [1, 0],
            [1, 1],
        ],
    ],

    I: [
        [
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
        ],
        [
            [2, -1],
            [2, 0],
            [2, 1],
            [2, 2],
        ],
        [
            [1, 0],
            [2, 0],
            [3, 0],
            [4, 0],
        ],
        [
            [2, -1],
            [2, 0],
            [2, 1],
            [2, 2],
        ],
    ],

    T: [
        [
            [2, 1],
            [0, 1],
            [1, 0],
            [1, 1],
        ],
        [
            [2, 1],
            [1, 2],
            [1, 0],
            [1, 1],
        ],
        [
            [1, 2],
            [0, 1],
            [2, 1],
            [1, 1],
        ],
        [
            [1, 2],
            [0, 1],
            [1, 0],
            [1, 1],
        ],
    ],

    Z: [
        [
            [0, 0],
            [1, 0],
            [1, 1],
            [2, 1],
        ],
        [
            [0, 1],
            [1, 0],
            [1, 1],
            [0, 2],
        ],
        [
            [0, 1],
            [1, 1],
            [1, 2],
            [2, 2],
        ],
        [
            [2, 0],
            [2, 1],
            [1, 1],
            [1, 2],
        ],
    ],

    L: [
        [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 2],
            [0, 2],
        ],
        [
            [0, 1],
            [1, 1],
            [2, 1],
            [2, 2],
        ],
        [
            [1, 0],
            [2, 0],
            [1, 1],
            [1, 2],
        ],
    ],

    J: [
        [
            [1, 0],
            [2, 0],
            [1, 1],
            [1, 2],
        ],
        [
            [0, 0],
            [0, 1],
            [1, 1],
            [2, 1],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 2],
            [0, 2],
        ],
        [
            [0, 1],
            [1, 1],
            [2, 1],
            [2, 2],
        ],
    ],
};

const MovingItem = {
    type: 'T',
    direction: 0,
    top: 0,
    left: 3,
};

let score = 0;
let duration = 500;
let downInterval;
let tempMovingItem;

function prependNewLine(i) {
    const li = document.createElement('li');
    const ul = document.createElement('ul');

    for (let j = 0; j < matrix_width; j++) {
        const matrix = document.createElement('li');
        matrix.classList.add((matrix_width * matrix_height ) - ((i + 1) * matrix_width) + (matrix_width - j));
        ul.prepend(matrix);
    }

    li.prepend(ul);
    playground.prepend(li);
}

function init() {
    score = 0;

    tempMovingItem = { ...MovingItem };

    for (let i = 0; i < matrix_height; i++) {
        prependNewLine(i);
    }

    generateNewBlock();
}

function renderBlocks(moveType = '') {
    const { type, direction, top, left } = tempMovingItem;
    const movingBlocks = document.querySelectorAll('.moving');

    movingBlocks.forEach((moving) => {
        moving.classList.remove(type, 'moving');
    });

    BLOCKS[type][direction].some((block) => {
        const x = block[0] + left;
        const y = block[1] + top;
        const target = playground.childNodes[y] ? playground.childNodes[y].childNodes[0].childNodes[x] : null;
        const isAvailable = checkEmpty(target);

        if (isAvailable) {
            target.classList.add(type, 'moving');
        } else {
            tempMovingItem = { ...MovingItem };

            if (moveType === 'retry') {
                clearInterval(downInterval);

                showGameOverText();
            }

            setTimeout(() => {
                renderBlocks('retry');

                if (moveType === 'top') {
                    seizeBlock();
                }
            }, 0);

            return true;
        }
    });

    MovingItem.left = left;
    MovingItem.top = top;
    MovingItem.direction = direction;

    scoreDisplay.innerText = score;
}

function seizeBlock() {
    const movingBlocks = document.querySelectorAll('.moving');

    movingBlocks.forEach((moving) => {
        moving.classList.remove('moving');
        moving.classList.add('seized');
    });

    checkMatch();
}

function checkMatch() {
    const childNodes = playground.childNodes;

    childNodes.forEach((child) => {
        let matched = true;

        child.children[0].childNodes.forEach((li) => {
            if (!li.classList.contains('seized')) {
                matched = false;
            }
        });

        if (matched) {
            child.remove();

            prependNewLine();

            score += 10;
        }
    });

    generateNewBlock();
}

function generateNewBlock() {
    clearInterval(downInterval);

    downInterval = setInterval(() => {
        moveBlock('top', 1);
    }, duration);

    const blockArray = Object.entries(BLOCKS);
    const randomIndex = Math.floor(Math.random() * blockArray.length);

    MovingItem.type = blockArray[randomIndex][0];
    MovingItem.top = 0;
    MovingItem.left = 3;
    MovingItem.direction = 0;

    tempMovingItem = { ...MovingItem };

    renderBlocks();
}
function checkEmpty(target) {
    if (!target || target.classList.contains('seized')) {
        return false;
    }

    return true;
}

function moveBlock(moveType, amount) {
    tempMovingItem[moveType] += amount;
    renderBlocks(moveType);
}

function changeDirection() {
    const direction = tempMovingItem.direction;

    direction === 3 ? (tempMovingItem.direction = 0) : (tempMovingItem.direction += 1);

    renderBlocks();
}

function dropBlock() {
    clearInterval(downInterval);

    downInterval = setInterval(() => {
        moveBlock('top', 1);
        score += 2;
    }, 10);
}

function showGameOverText() {
    gameText.style.display = 'flex';
}

document.addEventListener('keydown', (e) => {
    switch (e.keyCode) {
        case 32:
            dropBlock();
            break;

        case 37:
            moveBlock('left', -1);
            break;

        case 38:
            changeDirection();
            break;

        case 39:
            moveBlock('left', 1);
            break;

        case 40:
            moveBlock('top', 1);
            break;

        default:
            break;
    }
});

retryButton.addEventListener('click', () => {
    playground.innerHTML = '';
    gameText.style.display = 'none';
    init();
});

init();
