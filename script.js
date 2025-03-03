let workDuration = 25 * 60; // 25 минут
let breakDuration = 5 * 60; // 5 минут
let longBreakDuration = 15 * 60; // 15 минут
let isWorkTime = true;
let timerInterval;
let currentTime = workDuration;
let completedCycles = 0;
let totalWorkTime = 0; // Суммарное рабочее время
let workGoal = 0; // Цель рабочего времени для прогресс-бара (в часах)

const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const historyDisplay = document.getElementById('history');
const clockDisplay = document.getElementById('clock');
const totalTimeDisplay = document.getElementById('totalTime');
const progressBar = document.getElementById('progressBar');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const workGoalInput = document.getElementById('workGoal');
const setGoalButton = document.getElementById('setGoalButton');
const soundWork = new Audio('work-sound.mp3'); // Звук для работы
const soundBreak = new Audio('break-sound.mp3'); // Звук для перерыва

// Модальное окно
const modal = document.getElementById('modal');
const closeModalButton = document.querySelector('.close-button');
const resetModalButton = document.getElementById('resetModalButton'); // Кнопка сброса в модальном окне

function updateTimer() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function updateClock() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    clockDisplay.textContent = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

function updateTotalTime() {
    const minutes = Math.floor(totalWorkTime / 60);
    const seconds = totalWorkTime % 60;
    totalTimeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function updateProgressBar() {
    if (workGoal > 0) {
        // Преобразуем цель в часы в минуты и отслеживаем прогресс
        const progress = Math.min(totalWorkTime / (workGoal * 60), 1); // Прогресс в пределах 100%
        progressBar.style.width = (progress * 100) + '%';

        // Когда цель достигнута (прогресс 100%)
        if (progress === 1) {
            showGoalReachedModal();
        }
    }
}

function showGoalReachedModal() {
    modal.style.display = 'flex'; // Показываем модальное окно
}

function hideGoalReachedModal() {
    modal.style.display = 'none'; // Скрываем модальное окно
}

function switchTime() {
    if (isWorkTime) {
        currentTime = breakDuration;
        isWorkTime = false;
        statusDisplay.textContent = "Break Time!";
        document.body.classList.remove('red');
        document.body.classList.add('green');
        soundBreak.play();
    } else {
        completedCycles++;
        totalWorkTime += workDuration;
        currentTime = workDuration;
        isWorkTime = true;
        statusDisplay.textContent = "Work Time!";
        document.body.classList.remove('green');
        document.body.classList.add('red');
        soundWork.play();
    }
    startTimer();
    updateHistory();
    updateTotalTime();
    updateProgressBar();
}

function startTimer() {
    timerInterval = setInterval(() => {
        currentTime--;
        totalWorkTime++; // Увеличиваем общее время на каждую секунду
        updateTimer();
        updateClock();
        updateTotalTime();
        updateProgressBar();
        if (currentTime <= 0) {
            clearInterval(timerInterval);
            if (completedCycles % 4 === 0) {
                currentTime = longBreakDuration;
            }
            switchTime();
        }
    }, 1000);
}

function updateHistory() {
    historyDisplay.textContent = `Cycles completed: ${completedCycles}`;
    localStorage.setItem('completedCycles', completedCycles);
}

setGoalButton.addEventListener('click', () => {
    workGoal = parseFloat(workGoalInput.value) || 0; // Цель теперь в часах
    workGoalInput.value = workGoal; // Сохраняем введённое значение в поле ввода
    workGoalInput.disabled = true;
    setGoalButton.disabled = true; // Скрываем поле ввода и кнопку после установки

    if (workGoal > 0) {
        progressBar.style.width = '0%'; // Сбрасываем прогресс перед началом
        updateProgressBar();
        
        // Показываем цифру цели с анимацией
        const goalDisplay = document.getElementById('goalTime');
        goalDisplay.innerText = `${workGoal} час(ов)`; // Обновляем текст с целью
        
        // Скрываем кнопку после установки
        setGoalButton.classList.add('hide');
    } else {
        alert("Пожалуйста, введите цель в часах!");
    }
});

startButton.addEventListener('click', () => {
    startButton.disabled = true;
    startTimer();
});

pauseButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    startButton.disabled = false;
});

resetButton.addEventListener('click', () => {
    clearInterval(timerInterval);
    currentTime = workDuration;
    completedCycles = 0;
    totalWorkTime = 0;
    updateTimer();
    updateTotalTime();
    updateProgressBar();
    updateHistory();
    startButton.disabled = false;
    statusDisplay.textContent = "";
    document.body.classList.remove('green', 'red', 'blue');

    // Сброс цели: показываем кнопку и активируем поле ввода
    workGoalInput.disabled = false;
    setGoalButton.disabled = false;
    setGoalButton.classList.remove('hide'); // Показываем кнопку
    const goalDisplay = document.getElementById('goalTime');
    goalDisplay.classList.remove('show'); // Скрываем цифру цели
    goalDisplay.innerText = ''; // Очищаем цифру цели
});

window.onload = () => {
    updateTimer();
    updateClock();
    const savedCycles = localStorage.getItem('completedCycles');
    if (savedCycles) {
        completedCycles = savedCycles;
        updateHistory();
    }
};

// Пример кода, который добавляет класс .goal-set после установки цели
const inputField = document.querySelector('input[type="number"]');

setGoalButton.addEventListener('click', function() {
    // Добавляем класс goal-set к input после установки цели
    inputField.classList.add('goal-set');
});

// Закрытие модального окна
closeModalButton.addEventListener('click', hideGoalReachedModal);

// Сброс через модальное окно
resetModalButton.addEventListener('click', () => {
    // Скрыть модальное окно
    hideGoalReachedModal();
    // Сбросить таймер, прогресс и цель
    resetButton.click();
});

