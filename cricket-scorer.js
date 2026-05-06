// Cricket Scorer Pro - Professional Cricket Scoring System
// Advanced state management and scoring logic

class CricketMatch {
    constructor() {
        this.matchType = 't20';
        this.totalOvers = 20;
        this.playersPerTeam = 11;
        this.currentInnings = 1;
        this.team1 = { name: '', players: [], batting: false };
        this.team2 = { name: '', players: [], batting: false };
        this.battingTeam = null;
        this.bowlingTeam = null;
        this.striker = null;
        this.nonStriker = null;
        this.bowler = null;
        this.score = 0;
        this.wickets = 0;
        this.overs = 0;
        this.balls = 0;
        this.currentOver = [];
        this.ballHistory = [];
        this.target = null;
        this.matchStatus = 'setup';
        this.startTime = null;
        this.partnershipRuns = 0;
        this.partnershipBalls = 0;
    }

    reset() {
        this.matchType = 't20';
        this.totalOvers = 20;
        this.playersPerTeam = 11;
        this.currentInnings = 1;
        this.team1 = { name: '', players: [], batting: false };
        this.team2 = { name: '', players: [], batting: false };
        this.battingTeam = null;
        this.bowlingTeam = null;
        this.striker = null;
        this.nonStriker = null;
        this.bowler = null;
        this.score = 0;
        this.wickets = 0;
        this.overs = 0;
        this.balls = 0;
        this.currentOver = [];
        this.ballHistory = [];
        this.target = null;
        this.matchStatus = 'setup';
        this.startTime = null;
        this.partnershipRuns = 0;
        this.partnershipBalls = 0;
    }
}

// Global match instance
let match = new CricketMatch();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateMatchStatus('Match Setup');
    startClock();
    initializeAnimations();
});

function startClock() {
    setInterval(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString();
        document.getElementById('currentTime').textContent = timeString;
    }, 1000);
}

function initializeAnimations() {
    // Add entrance animations to elements
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    });

    document.querySelectorAll('.glass-effect').forEach(el => {
        observer.observe(el);
    });
}

// Match Setup Functions
function updateMatchType() {
    const matchType = document.getElementById('matchType').value;
    const oversInput = document.getElementById('totalOvers');
    
    switch(matchType) {
        case 't20':
            oversInput.value = 20;
            match.totalOvers = 20;
            break;
        case 'odi':
            oversInput.value = 50;
            match.totalOvers = 50;
            break;
        case 'test':
            oversInput.value = 90;
            match.totalOvers = 90;
            break;
        case 'custom':
            // User can set custom overs
            break;
    }
}

function startMatch() {
    const matchType = document.getElementById('matchType').value;
    const totalOvers = parseInt(document.getElementById('totalOvers').value);
    const playersPerTeam = parseInt(document.getElementById('playersPerTeam').value);
    
    match.matchType = matchType;
    match.totalOvers = totalOvers;
    match.playersPerTeam = playersPerTeam;
    
    // Validate inputs
    if (totalOvers < 1 || totalOvers > 100) {
        showNotification('Please enter valid overs (1-100)', 'error');
        return;
    }
    
    if (playersPerTeam < 2 || playersPerTeam > 15) {
        showNotification('Please enter valid players per team (2-15)', 'error');
        return;
    }
    
    // Show team setup
    document.getElementById('matchSetup').classList.add('hidden');
    document.getElementById('teamSetup').classList.remove('hidden');
    generatePlayerInputs();
    updateMatchStatus('Team Setup');
    showNotification('Match configured! Now set up your teams.', 'success');
}

function generatePlayerInputs() {
    const team1Players = document.getElementById('team1Players');
    const team2Players = document.getElementById('team2Players');
    
    team1Players.innerHTML = '';
    team2Players.innerHTML = '';
    
    for (let i = 1; i <= match.playersPerTeam; i++) {
        const player1Input = document.createElement('div');
        player1Input.className = 'flex items-center space-x-3 bg-gray-50 p-3 rounded-lg';
        player1Input.innerHTML = `
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ${i}
            </div>
            <input type="text" placeholder="Player ${i}" id="team1player${i}" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
        `;
        team1Players.appendChild(player1Input);
        
        const player2Input = document.createElement('div');
        player2Input.className = 'flex items-center space-x-3 bg-gray-50 p-3 rounded-lg';
        player2Input.innerHTML = `
            <div class="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ${i}
            </div>
            <input type="text" placeholder="Player ${i}" id="team2player${i}" 
                   class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent">
        `;
        team2Players.appendChild(player2Input);
    }
}

function beginFirstInnings() {
    // Get team names
    const team1Name = document.getElementById('team1Name').value || 'Team 1';
    const team2Name = document.getElementById('team2Name').value || 'Team 2';
    
    match.team1.name = team1Name;
    match.team2.name = team2Name;
    
    // Get players and create player objects
    for (let i = 1; i <= match.playersPerTeam; i++) {
        const player1Name = document.getElementById(`team1player${i}`).value || `Player ${i}`;
        const player2Name = document.getElementById(`team2player${i}`).value || `Player ${i}`;
        
        match.team1.players.push(createPlayer(player1Name));
        match.team2.players.push(createPlayer(player2Name));
    }
    
    // Set batting and bowling teams
    match.battingTeam = match.team1;
    match.bowlingTeam = match.team2;
    match.team1.batting = true;
    match.team2.batting = false;
    
    // Initialize bowler stats
    match.bowlingTeam.players.forEach(player => {
        player.balls = 0;
        player.runs = 0;
        player.wickets = 0;
        player.economy = 0;
    });
    
    // Set opening batsmen and bowler
    match.striker = match.battingTeam.players[0];
    match.nonStriker = match.battingTeam.players[1];
    match.bowler = match.bowlingTeam.players[0];
    
    // Start match timer
    match.startTime = new Date();
    
    // Show scoring interface
    document.getElementById('teamSetup').classList.add('hidden');
    document.getElementById('scoringInterface').classList.remove('hidden');
    document.getElementById('scorecard').classList.remove('hidden');
    
    updateDisplay();
    updateMatchStatus(`${match.battingTeam.name} - 1st Innings`);
    showNotification('First innings started! Good luck!', 'success');
}

function createPlayer(name) {
    return {
        name: name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        howOut: 'not out',
        strikeRate: 0,
        balls: 0,
        runs: 0,
        wickets: 0,
        economy: 0
    };
}

// Scoring Functions
function addRuns(runs) {
    if (match.matchStatus === 'completed') {
        showNotification('Match is completed!', 'warning');
        return;
    }
    
    // Update score and batsman stats
    match.score += runs;
    match.striker.runs += runs;
    match.striker.balls += 1;
    match.bowler.runs += runs;
    match.bowler.balls += 1;
    match.partnershipRuns += runs;
    match.partnershipBalls += 1;
    
    // Track boundaries
    if (runs === 4) {
        match.striker.fours += 1;
        animateBoundary();
    } else if (runs === 6) {
        match.striker.sixes += 1;
        animateBoundary();
    }
    
    // Handle strike rotation
    if (runs % 2 === 1) {
        swapStriker();
    }
    
    // Add to current over
    const ballData = {
        runs: runs,
        isWicket: false,
        batsman: match.striker.name,
        bowler: match.bowler.name,
        over: match.overs + 1,
        ball: match.balls + 1
    };
    
    match.currentOver.push(ballData);
    match.ballHistory.push(ballData);
    
    // Update ball count
    match.balls += 1;
    
    // Check for over completion
    if (match.balls === 6) {
        completeOver();
    }
    
    // Check for match end
    checkMatchEnd();
    
    updateDisplay();
    addBallCommentary(`${runs} run${runs > 1 ? 's' : ''} by ${ballData.batsman}`);
}

function addWide() {
    if (match.matchStatus === 'completed') return;
    
    match.score += 1;
    match.bowler.runs += 1;
    match.bowler.balls += 1;
    
    const ballData = {
        runs: 1,
        isWide: true,
        batsman: 'wide',
        bowler: match.bowler.name,
        over: match.overs + 1,
        ball: match.balls
    };
    
    match.currentOver.push(ballData);
    match.ballHistory.push(ballData);
    
    updateDisplay();
    addBallCommentary('Wide ball - 1 run');
    showNotification('Wide ball added!', 'info');
}

function addNoBall() {
    if (match.matchStatus === 'completed') return;
    
    match.score += 1;
    match.bowler.runs += 1;
    match.bowler.balls += 1;
    
    const ballData = {
        runs: 1,
        isNoBall: true,
        batsman: 'no ball',
        bowler: match.bowler.name,
        over: match.overs + 1,
        ball: match.balls
    };
    
    match.currentOver.push(ballData);
    match.ballHistory.push(ballData);
    
    updateDisplay();
    addBallCommentary('No ball - 1 run + free hit');
    showNotification('No ball added!', 'info');
}

function addByes() {
    if (match.matchStatus === 'completed') return;
    
    const byes = prompt('Enter number of byes:');
    if (byes && !isNaN(byes) && parseInt(byes) >= 0) {
        const byesInt = parseInt(byes);
        match.score += byesInt;
        match.balls += 1;
        match.partnershipBalls += 1;
        
        // Rotate strike if odd byes
        if (byesInt % 2 === 1) {
            swapStriker();
        }
        
        match.bowler.balls += 1;
        
        const ballData = {
            runs: byesInt,
            isByes: true,
            batsman: 'byes',
            bowler: match.bowler.name,
            over: match.overs + 1,
            ball: match.balls
        };
        
        match.currentOver.push(ballData);
        match.ballHistory.push(ballData);
        
        if (match.balls === 6) {
            completeOver();
        }
        
        updateDisplay();
        addBallCommentary(`${byesInt} bye${byesInt > 1 ? 's' : ''}`);
    }
}

function addLegByes() {
    if (match.matchStatus === 'completed') return;
    
    const legByes = prompt('Enter number of leg byes:');
    if (legByes && !isNaN(legByes) && parseInt(legByes) >= 0) {
        const legByesInt = parseInt(legByes);
        match.score += legByesInt;
        match.balls += 1;
        match.partnershipBalls += 1;
        
        // Rotate strike if odd leg byes
        if (legByesInt % 2 === 1) {
            swapStriker();
        }
        
        match.bowler.balls += 1;
        
        const ballData = {
            runs: legByesInt,
            isLegByes: true,
            batsman: 'leg byes',
            bowler: match.bowler.name,
            over: match.overs + 1,
            ball: match.balls
        };
        
        match.currentOver.push(ballData);
        match.ballHistory.push(ballData);
        
        if (match.balls === 6) {
            completeOver();
        }
        
        updateDisplay();
        addBallCommentary(`${legByesInt} leg bye${legByesInt > 1 ? 's' : ''}`);
    }
}

function showWicketDialog() {
    if (match.matchStatus === 'completed') {
        showNotification('Match is completed!', 'warning');
        return;
    }
    
    document.getElementById('wicketDialog').classList.remove('hidden');
    
    // Populate new batsman options
    const newBatsmanSelect = document.getElementById('newBatsman');
    newBatsmanSelect.innerHTML = '';
    
    match.battingTeam.players.forEach(player => {
        if (player.howOut === 'not out' && player !== match.striker && player !== match.nonStriker) {
            newBatsmanSelect.innerHTML += `<option value="${player.name}">${player.name}</option>`;
        }
    });
    
    // If no available batsmen, show a message
    if (newBatsmanSelect.innerHTML === '') {
        newBatsmanSelect.innerHTML = '<option value="">No batsmen available</option>';
    }
}

function updateWicketType() {
    const wicketType = document.getElementById('wicketType').value;
    const fielderSection = document.getElementById('fielderSection');
    
    if (wicketType === 'caught' || wicketType === 'run_out' || wicketType === 'stumped') {
        fielderSection.classList.remove('hidden');
        populateFielders();
    } else {
        fielderSection.classList.add('hidden');
    }
}

function populateFielders() {
    const fielderSelect = document.getElementById('fielder');
    fielderSelect.innerHTML = '';
    
    match.bowlingTeam.players.forEach(player => {
        if (player !== match.bowler) {
            fielderSelect.innerHTML += `<option value="${player.name}">${player.name}</option>`;
        }
    });
}

function confirmWicket() {
    const wicketType = document.getElementById('wicketType').value;
    const newBatsmanName = document.getElementById('newBatsman').value;
    
    if (!newBatsmanName && match.wickets < match.playersPerTeam - 1) {
        showNotification('Please select a new batsman', 'error');
        return;
    }
    
    // Update striker's status
    match.striker.howOut = wicketType;
    match.striker.balls += 1;
    
    match.wickets += 1;
    match.bowler.wickets += 1;
    match.bowler.balls += 1;
    
    // Reset partnership
    match.partnershipRuns = 0;
    match.partnershipBalls = 0;
    
    // Add to current over
    const ballData = {
        runs: 0,
        isWicket: true,
        wicketType: wicketType,
        batsman: match.striker.name,
        bowler: match.bowler.name,
        over: match.overs + 1,
        ball: match.balls + 1
    };
    
    match.currentOver.push(ballData);
    match.ballHistory.push(ballData);
    
    match.balls += 1;
    
    // Animate wicket
    animateWicket();
    
    // Find and set new batsman
    if (newBatsmanName) {
        const newBatsman = match.battingTeam.players.find(p => p.name === newBatsmanName);
        if (newBatsman) {
            match.striker = newBatsman;
        }
    }
    
    closeWicketDialog();
    
    if (match.balls === 6) {
        completeOver();
    }
    
    checkMatchEnd();
    updateDisplay();
    addBallCommentary(`WICKET! ${ballData.batsman} ${wicketType}`);
    showNotification('Wicket fallen!', 'warning');
}

function closeWicketDialog() {
    document.getElementById('wicketDialog').classList.add('hidden');
}

function swapStriker() {
    const temp = match.striker;
    match.striker = match.nonStriker;
    match.nonStriker = temp;
    updateDisplay();
}

function completeOver() {
    match.overs += 1;
    match.balls = 0;
    match.currentOver = [];
    
    // Change bowler
    const currentBowlerIndex = match.bowlingTeam.players.indexOf(match.bowler);
    let nextBowlerIndex = (currentBowlerIndex + 1) % match.bowlingTeam.players.length;
    
    // Skip the same bowler if they've bowled too many overs (in limited overs)
    if (match.matchType !== 'test') {
        let attempts = 0;
        while (attempts < match.bowlingTeam.players.length - 1) {
            const nextBowler = match.bowlingTeam.players[nextBowlerIndex];
            if (nextBowler.balls < match.totalOvers * 6) {
                break;
            }
            nextBowlerIndex = (nextBowlerIndex + 1) % match.bowlingTeam.players.length;
            attempts++;
        }
    }
    
    match.bowler = match.bowlingTeam.players[nextBowlerIndex];
    
    // Swap ends
    swapStriker();
    
    updateDisplay();
    showNotification(`Over ${match.overs} completed!`, 'info');
}

function checkMatchEnd() {
    // Check if all wickets fallen
    if (match.wickets === match.playersPerTeam - 1) {
        endInnings();
        return;
    }
    
    // Check if overs completed
    if (match.overs >= match.totalOvers) {
        endInnings();
        return;
    }
    
    // Check if target achieved (in second innings)
    if (match.currentInnings === 2 && match.target && match.score >= match.target) {
        endMatch();
        return;
    }
}

function endInnings() {
    if (match.currentInnings === 1) {
        // Calculate final score
        const finalScore = match.score;
        const finalWickets = match.wickets;
        
        // Start second innings
        match.currentInnings = 2;
        match.target = match.score + 1;
        
        // Switch teams
        match.battingTeam = match.team2;
        match.bowlingTeam = match.team1;
        match.team1.batting = false;
        match.team2.batting = true;
        
        // Reset score
        match.score = 0;
        match.wickets = 0;
        match.overs = 0;
        match.balls = 0;
        match.currentOver = [];
        match.partnershipRuns = 0;
        match.partnershipBalls = 0;
        
        // Reset batting players
        match.battingTeam.players.forEach(player => {
            player.runs = 0;
            player.balls = 0;
            player.fours = 0;
            player.sixes = 0;
            player.howOut = 'not out';
            player.strikeRate = 0;
        });
        
        // Set new batsmen and bowler
        match.striker = match.battingTeam.players[0];
        match.nonStriker = match.battingTeam.players[1];
        match.bowler = match.bowlingTeam.players[0];
        
        updateMatchStatus(`${match.battingTeam.name} - 2nd Innings (Target: ${match.target})`);
        showNotification(`First innings ended: ${match.team1.name} ${finalScore}/${finalWickets}. Target: ${match.target}`, 'success');
    } else {
        endMatch();
    }
    
    updateDisplay();
}

function endMatch() {
    match.matchStatus = 'completed';
    updateMatchStatus('Match Completed');
    
    // Determine winner
    const team1Score = calculateTeamScore(match.team1);
    const team2Score = calculateTeamScore(match.team2);
    
    let result;
    if (team1Score > team2Score) {
        const margin = team1Score - team2Score;
        result = `${match.team1.name} won by ${margin} run${margin > 1 ? 's' : ''}`;
    } else if (team2Score > team1Score) {
        const wickets = match.playersPerTeam - 1 - match.wickets;
        result = `${match.team2.name} won by ${wickets} wicket${wickets > 1 ? 's' : ''}`;
    } else {
        result = 'Match tied';
    }
    
    showNotification(`Match Result: ${result}`, 'success');
    
    // Show result dialog
    setTimeout(() => {
        alert(`Match Completed!\n\n${result}\n\n${match.team1.name}: ${team1Score}/${match.team1.players.filter(p => p.howOut !== 'not out').length}\n${match.team2.name}: ${team2Score}/${match.team2.players.filter(p => p.howOut !== 'not out').length}`);
    }, 1000);
}

function calculateTeamScore(team) {
    return team.players.reduce((total, player) => total + player.runs, 0);
}

function undoLastBall() {
    if (match.ballHistory.length === 0) {
        showNotification('No balls to undo', 'warning');
        return;
    }
    
    const lastBall = match.ballHistory.pop();
    
    // Implement undo logic based on ball type
    if (lastBall.isWicket) {
        match.wickets -= 1;
        match.bowler.wickets -= 1;
    } else if (lastBall.isWide || lastBall.isNoBall) {
        match.score -= lastBall.runs;
        match.bowler.runs -= lastBall.runs;
    } else if (lastBall.isByes || lastBall.isLegByes) {
        match.score -= lastBall.runs;
        match.balls -= 1;
    } else {
        match.score -= lastBall.runs;
        match.striker.runs -= lastBall.runs;
        match.striker.balls -= 1;
        match.bowler.runs -= lastBall.runs;
        match.balls -= 1;
    }
    
    // Remove from current over if it's the most recent ball
    if (match.currentOver.length > 0) {
        match.currentOver.pop();
    }
    
    updateDisplay();
    showNotification('Last ball undone', 'info');
}

// Display Functions
function updateDisplay() {
    // Update score
    document.getElementById('totalScore').textContent = `${match.score}/${match.wickets}`;
    
    // Update overs
    const oversDisplay = `${match.overs}.${match.balls}`;
    document.getElementById('oversCount').textContent = oversDisplay;
    
    // Update run rate
    const totalBalls = match.overs * 6 + match.balls;
    const runRate = totalBalls > 0 ? (match.score / totalBalls * 6).toFixed(2) : '0.00';
    document.getElementById('runRate').textContent = runRate;
    
    // Update target
    document.getElementById('target').textContent = match.target || '-';
    
    // Update over number
    document.getElementById('overNumber').textContent = `Over ${match.overs + 1}`;
    
    // Update striker
    if (match.striker) {
        document.getElementById('strikerName').textContent = match.striker.name;
        document.getElementById('strikerRuns').textContent = `(${match.striker.runs} runs)`;
        document.getElementById('strikerBalls').textContent = match.striker.balls;
        document.getElementById('strikerFours').textContent = match.striker.fours;
        document.getElementById('strikerSixes').textContent = match.striker.sixes;
        
        const sr = match.striker.balls > 0 ? 
            (match.striker.runs / match.striker.balls * 100).toFixed(2) : '0.00';
        document.getElementById('strikerSR').textContent = sr;
    }
    
    // Update non-striker
    if (match.nonStriker) {
        document.getElementById('nonStrikerName').textContent = match.nonStriker.name;
        document.getElementById('nonStrikerRuns').textContent = `(${match.nonStriker.runs} runs)`;
        document.getElementById('nonStrikerBalls').textContent = match.nonStriker.balls;
        document.getElementById('nonStrikerFours').textContent = match.nonStriker.fours;
        document.getElementById('nonStrikerSixes').textContent = match.nonStriker.sixes;
        
        const sr = match.nonStriker.balls > 0 ? 
            (match.nonStriker.runs / match.nonStriker.balls * 100).toFixed(2) : '0.00';
        document.getElementById('nonStrikerSR').textContent = sr;
    }
    
    // Update bowler
    if (match.bowler) {
        document.getElementById('bowlerName').textContent = match.bowler.name;
        const bowlerOvers = Math.floor(match.bowler.balls / 6) + '.' + (match.bowler.balls % 6);
        document.getElementById('bowlerOvers').textContent = bowlerOvers;
        document.getElementById('bowlerRuns').textContent = match.bowler.runs;
        document.getElementById('bowlerWickets').textContent = match.bowler.wickets;
        
        const economy = match.bowler.balls > 0 ? 
            (match.bowler.runs / match.bowler.balls * 6).toFixed(2) : '0.00';
        document.getElementById('bowlerEconomy').textContent = economy;
    }
    
    // Update current over balls
    updateCurrentOverDisplay();
    
    // Update scorecard
    updateScorecard();
}

function updateCurrentOverDisplay() {
    const container = document.getElementById('currentOverBalls');
    container.innerHTML = '';
    
    match.currentOver.forEach((ball, index) => {
        let ballClass = 'ball-indicator w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ';
        
        if (ball.isWicket) {
            ballClass += 'bg-red-500 wicket-fall';
        } else if (ball.isWide || ball.isNoBall) {
            ballClass += 'bg-yellow-500';
        } else if (ball.isByes || ball.isLegByes) {
            ballClass += 'bg-purple-500';
        } else if (ball.runs === 4) {
            ballClass += 'bg-green-500 boundary-hit';
        } else if (ball.runs === 6) {
            ballClass += 'bg-green-600 boundary-hit';
        } else {
            ballClass += 'bg-blue-500';
        }
        
        let displayText = ball.runs.toString();
        if (ball.isWicket) displayText = 'W';
        if (ball.isWide) displayText = 'WD';
        if (ball.isNoBall) displayText = 'NB';
        if (ball.isByes) displayText = 'B' + ball.runs;
        if (ball.isLegByes) displayText = 'LB' + ball.runs;
        
        const ballElement = document.createElement('div');
        ballElement.className = ballClass;
        ballElement.title = `${ball.batsman} vs ${ball.bowler}`;
        ballElement.textContent = displayText;
        
        container.appendChild(ballElement);
    });
}

function addBallCommentary(text) {
    const commentary = document.getElementById('ballByBallCommentary');
    const ballNumber = match.overs * 6 + match.balls;
    
    const commentaryItem = document.createElement('div');
    commentaryItem.className = 'text-sm p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500 slide-in';
    
    const time = new Date().toLocaleTimeString();
    commentaryItem.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <span class="font-semibold text-blue-600">Ball ${ballNumber}:</span>
                <span class="ml-2">${text}</span>
            </div>
            <span class="text-xs text-gray-500">${time}</span>
        </div>
    `;
    
    commentary.insertBefore(commentaryItem, commentary.firstChild);
    
    // Keep only last 10 balls in view
    while (commentary.children.length > 10) {
        commentary.removeChild(commentary.lastChild);
    }
}

function updateScorecard() {
    // Update batting scorecard
    const battingBody = document.getElementById('battingScorecard');
    battingBody.innerHTML = '';
    
    match.battingTeam.players.forEach(player => {
        const sr = player.balls > 0 ? 
            (player.runs / player.balls * 100).toFixed(2) : '0.00';
        
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 transition-colors';
        row.innerHTML = `
            <td class="border border-gray-300 px-4 py-3 font-medium">${player.name}</td>
            <td class="border border-gray-300 px-4 py-3 text-center font-semibold">${player.runs}</td>
            <td class="border border-gray-300 px-4 py-3 text-center">${player.balls}</td>
            <td class="border border-gray-300 px-4 py-3 text-center">${player.fours}</td>
            <td class="border border-gray-300 px-4 py-3 text-center">${player.sixes}</td>
            <td class="border border-gray-300 px-4 py-3 text-center">${sr}</td>
            <td class="border border-gray-300 px-4 py-3">${player.howOut}</td>
        `;
        battingBody.appendChild(row);
    });
    
    // Update bowling scorecard
    const bowlingBody = document.getElementById('bowlingScorecard');
    bowlingBody.innerHTML = '';
    
    match.bowlingTeam.players.forEach(player => {
        if (player.runs > 0 || player.balls > 0) {
            const overs = Math.floor(player.balls / 6) + '.' + (player.balls % 6);
            const economy = player.balls > 0 ? 
                (player.runs / player.balls * 6).toFixed(2) : '0.00';
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50 transition-colors';
            row.innerHTML = `
                <td class="border border-gray-300 px-4 py-3 font-medium">${player.name}</td>
                <td class="border border-gray-300 px-4 py-3 text-center">${overs}</td>
                <td class="border border-gray-300 px-4 py-3 text-center font-semibold">${player.runs}</td>
                <td class="border border-gray-300 px-4 py-3 text-center font-semibold">${player.wickets}</td>
                <td class="border border-gray-300 px-4 py-3 text-center">${economy}</td>
            `;
            bowlingBody.appendChild(row);
        }
    });
}

function updateMatchStatus(status) {
    document.getElementById('matchStatus').textContent = status;
}

function resetMatch() {
    if (confirm('Are you sure you want to reset the match? All current data will be lost.')) {
        match.reset();
        
        // Reset UI
        document.getElementById('matchSetup').classList.remove('hidden');
        document.getElementById('teamSetup').classList.add('hidden');
        document.getElementById('scoringInterface').classList.add('hidden');
        document.getElementById('scorecard').classList.add('hidden');
        
        // Reset form values
        document.getElementById('matchType').value = 't20';
        document.getElementById('totalOvers').value = 20;
        document.getElementById('playersPerTeam').value = 11;
        document.getElementById('team1Name').value = '';
        document.getElementById('team2Name').value = '';
        
        updateMatchStatus('Match Setup');
        showNotification('Match reset successfully', 'success');
    }
}

// Animation Functions
function animateBoundary() {
    const scoreDisplay = document.getElementById('totalScore');
    scoreDisplay.classList.add('boundary-hit');
    setTimeout(() => {
        scoreDisplay.classList.remove('boundary-hit');
    }, 1000);
}

function animateWicket() {
    const scoreDisplay = document.getElementById('totalScore');
    scoreDisplay.classList.add('wicket-fall');
    setTimeout(() => {
        scoreDisplay.classList.remove('wicket-fall');
    }, 800);
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-4 rounded-lg shadow-xl z-50 transform transition-all duration-300 translate-x-full`;
    
    // Set color based on type
    switch(type) {
        case 'success':
            notification.className += ' bg-green-500 text-white';
            break;
        case 'error':
            notification.className += ' bg-red-500 text-white';
            break;
        case 'warning':
            notification.className += ' bg-yellow-500 text-white';
            break;
        default:
            notification.className += ' bg-blue-500 text-white';
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} mr-3"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Slide in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
        notification.classList.add('translate-x-0');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('translate-x-0');
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
