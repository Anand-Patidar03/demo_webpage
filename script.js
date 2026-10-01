// script.js

const DOM = {
    dateInput: document.getElementById('entry-date'),
    form: document.getElementById('tracker-form'),
    saveBtn: document.getElementById('save-btn'),
    resetBtn: document.getElementById('reset-btn'),
    confirmationMsg: document.getElementById('save-confirmation'),
    inputs: [
        'sleep', 'exercise', 'walking', 'food', 'screenTime',
        'phoneFreeMorning', 'phoneFreeNight', 'selfControl',
        'ruleSlip', 'reflection', 'personalCare'
    ],
    texts: ['wentWell', 'wentWrong', 'improveTomorrow'],
    rulesBtn: document.getElementById('rules-btn'),
    closeRulesBtn: document.getElementById('close-rules-btn'),
    rulesModal: document.getElementById('rules-modal'),
    historyToggleBtn: document.getElementById('history-toggle-btn'),
    historyWrapper: document.getElementById('history-wrapper')
};

const scoringConfig = {
    sleep: {
        title: "Sleep",
        type: "range",
        rules: [
            { max: 4, label: "< 4 hours", points: -7 },
            { max: 5, label: "4  –  <5 hours", points: -4 },
            { max: 6, label: "5  –  <6 hours", points: 2 },
            { max: 7, label: "6  –  <7 hours", points: 5 },
            { max: 8, label: "7  –  <8 hours", points: 7 },
            { max: 9, label: "8  –  <9 hours", points: 5 },
            { max: 10, label: "9  –  <10 hours", points: 3 },
            { max: Infinity, label: "≥10 hours", points: 1 }
        ]
    },
    exercise: {
        title: "Exercise / Physical Activity",
        type: "range",
        rules: [
            { max: 10, label: "<10 min", points: -3 },
            { max: 20, label: "10  –  <20 min", points: 0 },
            { max: 30, label: "20  –  <30 min", points: 3 },
            { max: 45, label: "30  –  <45 min", points: 5 },
            { max: 60, label: "45  –  <60 min", points: 6 },
            { max: Infinity, label: "≥60 min", points: 7 }
        ]
    },
    walking: {
        title: "Walking / Outdoor Activity",
        type: "range",
        rules: [
            { max: 15, label: "<15 min", points: -2 },
            { max: 30, label: "15  –  <30 min", points: 0 },
            { max: 45, label: "30  –  <45 min", points: 2 },
            { max: 60, label: "45  –  <60 min", points: 4 },
            { max: Infinity, label: "≥60 min", points: 5 }
        ]
    },
    food: {
        title: "Food Quality",
        type: "select",
        rules: [
            { key: "-5", label: "Very poor / mostly junk", points: -5 },
            { key: "-3", label: "Poor", points: -3 },
            { key: "0", label: "Average", points: 0 },
            { key: "3", label: "Generally healthy", points: 3 },
            { key: "5", label: "Healthy + good protein + reasonable portions", points: 5 }
        ]
    },
    screenTime: {
        title: "Entertainment / Social Screen Time",
        type: "range",
        rules: [
            { max: 1, label: "<1 hour", points: 10 },
            { max: 2, label: "1  –  <2 hours", points: 7 },
            { max: 3, label: "2  –  <3 hours", points: 4 },
            { max: 4, label: "3  –  <4 hours", points: 1 },
            { max: 5, label: "4  –  <5 hours", points: -3 },
            { max: 6, label: "5  –  <6 hours", points: -6 },
            { max: 7, label: "6  –  <7 hours", points: -8 },
            { max: Infinity, label: "≥7 hours", points: -10 }
        ]
    },
    phoneFreeMorning: {
        title: "Phone-Free Morning",
        type: "range",
        rules: [
            { max: 10, label: "<10 min", points: -1 },
            { max: 20, label: "10  –  <20 min", points: 0 },
            { max: 30, label: "20  –  <30 min", points: 2 },
            { max: Infinity, label: "≥30 min", points: 3 }
        ]
    },
    phoneFreeNight: {
        title: "Phone-Free Night",
        type: "range",
        rules: [
            { max: 10, label: "<10 min", points: -1 },
            { max: 20, label: "10  –  <20 min", points: 0 },
            { max: 30, label: "20  –  <30 min", points: 2 },
            { max: Infinity, label: "≥30 min", points: 3 }
        ]
    },
    selfControl: {
        title: "Self-Control",
        type: "select",
        rules: [
            { key: "-3", label: "Repeatedly avoided important things", points: -3 },
            { key: "0", label: "Normal day", points: 0 },
            { key: "2", label: "Did one uncomfortable thing", points: 3 },
            { key: "4", label: "Did 2+ meaningful uncomfortable things", points: 5 }
        ]
    },
    ruleSlip: {
        title: "Personal Rule Slip / Bad Habit",
        type: "select",
        rules: [
            { key: "0", label: "No slip", points: 0 },
            { key: "-1", label: "Minor slip", points: -1 },
            { key: "-3", label: "One significant lapse", points: -3 },
            { key: "-5", label: "Repeated/significant lapses", points: -5 },
            { key: "-6", label: "Multiple major lapses", points: -6 }
        ]
    },
    reflection: {
        title: "Daily Reflection",
        type: "select",
        rules: [
            { key: "0", label: "Didn't write", points: 0 },
            { key: "1", label: "Short reflection", points: 1 },
            { key: "2", label: "Honest reflection + tomorrow's improvement", points: 3 }
        ]
    },
    personalCare: {
        title: "Personal Care / Environment",
        type: "select",
        rules: [
            { key: "-2", label: "Neglected badly", points: -2 },
            { key: "1", label: "Normal", points: 2 },
            { key: "3", label: "Good personal care + reasonably clean environment", points: 4 }
        ]
    }
};

let currentScoreData = {};
let currentDisplayedRating = 0;
let currentDisplayedScore = 0;
let animationFrameId;

function init() {
    initCustomSelects();

    DOM.inputs.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', updateUI);
        el.addEventListener('change', updateUI);
    });

    DOM.dateInput.addEventListener('change', handleDateChange);
    DOM.saveBtn.addEventListener('click', saveEntry);
    DOM.resetBtn.addEventListener('click', resetForm);

    // Modal Listeners
    DOM.rulesBtn.addEventListener('click', () => {
        renderScoringRules();
        DOM.rulesModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    DOM.closeRulesBtn.addEventListener('click', () => {
        DOM.rulesModal.classList.add('hidden');
        document.body.style.overflow = '';
    });

    DOM.rulesModal.addEventListener('click', (e) => {
        if (e.target === DOM.rulesModal) {
            DOM.rulesModal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });

    // History Toggle
    DOM.historyToggleBtn.addEventListener('click', () => {
        const isExpanded = DOM.historyWrapper.classList.contains('expanded');
        if (isExpanded) {
            DOM.historyWrapper.classList.remove('expanded');
            DOM.historyToggleBtn.innerText = 'View History';
        } else {
            DOM.historyWrapper.classList.add('expanded');
            DOM.historyToggleBtn.innerText = 'Hide History';
            setTimeout(() => {
                DOM.historyWrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 350);
        }
    });

    const today = getTodayDateStr();
    DOM.dateInput.value = today;
    loadEntryForDate(today);
    renderHistory();
}

// Custom Select Component Logic
function initCustomSelects() {
    const selects = document.querySelectorAll('select');
    selects.forEach(selectEl => {
        const wrapper = document.createElement('div');
        wrapper.className = 'custom-select-wrapper';
        
        selectEl.parentNode.insertBefore(wrapper, selectEl);
        wrapper.appendChild(selectEl);
        selectEl.style.display = 'none';

        const selectedDiv = document.createElement('div');
        selectedDiv.className = 'custom-select-trigger';
        selectedDiv.tabIndex = 0;
        wrapper.appendChild(selectedDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'custom-select-options hidden';
        wrapper.appendChild(optionsDiv);

        const category = selectEl.id;

        function updateSelectedDisplay() {
            const selectedOpt = selectEl.options[selectEl.selectedIndex];
            const pts = getSelectPoints(category, selectedOpt.value);
            selectedDiv.innerHTML = `<span class="trigger-text">${selectedOpt.text}</span> <span class="dropdown-points ${getPointsClass(pts)}">${formatPoints(pts)}</span>`;
        }

        Array.from(selectEl.options).forEach((opt, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'custom-select-item';
            const pts = getSelectPoints(category, opt.value);
            
            itemDiv.innerHTML = `<span class="item-text">${opt.text}</span> <span class="dropdown-points ${getPointsClass(pts)}">${formatPoints(pts)}</span>`;
            
            itemDiv.addEventListener('click', (e) => {
                selectEl.selectedIndex = index;
                updateSelectedDisplay();
                
                Array.from(optionsDiv.children).forEach(c => c.classList.remove('selected'));
                itemDiv.classList.add('selected');

                closeAllSelects();
                selectEl.dispatchEvent(new Event('change'));
            });
            optionsDiv.appendChild(itemDiv);
        });

        updateSelectedDisplay();

        selectedDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            const isClosed = optionsDiv.classList.contains('hidden');
            closeAllSelects();
            if (isClosed) {
                optionsDiv.classList.remove('hidden');
                wrapper.classList.add('open');
                
                const items = optionsDiv.querySelectorAll('.custom-select-item');
                if (items[selectEl.selectedIndex]) {
                    items[selectEl.selectedIndex].classList.add('selected');
                    items[selectEl.selectedIndex].scrollIntoView({ block: 'nearest' });
                }
            }
        });
        
        selectedDiv.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectedDiv.click();
            } else if (e.key === 'Escape') {
                closeAllSelects();
            }
        });
    });
    
    document.addEventListener('click', () => {
        closeAllSelects();
    });
}

function syncCustomSelects() {
    document.querySelectorAll('select').forEach(selectEl => {
        const wrapper = selectEl.closest('.custom-select-wrapper');
        if (wrapper) {
            const selectedDiv = wrapper.querySelector('.custom-select-trigger');
            const selectedOpt = selectEl.options[selectEl.selectedIndex];
            const pts = getSelectPoints(selectEl.id, selectedOpt.value);
            selectedDiv.innerHTML = `<span class="trigger-text">${selectedOpt.text}</span> <span class="dropdown-points ${getPointsClass(pts)}">${formatPoints(pts)}</span>`;
            
            const items = wrapper.querySelectorAll('.custom-select-item');
            items.forEach((item, idx) => {
                if (idx === selectEl.selectedIndex) item.classList.add('selected');
                else item.classList.remove('selected');
            });
        }
    });
}

function closeAllSelects(exceptWrapper = null) {
    document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== exceptWrapper) {
            w.classList.remove('open');
            w.querySelector('.custom-select-options').classList.add('hidden');
        }
    });
}

function getPointsClass(pts) {
    if (pts > 0) return 'positive';
    if (pts < 0) return 'negative';
    return 'neutral';
}

function renderScoringRules() {
    const container = document.getElementById('rules-container');
    container.innerHTML = '';

    for (let key in scoringConfig) {
        const cat = scoringConfig[key];
        let html = `<div class="rule-category">
            <h3>${cat.title}</h3>
            <table class="rule-table">`;

        cat.rules.forEach(rule => {
            const pts = rule.points;
            let ptsStr = pts > 0 ? `+${pts}` : pts;
            let colorClass = pts > 0 ? 'positive' : (pts < 0 ? 'negative' : 'neutral');

            html += `<tr>
                <td>${rule.label}</td>
                <td class="rule-points ${colorClass}">${ptsStr}</td>
            </tr>`;
        });

        html += `</table></div>`;
        container.innerHTML += html;
    }
}

function getTodayDateStr() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getNumberValue(id) {
    const val = document.getElementById(id).value;
    if (val === "" || isNaN(val)) return null;
    return parseFloat(val);
}

function getRangePoints(category, val) {
    if (val === null) return 0;
    const rules = scoringConfig[category].rules;
    for (let r of rules) {
        if (val < r.max) return r.points;
    }
    return rules[rules.length - 1].points;
}

function getSelectPoints(category, key) {
    const rules = scoringConfig[category].rules;
    const rule = rules.find(r => r.key === String(key));
    return rule ? rule.points : 0;
}

function calculateSleepPoints() { return getRangePoints('sleep', getNumberValue('sleep')); }
function calculateExercisePoints() { return getRangePoints('exercise', getNumberValue('exercise')); }
function calculateWalkingPoints() { return getRangePoints('walking', getNumberValue('walking')); }
function calculateScreenTimePoints() { return getRangePoints('screenTime', getNumberValue('screenTime')); }
function calculatePhoneFreePoints(id) {
    const cat = id === 'phoneFreeMorning' ? 'phoneFreeMorning' : 'phoneFreeNight';
    return getRangePoints(cat, getNumberValue(id));
}
function calculateFoodPoints() { return getSelectPoints('food', document.getElementById('food').value); }
function calculateSelfControlPoints() { return getSelectPoints('selfControl', document.getElementById('selfControl').value); }
function calculateSlipPoints() { return getSelectPoints('ruleSlip', document.getElementById('ruleSlip').value); }
function calculateReflectionPoints() { return getSelectPoints('reflection', document.getElementById('reflection').value); }
function calculatePersonalCarePoints() { return getSelectPoints('personalCare', document.getElementById('personalCare').value); }

function calculateTotalScore() {
    const baseScore = 50;
    const sleepPoints = calculateSleepPoints();
    const exercisePoints = calculateExercisePoints();
    const walkingPoints = calculateWalkingPoints();
    const foodPoints = calculateFoodPoints();
    const screenTimePoints = calculateScreenTimePoints();
    const phoneFreeMorningPoints = calculatePhoneFreePoints('phoneFreeMorning');
    const phoneFreeNightPoints = calculatePhoneFreePoints('phoneFreeNight');
    const selfControlPoints = calculateSelfControlPoints();
    const personalRuleSlipPoints = calculateSlipPoints();
    const reflectionPoints = calculateReflectionPoints();
    const personalCarePoints = calculatePersonalCarePoints();

    let finalScore = baseScore + sleepPoints + exercisePoints + walkingPoints +
        foodPoints + screenTimePoints + phoneFreeMorningPoints +
        phoneFreeNightPoints + selfControlPoints +
        personalRuleSlipPoints + reflectionPoints + personalCarePoints;

    finalScore = Math.max(0, Math.min(100, finalScore));
    const dailyRating = finalScore / 10;

    currentScoreData = {
        baseScore,
        sleepPoints,
        exercisePoints,
        walkingPoints,
        foodPoints,
        screenTimePoints,
        phoneFreeMorningPoints,
        phoneFreeNightPoints,
        selfControlPoints,
        personalRuleSlipPoints,
        reflectionPoints,
        personalCarePoints,
        finalScore,
        dailyRating
    };

    return currentScoreData;
}

function formatPoints(pts) {
    if (pts > 0) return `+${pts}`;
    if (pts < 0) return `${pts}`;
    return `0`;
}

function setBadge(id, points) {
    const badge = document.getElementById(id);
    if (!badge) return; // safe to call if badge doesn't exist
    badge.innerText = formatPoints(points);
    badge.className = 'points-badge';
    if (points > 0) badge.classList.add('positive');
    else if (points < 0) badge.classList.add('negative');
    else badge.classList.add('neutral');
}

function getRatingColor(rating) {
    if (rating >= 9.0) return '#10b981';
    if (rating >= 8.0) return '#0ea5e9';
    if (rating >= 7.0) return '#3b82f6';
    if (rating >= 6.0) return '#f59e0b';
    if (rating >= 5.0) return '#ea580c';
    return '#ef4444';
}

function updateUI() {
    const data = calculateTotalScore();

    const labelEl = document.getElementById('display-label');
    let labelText = "";
    if (data.dailyRating >= 9.0) labelText = "Excellent Day";
    else if (data.dailyRating >= 8.0) labelText = "Strong Day";
    else if (data.dailyRating >= 7.0) labelText = "Good Day";
    else if (data.dailyRating >= 6.0) labelText = "Average Day";
    else if (data.dailyRating >= 5.0) labelText = "Needs Improvement";
    else labelText = "Reset Tomorrow";
    labelEl.innerText = labelText;

    const color = getRatingColor(data.dailyRating);
    labelEl.style.color = color;

    // Smooth score animation
    animateScore(data.dailyRating, data.finalScore, color);

    // Update Breakdown
    const breakdownList = document.getElementById('breakdown-list');
    breakdownList.innerHTML = `
        <li><span>Base Score</span> <span>${data.baseScore}</span></li>
        <li><span>Sleep</span> <span>${formatPoints(data.sleepPoints)}</span></li>
        <li><span>Exercise</span> <span>${formatPoints(data.exercisePoints)}</span></li>
        <li><span>Walking</span> <span>${formatPoints(data.walkingPoints)}</span></li>
        <li><span>Food</span> <span>${formatPoints(data.foodPoints)}</span></li>
        <li><span>Screen Time</span> <span>${formatPoints(data.screenTimePoints)}</span></li>
        <li><span>Phone-free morning</span> <span>${formatPoints(data.phoneFreeMorningPoints)}</span></li>
        <li><span>Phone-free night</span> <span>${formatPoints(data.phoneFreeNightPoints)}</span></li>
        <li><span>Self-control</span> <span>${formatPoints(data.selfControlPoints)}</span></li>
        <li><span>Personal rule slip</span> <span>${formatPoints(data.personalRuleSlipPoints)}</span></li>
        <li><span>Reflection</span> <span>${formatPoints(data.reflectionPoints)}</span></li>
        <li><span>Personal care</span> <span>${formatPoints(data.personalCarePoints)}</span></li>
        <li class="breakdown-total"><span>Final Score</span> <span>${data.finalScore}</span></li>
        <li class="breakdown-total" style="color: ${color};"><span>Daily Rating</span> <span>${data.dailyRating.toFixed(1)}/10</span></li>
    `;

    // Update Badges
    setBadge('badge-sleep', data.sleepPoints);
    setBadge('badge-exercise', data.exercisePoints);
    setBadge('badge-walking', data.walkingPoints);
    setBadge('badge-food', data.foodPoints);
    setBadge('badge-screenTime', data.screenTimePoints);
    setBadge('badge-phoneFreeMorning', data.phoneFreeMorningPoints);
    setBadge('badge-phoneFreeNight', data.phoneFreeNightPoints);
    setBadge('badge-selfControl', data.selfControlPoints);
    setBadge('badge-ruleSlip', data.personalRuleSlipPoints);
    setBadge('badge-reflection', data.reflectionPoints);
    setBadge('badge-personalCare', data.personalCarePoints);

    updateButtonText();
}

function animateScore(targetRating, targetScore, targetColor) {
    cancelAnimationFrame(animationFrameId);

    const duration = 500; // ms
    const startTime = performance.now();
    const startRating = currentDisplayedRating;
    const startScore = currentDisplayedScore;

    const circle = document.querySelector('.score-circle');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
        currentDisplayedRating = targetRating;
        currentDisplayedScore = targetScore;
        document.getElementById('display-rating').innerText = `${targetRating.toFixed(1)} / 10`;
        document.getElementById('display-score').innerText = `${targetScore} / 100`;
        const percent = Math.max(0, Math.min(100, targetScore));
        circle.style.background = `conic-gradient(${targetColor} ${percent}%, rgba(255,255,255,0.05) 0)`;
        circle.style.boxShadow = `0 0 30px ${targetColor}30`;
        return;
    }

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);

        currentDisplayedRating = startRating + (targetRating - startRating) * ease;
        currentDisplayedScore = startScore + (targetScore - startScore) * ease;

        const displayScoreInt = Math.round(currentDisplayedScore);

        document.getElementById('display-rating').innerText = `${currentDisplayedRating.toFixed(1)} / 10`;
        document.getElementById('display-score').innerText = `${displayScoreInt} / 100`;

        const percent = Math.max(0, Math.min(100, currentDisplayedScore));
        circle.style.background = `conic-gradient(${targetColor} ${percent}%, rgba(255,255,255,0.05) 0)`;
        circle.style.boxShadow = `0 0 30px ${targetColor}30`;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(update);
        } else {
            currentDisplayedRating = targetRating;
            currentDisplayedScore = targetScore;
            document.getElementById('display-rating').innerText = `${targetRating.toFixed(1)} / 10`;
            document.getElementById('display-score').innerText = `${targetScore} / 100`;
            const finalPercent = Math.max(0, Math.min(100, targetScore));
            circle.style.background = `conic-gradient(${targetColor} ${finalPercent}%, rgba(255,255,255,0.05) 0)`;
        }
    }

    animationFrameId = requestAnimationFrame(update);
}

function updateButtonText() {
    const selectedDate = DOM.dateInput.value;
    if (selectedDate === getTodayDateStr()) {
        DOM.saveBtn.innerText = "Save Today's Entry";
    } else {
        DOM.saveBtn.innerText = "Save Entry";
    }
}

// Data Persistence
const STORAGE_KEY = 'fitness_rating_entries';

function getEntries() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
}

function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function handleDateChange() {
    const selectedDate = DOM.dateInput.value;
    if (!selectedDate) return;
    loadEntryForDate(selectedDate);
}

function loadEntryForDate(dateStr) {
    const entries = getEntries();
    const entry = entries[dateStr];

    hideConfirmation();

    if (entry) {
        document.getElementById('sleep').value = entry.sleep !== null ? entry.sleep : '';
        document.getElementById('exercise').value = entry.exercise !== null ? entry.exercise : '';
        document.getElementById('walking').value = entry.walking !== null ? entry.walking : '';
        document.getElementById('food').value = entry.food !== undefined ? entry.food : '0';
        document.getElementById('screenTime').value = entry.screenTime !== null ? entry.screenTime : '';
        document.getElementById('phoneFreeMorning').value = entry.phoneFreeMorning !== null ? entry.phoneFreeMorning : '';
        document.getElementById('phoneFreeNight').value = entry.phoneFreeNight !== null ? entry.phoneFreeNight : '';
        document.getElementById('selfControl').value = entry.selfControl !== undefined ? entry.selfControl : '0';
        document.getElementById('ruleSlip').value = entry.personalRuleSlip !== undefined ? entry.personalRuleSlip : '0';
        document.getElementById('reflection').value = entry.reflectionLevel !== undefined ? entry.reflectionLevel : '0';
        document.getElementById('personalCare').value = entry.personalCare !== undefined ? entry.personalCare : '1';

        document.getElementById('wentWell').value = entry.reflectionText?.wentWell || '';
        document.getElementById('wentWrong').value = entry.reflectionText?.wentWrong || '';
        document.getElementById('improveTomorrow').value = entry.reflectionText?.tomorrow || '';
    } else {
        resetFormInputs();
    }
    
    syncCustomSelects();

    // Jump animation slightly directly instead of from 0 if switching days
    if (entry) {
        currentDisplayedRating = entry.rating;
        currentDisplayedScore = entry.finalScore;
    }
    updateUI();
}

function resetFormInputs() {
    DOM.inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el.tagName === 'SELECT') {
            if (id === 'food') el.value = "0";
            else if (id === 'selfControl') el.value = "0";
            else if (id === 'ruleSlip') el.value = "0";
            else if (id === 'reflection') el.value = "0";
            else if (id === 'personalCare') el.value = "1";
        } else {
            el.value = '';
        }
    });
    DOM.texts.forEach(id => {
        document.getElementById(id).value = '';
    });
    syncCustomSelects();
}

function resetForm() {
    resetFormInputs();
    updateUI();
    hideConfirmation();
}

function saveEntry() {
    const dateStr = DOM.dateInput.value;
    if (!dateStr) return;

    const data = calculateTotalScore();

    const entry = {
        date: dateStr,
        sleep: getNumberValue('sleep'),
        exercise: getNumberValue('exercise'),
        walking: getNumberValue('walking'),
        food: parseInt(document.getElementById('food').value, 10) || 0,
        screenTime: getNumberValue('screenTime'),
        phoneFreeMorning: getNumberValue('phoneFreeMorning'),
        phoneFreeNight: getNumberValue('phoneFreeNight'),
        selfControl: parseInt(document.getElementById('selfControl').value, 10) || 0,
        personalRuleSlip: parseInt(document.getElementById('ruleSlip').value, 10) || 0,
        reflectionLevel: parseInt(document.getElementById('reflection').value, 10) || 0,
        reflectionText: {
            wentWell: document.getElementById('wentWell').value,
            wentWrong: document.getElementById('wentWrong').value,
            tomorrow: document.getElementById('improveTomorrow').value
        },
        personalCare: parseInt(document.getElementById('personalCare').value, 10) || 0,
        finalScore: data.finalScore,
        rating: data.dailyRating
    };

    const entries = getEntries();
    entries[dateStr] = entry;
    saveEntries(entries);

    showConfirmation(dateStr);
    renderHistory();
}

function showConfirmation(dateStr) {
    const dateObj = new Date(dateStr + 'T12:00:00');
    const displayDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    DOM.confirmationMsg.innerText = `✓ Entry saved for ${displayDate}`;
    DOM.confirmationMsg.classList.remove('hidden');

    setTimeout(() => {
        hideConfirmation();
    }, 3000);
}

function hideConfirmation() {
    DOM.confirmationMsg.classList.add('hidden');
}

// History & Weekly Summary
function formatMetric(category, val, type) {
    if (val === null || val === undefined || val === '') return { label: '-', points: 0 };
    
    let label = '';
    let points = 0;
    
    if (type === 'hours') {
        label = `${val} hours`;
        points = getRangePoints(category, val);
    } else if (type === 'minutes') {
        label = `${val} min`;
        points = getRangePoints(category, val);
    } else if (type === 'select') {
        const rule = scoringConfig[category].rules.find(r => r.key === String(val));
        label = rule ? rule.label : '-';
        points = rule ? rule.points : 0;
    }
    
    return { label, points };
}

function getEntryDetailsHTML(entry) {
    const s = formatMetric('sleep', entry.sleep, 'hours');
    const ex = formatMetric('exercise', entry.exercise, 'minutes');
    const w = formatMetric('walking', entry.walking, 'minutes');
    const f = formatMetric('food', entry.food, 'select');
    const st = formatMetric('screenTime', entry.screenTime, 'hours');
    const pfm = formatMetric('phoneFreeMorning', entry.phoneFreeMorning, 'minutes');
    const pfn = formatMetric('phoneFreeNight', entry.phoneFreeNight, 'minutes');
    const sc = formatMetric('selfControl', entry.selfControl, 'select');
    const prs = formatMetric('ruleSlip', entry.personalRuleSlip, 'select');
    const ref = formatMetric('reflection', entry.reflectionLevel, 'select');
    const pc = formatMetric('personalCare', entry.personalCare, 'select');

    let reflectionNotesHtml = '';
    const rText = entry.reflectionText;
    if (rText && (rText.wentWell || rText.wentWrong || rText.tomorrow)) {
        reflectionNotesHtml = `
            <div class="history-reflection-notes">
                ${rText.wentWell ? `<div><strong>Went well:</strong> ${rText.wentWell}</div>` : ''}
                ${rText.wentWrong ? `<div><strong>Went wrong:</strong> ${rText.wentWrong}</div>` : ''}
                ${rText.tomorrow ? `<div><strong>Improve tomorrow:</strong> ${rText.tomorrow}</div>` : ''}
            </div>
        `;
    }

    return `
        <div class="history-details-inner">
            <div class="history-category-title">PHYSICAL FITNESS</div>
            <div class="history-row"><span class="history-row-metric">Sleep</span> <span class="history-row-value">${s.label}</span> <span class="history-row-points ${getPointsClass(s.points)}">${formatPoints(s.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Exercise</span> <span class="history-row-value">${ex.label}</span> <span class="history-row-points ${getPointsClass(ex.points)}">${formatPoints(ex.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Walking / Outdoor</span> <span class="history-row-value">${w.label}</span> <span class="history-row-points ${getPointsClass(w.points)}">${formatPoints(w.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Food</span> <span class="history-row-value">${f.label}</span> <span class="history-row-points ${getPointsClass(f.points)}">${formatPoints(f.points)}</span></div>

            <div class="history-category-title">MENTAL FITNESS</div>
            <div class="history-row"><span class="history-row-metric">Screen time</span> <span class="history-row-value">${st.label}</span> <span class="history-row-points ${getPointsClass(st.points)}">${formatPoints(st.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Phone-free morning</span> <span class="history-row-value">${pfm.label}</span> <span class="history-row-points ${getPointsClass(pfm.points)}">${formatPoints(pfm.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Phone-free night</span> <span class="history-row-value">${pfn.label}</span> <span class="history-row-points ${getPointsClass(pfn.points)}">${formatPoints(pfn.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Self-control</span> <span class="history-row-value">${sc.label}</span> <span class="history-row-points ${getPointsClass(sc.points)}">${formatPoints(sc.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Personal rule slip</span> <span class="history-row-value">${prs.label}</span> <span class="history-row-points ${getPointsClass(prs.points)}">${formatPoints(prs.points)}</span></div>
            <div class="history-row"><span class="history-row-metric">Reflection</span> <span class="history-row-value">${ref.label}</span> <span class="history-row-points ${getPointsClass(ref.points)}">${formatPoints(ref.points)}</span></div>
            ${reflectionNotesHtml}

            <div class="history-category-title">PERSONAL CARE</div>
            <div class="history-row"><span class="history-row-metric">Personal care</span> <span class="history-row-value">${pc.label}</span> <span class="history-row-points ${getPointsClass(pc.points)}">${formatPoints(pc.points)}</span></div>

            <hr class="history-divider">
            
            <div class="history-row summary-row"><span class="history-row-metric">Base Score</span> <span class="history-row-value"></span> <span class="history-row-points">50</span></div>
            <div class="history-row summary-row"><span class="history-row-metric">Final Score</span> <span class="history-row-value"></span> <span class="history-row-points">${entry.finalScore} / 100</span></div>
            <div class="history-row summary-row" style="color: ${getRatingColor(entry.rating)};"><span class="history-row-metric">Daily Rating</span> <span class="history-row-value"></span> <span class="history-row-points">${entry.rating.toFixed(1)} / 10</span></div>
        </div>
    `;
}


function renderHistory() {
    const historyList = document.getElementById('history-list');
    const entries = getEntries();
    const sortedDates = Object.keys(entries).sort((a, b) => b.localeCompare(a));

    historyList.innerHTML = '';

    if (sortedDates.length === 0) {
        historyList.innerHTML = '<p class="text-muted text-center" style="margin-top:20px;">No entries yet.</p>';
    } else {
        sortedDates.forEach(dateStr => {
            const entry = entries[dateStr];
            const item = document.createElement('div');
            item.className = 'history-item';

            const dateObj = new Date(dateStr + 'T12:00:00');
            const displayDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
            const color = getRatingColor(entry.rating);

            item.innerHTML = `
                <div class="history-item-header" id="header-${dateStr}" onclick="window.toggleHistoryDetails('${dateStr}', event)">
                    <div class="history-date-rating">
                        <span class="history-date">${displayDate}</span>
                        <span class="history-rating" style="color:${color};">${entry.rating.toFixed(1)} / 10</span>
                        <span class="expand-icon">▼</span>
                    </div>
                    <div class="history-actions">
                        <button type="button" class="edit-btn" onclick="window.editEntry('${dateStr}', event)">Edit</button>
                        <button type="button" class="delete-btn" onclick="window.deleteEntry('${dateStr}', event)">Delete</button>
                    </div>
                </div>
                <div class="history-details-wrapper" id="details-${dateStr}">
                    ${getEntryDetailsHTML(entry)}
                </div>
            `;
            historyList.appendChild(item);
        });
    }

    renderWeeklySummary(entries);
}

function renderWeeklySummary(entries) {
    const summaryContainer = document.getElementById('weekly-summary');

    const today = new Date();
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        last7Days.push(dateStr);
    }

    let daysRecorded = 0;
    let sumRating = 0;
    let maxRating = -1;
    let minRating = 11;

    last7Days.forEach(dateStr => {
        if (entries[dateStr]) {
            daysRecorded++;
            const r = entries[dateStr].rating;
            sumRating += r;
            if (r > maxRating) maxRating = r;
            if (r < minRating) minRating = r;
        }
    });

    if (daysRecorded === 0) {
        summaryContainer.innerHTML = `
            <div class="summary-card">
                <h3>THIS WEEK</h3>
                <p class="text-muted text-center">No entries recorded in the last 7 days.</p>
            </div>
        `;
        return;
    }

    const avg = (sumRating / daysRecorded).toFixed(1);
    const highest = maxRating.toFixed(1);
    const lowest = minRating.toFixed(1);

    summaryContainer.innerHTML = `
        <div class="summary-card">
            <h3>THIS WEEK</h3>
            <div class="summary-stats">
                <div class="summary-box">
                    <span class="label">Days</span>
                    <span class="value" style="color: var(--text-main);">${daysRecorded} / 7</span>
                </div>
                <div class="summary-box">
                    <span class="label">Average</span>
                    <span class="value" style="color: ${getRatingColor(parseFloat(avg))}">${avg} / 10</span>
                </div>
                <div class="summary-box">
                    <span class="label">Highest</span>
                    <span class="value" style="color: ${getRatingColor(parseFloat(highest))}">${highest} / 10</span>
                </div>
                <div class="summary-box">
                    <span class="label">Lowest</span>
                    <span class="value" style="color: ${getRatingColor(parseFloat(lowest))}">${lowest} / 10</span>
                </div>
            </div>
        </div>
    `;
}

window.toggleHistoryDetails = function(dateStr, event) {
    if (event.target.tagName.toLowerCase() === 'button') return;
    
    const allDetails = document.querySelectorAll('.history-details-wrapper');
    const allHeaders = document.querySelectorAll('.history-item-header');
    
    const targetDetails = document.getElementById(`details-${dateStr}`);
    const targetHeader = document.getElementById(`header-${dateStr}`);
    
    const isExpanded = targetDetails.classList.contains('expanded');
    
    allDetails.forEach(el => el.classList.remove('expanded'));
    allHeaders.forEach(el => el.classList.remove('active'));
    
    if (!isExpanded) {
        targetDetails.classList.add('expanded');
        targetHeader.classList.add('active');
    }
};

window.editEntry = function (dateStr, event) {
    event.stopPropagation();
    DOM.dateInput.value = dateStr;
    loadEntryForDate(dateStr);
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteEntry = function (dateStr, event) {
    event.stopPropagation();
    const dateObj = new Date(dateStr + 'T12:00:00');
    const displayDate = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    if (confirm(`Delete the entry for ${displayDate}?`)) {
        const entries = getEntries();
        delete entries[dateStr];
        saveEntries(entries);

        if (DOM.dateInput.value === dateStr) {
            loadEntryForDate(dateStr);
        }
        renderHistory();
    }
};

document.addEventListener('DOMContentLoaded', init);
