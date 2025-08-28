// --- IMPORTANT: ADD YOUR GEMINI API KEY HERE --- //
// 1. Go to Google AI Studio: https://aistudio.google.com/
// 2. Click "Get API key" and create a new key.
// 3. Paste the key between the quotes below.
const API_KEY = "AIzaSyB35Ta-qbxit34DMYb1Oa8lDIwKhxPxeqk"; 

// --- MOCK DATA --- //
const students = [
    { id: 1, name: 'Aarav Sharma', grade: 8, avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AS' },
    { id: 2, name: 'Priya Patel', grade: 7, avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=PP' },
    { id: 3, name: 'Rohan Das', grade: 9, avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=RD' },
    { id: 4, name: 'Sneha Gupta', grade: 6, avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=SG' },
    { id: 5, name: 'Vikram Singh', grade: 8, avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=VS' },
    { id: 6, name: 'Anjali Verma', grade: 10, avatar: 'https://placehold.co/100x100/E2E8F0/4A5568?text=AV' },
];

const studentProgress = {
    1: { subjects: { Physics: { overallProgress: 85, games: [{ name: 'Gravity Gliders', score: 92, timeSpent: 120 }, { name: 'Circuit Craze', score: 78, timeSpent: 95 }] }, Mathematics: { overallProgress: 92, games: [{ name: 'Algebra Aliens', score: 95, timeSpent: 150 }, { name: 'Geometry Gems', score: 89, timeSpent: 110 }] }, Biology: { overallProgress: 75, games: [{ name: 'Cell Explorer', score: 70, timeSpent: 80 }, { name: 'Eco Warriors', score: 80, timeSpent: 100 }] }, Chemistry: { overallProgress: 68, games: [{ name: 'Molecule Match', score: 65, timeSpent: 70 }] } } },
    2: { subjects: { Physics: { overallProgress: 78, games: [{ name: 'Quantum Leap', score: 80, timeSpent: 90 }] }, Mathematics: { overallProgress: 88, games: [{ name: 'Algebra Aliens', score: 90, timeSpent: 130 }] }, Biology: { overallProgress: 82, games: [{ name: 'Eco-Dome', score: 85, timeSpent: 105 }] }, Chemistry: { overallProgress: 71, games: [{ name: 'Molecule Match', score: 72, timeSpent: 85 }] } } },
    3: { subjects: { Physics: { overallProgress: 95, games: [{ name: 'Circuit Craze', score: 98, timeSpent: 140 }] }, Mathematics: { overallProgress: 98, games: [{ name: 'Geometry Gems', score: 97, timeSpent: 160 }] }, Biology: { overallProgress: 88, games: [{ name: 'Eco Warriors', score: 90, timeSpent: 115 }] }, Geography: { overallProgress: 92, games: [{ name: 'Atlas Puzzle', score: 94, timeSpent: 100 }] } } },
    4: { subjects: { Physics: { overallProgress: 65, games: [] }, Mathematics: { overallProgress: 72, games: [{ name: 'Algebra Aliens', score: 75, timeSpent: 60 }] }, Biology: { overallProgress: 68, games: [] } } },
    5: { subjects: { Physics: { overallProgress: 81, games: [{ name: 'Gravity Gliders', score: 85, timeSpent: 110 }] }, Mathematics: { overallProgress: 79, games: [{ name: 'Geometry Gems', score: 80, timeSpent: 100 }] }, Biology: { overallProgress: 75, games: [{ name: 'Cell Explorer', score: 78, timeSpent: 90 }] }, Chemistry: { overallProgress: 85, games: [{ name: 'Molecule Match', score: 88, timeSpent: 120 }] } } },
    6: { subjects: { Physics: { overallProgress: 90, games: [] }, Mathematics: { overallProgress: 94, games: [{ name: 'Algebra Aliens', score: 96, timeSpent: 145 }] }, Chemistry: { overallProgress: 89, games: [] }, Geography: { overallProgress: 85, games: [{ name: 'Atlas Puzzle', score: 88, timeSpent: 95 }] } } }
};

// --- DOM ELEMENTS --- //
const dashboardView = document.getElementById('dashboard-view');
const detailView = document.getElementById('detail-view');
const studentGrid = document.getElementById('student-grid');
const backButton = document.getElementById('back-button');
const navDashboardLink = document.getElementById('nav-dashboard-link');
let progressChartInstance = null;
let currentStudentId = null;

// --- GEMINI API INTEGRATION --- //
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

async function callGeminiAPI(systemPrompt, userPrompt, targetElement) {
    if (API_KEY === "YOUR_API_KEY_HERE") {
        targetElement.innerHTML = '<p class="text-red-500"><strong>Error:</strong> Please add your Gemini API key to the script.js file.</p>';
        return;
    }
    targetElement.innerHTML = '<div class="flex justify-center items-center h-full"><div class="spinner"></div></div>';
    
    const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API request failed: ${response.status} ${response.statusText}`);

        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) throw new Error("No text returned from API.");

        let htmlText = text.replace(/\n/g, '<br>').replace(/\* (.*?)(<br>|$)/g, '<li>$1</li>');
        if (htmlText.includes('<li>')) htmlText = `<ul class="list-disc pl-5">${htmlText}</ul>`;
        targetElement.innerHTML = htmlText;

    } catch (error) {
        console.error("Gemini API Error:", error);
        targetElement.textContent = `An error occurred: ${error.message}. Please check the console.`;
    }
}

// --- HELPER & RENDER FUNCTIONS --- //
const calculateOverallProgress = (studentId) => {
    const progress = studentProgress[studentId];
    if (!progress || !progress.subjects) return 0;
    const subjects = Object.values(progress.subjects);
    if (subjects.length === 0) return 0;
    const total = subjects.reduce((acc, sub) => acc + sub.overallProgress, 0);
    return Math.round(total / subjects.length);
};

const renderDashboard = () => {
    studentGrid.innerHTML = '';
    students.forEach(student => {
        const overallProgress = calculateOverallProgress(student.id);
        const progressColor = overallProgress > 80 ? 'bg-emerald-500' : overallProgress > 60 ? 'bg-yellow-500' : 'bg-red-500';
        
        studentGrid.innerHTML += `
            <div data-student-id="${student.id}" class="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div class="p-5">
                    <div class="flex items-center gap-4">
                        <img src="${student.avatar}" alt="${student.name}" class="w-16 h-16 rounded-full border-2 border-slate-300" />
                        <div>
                            <h3 class="font-bold text-lg text-slate-800 dark:text-slate-100">${student.name}</h3>
                            <p class="text-sm text-slate-500 dark:text-slate-400">Grade ${student.grade}</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm font-medium text-slate-600 dark:text-slate-300">Overall Progress</span>
                            <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${overallProgress}%</span>
                        </div>
                        <div class="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                            <div class="${progressColor} h-2.5 rounded-full" style="width: ${overallProgress}%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
};

const renderStudentDetail = (studentId) => {
    currentStudentId = studentId;
    const student = students.find(s => s.id === studentId);
    const progress = studentProgress[studentId];

    const detailHeader = document.getElementById('detail-header');
    while (detailHeader.childNodes.length > 2) {
        detailHeader.removeChild(detailHeader.lastChild);
    }
    detailHeader.insertAdjacentHTML('beforeend', `
        <img src="${student.avatar}" alt="${student.name}" class="w-16 h-16 rounded-full border-2 border-slate-300" />
        <div>
            <h1 class="text-3xl font-bold text-slate-800 dark:text-white">${student.name}</h1>
            <p class="text-slate-500 dark:text-slate-400">Grade ${student.grade}</p>
        </div>
    `);

    const keyStatsContainer = document.getElementById('key-stats');
    const subjects = Object.entries(progress.subjects || {});
    let topSubject = 'N/A', needsFocus = 'N/A';
    if (subjects.length > 0) {
        subjects.sort((a, b) => b[1].overallProgress - a[1].overallProgress);
        topSubject = subjects[0][0];
        needsFocus = subjects[subjects.length - 1][0];
    }
    
    keyStatsContainer.innerHTML = `
        <div class="flex items-center gap-4">
          <div class="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg"><i data-lucide="trending-up" class="text-green-600 dark:text-green-300"></i></div>
          <div><p class="text-slate-500 dark:text-slate-400">Top Subject</p><p class="font-bold text-lg text-slate-800 dark:text-slate-100">${topSubject}</p></div>
        </div>
        <div class="flex items-center gap-4">
          <div class="p-3 bg-red-100 dark:bg-red-900/50 rounded-lg"><i data-lucide="trending-down" class="text-red-600 dark:text-red-300"></i></div>
          <div><p class="text-slate-500 dark:text-slate-400">Needs Focus</p><p class="font-bold text-lg text-slate-800 dark:text-slate-100">${needsFocus}</p></div>
        </div>
    `;

    const gameDetailsContainer = document.getElementById('game-details');
    gameDetailsContainer.innerHTML = '';
    Object.entries(progress.subjects || {}).forEach(([subject, data]) => {
        let gamesHTML = data.games.length > 0
            ? data.games.map(game => `
                <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                    <div class="flex items-center gap-4">
                        <div class="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 p-3 rounded-full"><i data-lucide="gamepad-2" class="w-5 h-5"></i></div>
                        <div>
                            <h4 class="font-semibold text-slate-800 dark:text-slate-200">${game.name}</h4>
                            <div class="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <span class="flex items-center gap-1"><i data-lucide="star" class="w-3.5 h-3.5"></i> ${game.score} Pts</span>
                                <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i> ${game.timeSpent} min</span>
                            </div>
                        </div>
                    </div>
                </div>`).join('')
            : `<div class="text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg"><p class="text-slate-500 dark:text-slate-400">No games played.</p></div>`;

        gameDetailsContainer.innerHTML += `
            <div>
                <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">${subject}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">${gamesHTML}</div>
            </div>`;
    });

    document.getElementById('feedback-container').textContent = 'Click a button to generate content.';
    document.getElementById('plan-container').textContent = 'Click a button to generate content.';
    
    const ctx = document.getElementById('progressChart').getContext('2d');
    const chartData = {
        labels: Object.keys(progress.subjects || {}),
        datasets: [{
            label: 'Subject Progress',
            data: Object.values(progress.subjects || {}).map(s => s.overallProgress),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 5,
        }]
    };
    if (progressChartInstance) progressChartInstance.destroy();
    progressChartInstance = new Chart(ctx, { type: 'bar', data: chartData, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } }, plugins: { legend: { display: false } } } });
    
    lucide.createIcons();
};

const showDashboard = () => {
    detailView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    currentStudentId = null;
};

// --- EVENT LISTENERS --- //
document.addEventListener('DOMContentLoaded', () => {
    studentGrid.addEventListener('click', (event) => {
        const card = event.target.closest('[data-student-id]');
        if (card) {
            const studentId = parseInt(card.dataset.studentId, 10);
            renderStudentDetail(studentId);
            dashboardView.classList.add('hidden');
            detailView.classList.remove('hidden');
        }
    });

    backButton.addEventListener('click', showDashboard);
    navDashboardLink.addEventListener('click', (e) => {
        e.preventDefault();
        showDashboard();
    });

    document.getElementById('generate-feedback-btn').addEventListener('click', () => {
        if (!currentStudentId) return;
        const student = students.find(s => s.id === currentStudentId);
        const progress = studentProgress[currentStudentId];
        const data = { name: student.name, grade: student.grade, progress: progress.subjects };
        
        const systemPrompt = "You are an encouraging teaching assistant...";
        const userPrompt = JSON.stringify(data, null, 2);
        
        callGeminiAPI(systemPrompt, userPrompt, document.getElementById('feedback-container'));
    });

    document.getElementById('suggest-plan-btn').addEventListener('click', () => {
        if (!currentStudentId) return;
        const student = students.find(s => s.id === currentStudentId);
        const progress = studentProgress[currentStudentId];
        const data = { name: student.name, grade: student.grade, progress: progress.subjects };

        const systemPrompt = "You are an academic advisor...";
        const userPrompt = JSON.stringify(data, null, 2);

        callGeminiAPI(systemPrompt, userPrompt, document.getElementById('plan-container'));
    });

    renderDashboard();
    lucide.createIcons();
});
