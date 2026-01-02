import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [players, setPlayers] = useState(['', '', '', ''])
  const [scores, setScores] = useState([0, 0]) // Team 1 (players 0&2) vs Team 2 (players 1&3)
  const [currentDealer, setCurrentDealer] = useState(0)
  const [trump, setTrump] = useState('')
  const [trumpTeam, setTrumpTeam] = useState(null) // null, 0, or 1
  const [roundPoints, setRoundPoints] = useState([0, 0])
  const [animateScore, setAnimateScore] = useState([false, false])
  const [trumpAnimation, setTrumpAnimation] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [winner, setWinner] = useState(null)
  const [stats, setStats] = useState({
    trumpTeam0: 0,
    trumpTeam1: 0,
    trumpSuits: { 'Spades': 0, 'Hearts': 0, 'Diamonds': 0, 'Clubs': 0 },
    roundsPlayed: 0,
    skippedRounds: 0,
    roundsWonByTeam: [0, 0],
    pointsByTeam: { team0: { p1: 0, p2: 0, p4: 0 }, team1: { p1: 0, p2: 0, p4: 0 } },
    euchreEvents: 0,
    lonerEvents: 0,
    euchreByTeam: [0, 0],
    lonerByTeam: [0, 0]
  })

  const suits = ['♠️ Spades', '♥️ Hearts', '♦️ Diamonds', '♣️ Clubs']
  const suitName = trump ? trump.split(' ')[1] : null
  const suitSymbol = trump ? trump.split(' ')[0] : ''
  const [showSuitOptions, setShowSuitOptions] = useState(false)
  const [roundStep, setRoundStep] = useState('selectSuit')
  const [showScoreHelp, setShowScoreHelp] = useState(false)
  const [selectingDealer, setSelectingDealer] = useState(false)
  const [teamNames, setTeamNames] = useState({ team0: 'Team A', team1: 'Team B' })
  const [editingTeam, setEditingTeam] = useState(null) // 0 or 1 or null
  const [history, setHistory] = useState([]) // round-by-round events
  const [showHistory, setShowHistory] = useState(false)
  const [initialDealer, setInitialDealer] = useState(null)

  // Randomize feature removed per user request

  const updateTeamName = (teamIdx, value) => {
    const v = (value || '').trim()
    if (!v) return
    setTeamNames(prev => ({ ...prev, [teamIdx === 0 ? 'team0' : 'team1']: v }))
    setEditingTeam(null)
  }

  const overlayColor = (() => {
    if (!trump) return '#0f172a' // slate-900
    switch (suitName) {
      case 'Spades': return '#1e3a8a' // blue-800 for better contrast
      case 'Clubs': return '#065f46' // emerald-700 for better contrast
      case 'Hearts': return '#3b0a0a' // deep rose
      case 'Diamonds': return '#3f0b0b' // deep red
      default: return '#0f172a'
    }
  })()

  const patternFill = (() => {
    switch (suitName) {
      case 'Spades':
      case 'Clubs':
        return '#000000' // darker icons for black suits
      case 'Hearts':
      case 'Diamonds':
        return '#ffffff' // lighter icons for red suits
      default:
        return '#ffffff'
    }
  })()

  const patternOpacity = (() => {
    switch (suitName) {
      case 'Spades':
      case 'Clubs':
        return 0.35 // slightly stronger for visibility on blue/emerald
      case 'Hearts':
      case 'Diamonds':
        return 0.25 // lighter on deep reds
      default:
        return 0.2
    }
  })()

  const patternDataUrl = (() => {
    if (!trump) return null
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='70' height='70'>
        <rect width='100%' height='100%' fill='transparent'/>
        <text x='50%' y='50%' dy='.35em' text-anchor='middle' font-size='38' fill='${patternFill}' opacity='${patternOpacity}'>${suitSymbol}</text>
      </svg>`
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
  })()

  const formatName = (name) => {
    const trimmed = (name ?? '').trim()
    if (!trimmed) return ''
    return trimmed
      .split(/\s+/)
      .map((word) =>
        word
          .split(/(-|')/)
          .map((part) =>
            part === '-' || part === "'"
              ? part
              : part ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : ''
          )
          .join('')
      )
      .join(' ')
  }

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players]
    newPlayers[index] = formatName(value)
    setPlayers(newPlayers)
  }

  const startGame = () => {
    if (players.every(p => p.trim() !== '')) {
      setGameStarted(true)
      setSelectingDealer(true)
    }
  }

  const handlePointSelect = (points) => {
    if (trumpTeam === null) return
    
    // Add points to the appropriate team
    const newScores = [...scores]
    newScores[trumpTeam] += points
    setScores(newScores)
    
    // Trigger score animation
    const newAnimate = [false, false]
    newAnimate[trumpTeam] = true
    setAnimateScore(newAnimate)
    setTimeout(() => setAnimateScore([false, false]), 800)
    
    // Move to next dealer
    const nextDealer = (currentDealer + 1) % 4
    setCurrentDealer(nextDealer)
    
    // Reset round state
    setTrump('')
    setTrumpTeam(null)
    
    // Removed popup for next dealer per request
  }

  const resetGame = () => {
    setScores([0, 0])
    setCurrentDealer(0)
    setTrump('')
    setTrumpTeam(null)
    setRoundPoints([0, 0])
    
    setAnimateScore([false, false])
    setGameEnded(false)
    setWinner(null)
    setStats({
      trumpTeam0: 0,
      trumpTeam1: 0,
      trumpSuits: { 'Spades': 0, 'Hearts': 0, 'Diamonds': 0, 'Clubs': 0 },
      roundsPlayed: 0,
      skippedRounds: 0,
      roundsWonByTeam: [0, 0],
      pointsByTeam: { team0: { p1: 0, p2: 0, p4: 0 }, team1: { p1: 0, p2: 0, p4: 0 } },
      euchreEvents: 0,
      lonerEvents: 0,
      euchreByTeam: [0, 0],
      lonerByTeam: [0, 0]
    })
  }

  const newGame = () => {
    setGameStarted(false)
    setPlayers(['', '', '', ''])
    setScores([0, 0])
    setCurrentDealer(0)
    setTrump('')
    setTrumpTeam(null)
    setRoundPoints([0, 0])
    
    setAnimateScore([false, false])
    setGameEnded(false)
    setWinner(null)
    setStats({
      trumpTeam0: 0,
      trumpTeam1: 0,
      trumpSuits: { 'Spades': 0, 'Hearts': 0, 'Diamonds': 0, 'Clubs': 0 },
      roundsPlayed: 0,
      skippedRounds: 0,
      roundsWonByTeam: [0, 0],
      pointsByTeam: { team0: { p1: 0, p2: 0, p4: 0 }, team1: { p1: 0, p2: 0, p4: 0 } },
      euchreEvents: 0,
      lonerEvents: 0,
      euchreByTeam: [0, 0],
      lonerByTeam: [0, 0]
    })
  }

  const playAgain = () => {
    // Keep player names and team names, reset game state
    setScores([0, 0])
    setCurrentDealer(0)
    setTrump('')
    setTrumpTeam(null)
    setRoundPoints([0, 0])
    
    setAnimateScore([false, false])
    setGameEnded(false)
    setWinner(null)
    setStats({
      trumpTeam0: 0,
      trumpTeam1: 0,
      trumpSuits: { 'Spades': 0, 'Hearts': 0, 'Diamonds': 0, 'Clubs': 0 },
      roundsPlayed: 0,
      skippedRounds: 0,
      roundsWonByTeam: [0, 0],
      pointsByTeam: { team0: { p1: 0, p2: 0, p4: 0 }, team1: { p1: 0, p2: 0, p4: 0 } },
      euchreEvents: 0,
      lonerEvents: 0,
      euchreByTeam: [0, 0],
      lonerByTeam: [0, 0]
    })
    setGameStarted(true)
    setSelectingDealer(true) // Ask for the dealer again
  }

  const handleRoundEnd = (pointsForRound, callerTeam = null, outcomeType = null) => {
    const pts = pointsForRound ?? roundPoints
    // Add points to each team
    const newScores = [scores[0] + pts[0], scores[1] + pts[1]]
    setScores(newScores)

    // Trigger score animations
    if (pts[0] > 0) {
      setAnimateScore([true, false])
      setTimeout(() => setAnimateScore([false, false]), 800)
    }
    if (pts[1] > 0) {
      setAnimateScore([false, true])
      setTimeout(() => setAnimateScore([false, false]), 800)
    }
    if (pts[0] > 0 && pts[1] > 0) {
      setAnimateScore([true, true])
      setTimeout(() => setAnimateScore([false, false]), 800)
    }

    // Update stats
    const suitName = trump.split(' ')[1]
    const newStats = { ...stats }
    const caller = callerTeam !== null ? callerTeam : trumpTeam
    if (caller === 0) newStats.trumpTeam0++
    if (caller === 1) newStats.trumpTeam1++
    newStats.trumpSuits[suitName]++
    newStats.roundsPlayed++
    const scoringTeam = pts[0] > 0 ? 0 : (pts[1] > 0 ? 1 : null)
    if (scoringTeam !== null) {
      newStats.roundsWonByTeam[scoringTeam] = (newStats.roundsWonByTeam[scoringTeam] || 0) + 1
      const pval = pts[scoringTeam]
      if (pval === 1) newStats.pointsByTeam[scoringTeam === 0 ? 'team0' : 'team1'].p1++
      if (pval === 2) newStats.pointsByTeam[scoringTeam === 0 ? 'team0' : 'team1'].p2++
      if (pval === 4) newStats.pointsByTeam[scoringTeam === 0 ? 'team0' : 'team1'].p4++
      if (outcomeType === 'euchre') {
        newStats.euchreEvents++
        newStats.euchreByTeam[scoringTeam] = (newStats.euchreByTeam[scoringTeam] || 0) + 1
      }
      if (outcomeType === 'loner') {
        newStats.lonerEvents++
        newStats.lonerByTeam[scoringTeam] = (newStats.lonerByTeam[scoringTeam] || 0) + 1
      }
    }
    setStats(newStats)

    // Record history event for this round
    const eventPoints = scoringTeam !== null ? pts[scoringTeam] : 0
    const event = {
      id: Date.now(),
      round: history.length + 1,
      dealerIdx: currentDealer,
      trumpSuit: trump,
      callerTeam: caller,
      scoringTeam,
      pointsAwarded: eventPoints,
      outcomeType,
    }
    setHistory(prev => [...prev, event])

    // Check for winner
    if (newScores[0] >= 10 || newScores[1] >= 10) {
      const winnerTeam = newScores[0] >= 10 ? 0 : 1
      setWinner(winnerTeam)
      setGameEnded(true)
      return
    }

    // Move to next dealer
    const nextDealer = (currentDealer + 1) % 4
    setCurrentDealer(nextDealer)

    // Reset round state
    setRoundPoints([0, 0])
    setTrump('')
    setTrumpTeam(null)
    setRoundStep('selectSuit')

    // Removed popup for next dealer per request
  }

  const handleTrumpSelect = (suit) => {
    setTrump(suit)
    setTrumpAnimation(true)
    setShowSuitOptions(false)
    setRoundStep('score')
    setTimeout(() => setTrumpAnimation(false), 600)
  }

  const skipDealer = () => {
    // Advance dealer without scoring when all pass
    const nextDealer = (currentDealer + 1) % 4
    setCurrentDealer(nextDealer)
    // Reset round state
    setRoundPoints([0, 0])
    setTrump('')
    setTrumpTeam(null)
    setRoundStep('selectSuit')
    setStats(prev => ({
      ...prev,
      skippedRounds: prev.skippedRounds + 1
    }))
    // Record skip in history
    const event = {
      id: Date.now(),
      round: history.length + 1,
      dealerIdx: (nextDealer + 3) % 4, // previous dealer just passed
      trumpSuit: '',
      callerTeam: null,
      scoringTeam: null,
      pointsAwarded: 0,
      outcomeType: 'skip',
    }
    setHistory(prev => [...prev, event])
  }

  const recomputeFromHistory = (events) => {
    // Reset stats and scores and recompute from history
    let recomputedScores = [0, 0]
    const recomputedStats = {
      trumpTeam0: 0,
      trumpTeam1: 0,
      trumpSuits: { 'Spades': 0, 'Hearts': 0, 'Diamonds': 0, 'Clubs': 0 },
      roundsPlayed: 0,
      skippedRounds: 0,
      roundsWonByTeam: [0, 0],
      pointsByTeam: { team0: { p1: 0, p2: 0, p4: 0 }, team1: { p1: 0, p2: 0, p4: 0 } },
      euchreEvents: 0,
      lonerEvents: 0,
      euchreByTeam: [0, 0],
      lonerByTeam: [0, 0]
    }
    events.forEach(ev => {
      if (ev.outcomeType === 'skip') {
        recomputedStats.skippedRounds++
        return
      }
      const scoringTeam = ev.scoringTeam
      const points = ev.pointsAwarded || 0
      if (scoringTeam === 0 || scoringTeam === 1) {
        recomputedScores[scoringTeam] += points
        recomputedStats.roundsWonByTeam[scoringTeam] = (recomputedStats.roundsWonByTeam[scoringTeam] || 0) + 1
        if (points === 1) recomputedStats.pointsByTeam[scoringTeam === 0 ? 'team0' : 'team1'].p1++
        if (points === 2) recomputedStats.pointsByTeam[scoringTeam === 0 ? 'team0' : 'team1'].p2++
        if (points === 4) recomputedStats.pointsByTeam[scoringTeam === 0 ? 'team0' : 'team1'].p4++
      }
      const caller = ev.callerTeam
      if (caller === 0) recomputedStats.trumpTeam0++
      if (caller === 1) recomputedStats.trumpTeam1++
      const suitName = ev.trumpSuit ? ev.trumpSuit.split(' ')[1] : null
      if (suitName && recomputedStats.trumpSuits[suitName] !== undefined) {
        recomputedStats.trumpSuits[suitName]++
      }
      recomputedStats.roundsPlayed++
      if (ev.outcomeType === 'euchre') {
        recomputedStats.euchreEvents++
        if (scoringTeam === 0 || scoringTeam === 1) {
          recomputedStats.euchreByTeam[scoringTeam] = (recomputedStats.euchreByTeam[scoringTeam] || 0) + 1
        }
      }
      if (ev.outcomeType === 'loner') {
        recomputedStats.lonerEvents++
        if (scoringTeam === 0 || scoringTeam === 1) {
          recomputedStats.lonerByTeam[scoringTeam] = (recomputedStats.lonerByTeam[scoringTeam] || 0) + 1
        }
      }
    })
    setScores(recomputedScores)
    setStats(recomputedStats)
    // Recompute current dealer based on initialDealer and number of events
    if (initialDealer !== null) {
      const turns = events.length
      setCurrentDealer((initialDealer + turns) % 4)
    }
    // Reset round UI state
    setTrump('')
    setTrumpTeam(null)
    setRoundStep('selectSuit')
    setGameEnded(recomputedScores[0] >= 10 || recomputedScores[1] >= 10)
    setWinner(recomputedScores[0] >= 10 ? 0 : (recomputedScores[1] >= 10 ? 1 : null))
  }

  const handleOutcome = (team, outcome) => {
    let points = 0
    let caller = null
    switch (outcome) {
      case 'plus1':
        points = 1
        caller = team
        break
      case 'euchre':
        points = 2
        caller = team === 0 ? 1 : 0 // opposite team called and was euchred
        break
      case 'loner':
        points = 4
        caller = team
        break
      default:
        points = 0
        caller = null
    }
    setTrumpTeam(caller)
    const newPoints = [0, 0]
    newPoints[team] = points
    handleRoundEnd(newPoints, caller, outcome)
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl space-y-8">
          <h1 className="text-center text-6xl font-extrabold text-yellow-300">Euchre Score Keeper</h1>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 shadow-xl">
            <h2 className="text-center text-2xl font-semibold text-yellow-300 mb-6">Enter Player Names</h2>
            <div className="flex items-center justify-center gap-6 mb-6">
              <button className="rounded-lg border border-blue-600 bg-blue-900/60 px-4 py-2 text-blue-200 text-lg font-semibold hover:bg-blue-800" onClick={() => setEditingTeam(0)}>{teamNames.team0}</button>
              <button className="rounded-lg border border-red-600 bg-red-900/60 px-4 py-2 text-red-200 text-lg font-semibold hover:bg-red-800" onClick={() => setEditingTeam(1)}>{teamNames.team1}</button>
            </div>
            {editingTeam !== null && (
              <div className="mb-4 max-w-xl mx-auto">
                <input type="text" value={editingTeam === 0 ? teamNames.team0 : teamNames.team1} onChange={(e) => setTeamNames(prev => (editingTeam === 0 ? { ...prev, team0: e.target.value } : { ...prev, team1: e.target.value }))} className="w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-4 py-3 text-slate-100 focus:border-primary focus:outline-none" />
                <div className="mt-2 flex justify-end">
                  <button className="rounded-md bg-primary px-3 py-1.5 text-white text-sm hover:bg-emerald-700" onClick={() => updateTeamName(editingTeam, editingTeam === 0 ? teamNames.team0 : teamNames.team1)}>Save Name</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl border-2 border-blue-600 bg-blue-900/50 p-6">
                <label className="text-blue-300 font-medium">Player 1 (Blue)</label>
                <input type="text" value={players[0]} onChange={(e) => handlePlayerChange(0, e.target.value)} placeholder="Enter name" className="mt-1 w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
              <div className="rounded-xl border-2 border-red-600 bg-red-900/50 p-6">
                <label className="text-red-300 font-medium">Player 2 (Red)</label>
                <input type="text" value={players[1]} onChange={(e) => handlePlayerChange(1, e.target.value)} placeholder="Enter name" className="mt-1 w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
              <div className="rounded-xl border-2 border-red-600 bg-red-900/50 p-6">
                <label className="text-red-300 font-medium">Player 4 (Red)</label>
                <input type="text" value={players[3]} onChange={(e) => handlePlayerChange(3, e.target.value)} placeholder="Enter name" className="mt-1 w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
              <div className="rounded-xl border-2 border-blue-600 bg-blue-900/50 p-6">
                <label className="text-blue-300 font-medium">Player 3 (Blue)</label>
                <input type="text" value={players[2]} onChange={(e) => handlePlayerChange(2, e.target.value)} placeholder="Enter name" className="mt-1 w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
            </div>
            <p className="text-center text-slate-400 mt-4">Blue and Red are opposite teams. Partners are diagonal (1 & 3 are Blue, 2 & 4 are Red).</p>
            <button className="mt-6 w-full rounded-xl bg-primary px-6 py-5 text-xl font-bold text-white transition-colors disabled:opacity-50 hover:bg-emerald-700" onClick={startGame} disabled={!players.every(p => p.trim() !== '')}>Start Game</button>
          </div>
        </div>
        <div className="mt-6 text-center text-slate-400">
          <span>Made by </span>
          <a href="https://github.com/matt-dagostino" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">Matteo Dagostino</a>
          <span className="text-slate-500 mx-2">·</span>
          <a href="https://www.linkedin.com/in/matt-dag09/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300">LinkedIn</a>
        </div>
      </div>
    )
  }

  // Dealer selection step right after starting
  if (gameStarted && selectingDealer && !gameEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <h2 className="text-center text-2xl font-semibold text-yellow-300 mb-4">Select the Dealer</h2>
          <p className="text-center text-slate-300 mb-6">Tap the player who deals first</p>
          <div className="grid grid-cols-2 gap-4">
            {[0,1,3,2].map((idx) => {
              const isBlue = idx === 0 || idx === 2
              const btnClasses = isBlue
                ? "rounded-xl border-2 border-blue-600 bg-blue-900/50 px-4 py-5 text-blue-100 text-xl font-semibold hover:bg-blue-800"
                : "rounded-xl border-2 border-red-600 bg-red-900/50 px-4 py-5 text-red-100 text-xl font-semibold hover:bg-red-800"
              return (
                <button key={idx} className={btnClasses} onClick={() => {
                  setCurrentDealer(idx)
                  setInitialDealer(idx)
                  setSelectingDealer(false)
                }}>
                  {players[idx]}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  if (gameEnded && winner !== null) {
    const winnerTeam = winner
    const winnerNames = `${players[winnerTeam]} & ${players[winnerTeam + 2]}`
    const team1Trump = stats.trumpTeam0
    const team2Trump = stats.trumpTeam1
    const mostCommonSuit = Object.entries(stats.trumpSuits).sort((a, b) => b[1] - a[1])[0]
    const totalRoundsWithSkips = stats.roundsPlayed + (stats.skippedRounds || 0)
    const team1Points = stats.pointsByTeam.team0
    const team2Points = stats.pointsByTeam.team1

    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-xl text-center">
          <h1 className="text-3xl font-bold text-yellow-300 mb-4">🎉 GAME OVER! 🎉</h1>
          <div className="rounded-2xl bg-primary p-6 mb-6 shadow">
            <h2 className="text-white text-2xl font-semibold mb-2">{winner === 0 ? teamNames.team0 : teamNames.team1} Wins!</h2>
            <div className="text-white/90 text-lg font-medium mb-2">{winnerNames}</div>
            <div className="text-yellow-300 text-4xl font-extrabold">{scores[0]} - {scores[1]}</div>
          </div>

          <div className="mb-6">
            <h3 className="text-yellow-300 text-2xl font-semibold mb-4">Game Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-slate-300 text-sm font-medium uppercase">Total Rounds (incl. skips)</div>
                <div className="text-yellow-300 text-2xl font-bold">{totalRoundsWithSkips}</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-slate-300 text-sm font-medium uppercase">Skipped Rounds</div>
                <div className="text-yellow-300 text-2xl font-bold">{stats.skippedRounds}</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                <div className="text-slate-300 text-sm font-medium uppercase">Most Chosen Suit</div>
                <div className="text-yellow-300 text-xl font-bold">{mostCommonSuit[0]}</div>
                <div className="text-slate-400 text-sm">{mostCommonSuit[1]} times</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6 mb-6 text-left">
              <h4 className="text-yellow-300 text-xl font-semibold mb-3">Suit Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100 text-lg">♠️ Spades</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.trumpSuits['Spades']}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100 text-lg">♥️ Hearts</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.trumpSuits['Hearts']}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100 text-lg">♦️ Diamonds</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.trumpSuits['Diamonds']}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100 text-lg">♣️ Clubs</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.trumpSuits['Clubs']}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
                <h4 className="text-yellow-300 text-xl font-semibold mb-2">Team Calls</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-3 mb-2">
                  <span className="text-slate-100">{teamNames.team0}</span>
                  <span className="text-emerald-400 font-bold text-xl">{team1Trump}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-3">
                  <span className="text-slate-100">{teamNames.team1}</span>
                  <span className="text-emerald-400 font-bold text-xl">{team2Trump}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-6">
                <h4 className="text-yellow-300 text-xl font-semibold mb-2">Outcomes</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-3 mb-2">
                  <span className="text-slate-100">Euchres</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.euchreEvents} <span className="text-slate-400 text-sm">({teamNames.team0}: {stats.euchreByTeam[0]}, {teamNames.team1}: {stats.euchreByTeam[1]})</span></span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-3">
                  <span className="text-slate-100">Loners</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.lonerEvents} <span className="text-slate-400 text-sm">({teamNames.team0}: {stats.lonerByTeam[0]}, {teamNames.team1}: {stats.lonerByTeam[1]})</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="w-full rounded-xl bg-primary px-5 py-4 text-lg font-bold text-white hover:bg-emerald-700" onClick={playAgain}>
              Play Again
            </button>
            <button className="w-full rounded-xl bg-slate-300 px-5 py-4 text-lg font-bold text-slate-900 hover:bg-slate-200" onClick={newGame}>
              New Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-300">Euchre Score Keeper</h1>
        <div className="flex gap-2">
          <button className="rounded-lg bg-accent px-4 py-3 text-white text-lg font-semibold hover:bg-red-600" onClick={resetGame}>Reset Scores</button>
          <button className="rounded-lg bg-slate-300 px-4 py-3 text-slate-900 text-lg font-semibold hover:bg-slate-200" onClick={newGame}>New Game</button>
          <button className="rounded-lg bg-slate-700 px-4 py-3 text-white text-lg font-semibold hover:bg-slate-600" onClick={() => setShowHistory(v => !v)}>{showHistory ? 'Hide History' : 'Show History'}</button>
        </div>
      </div>

      {/* Scores at the top (shrinks during round) */}
      {(() => {
        const headerShrink = Boolean(trump) && roundStep === 'score'
        return (
          <motion.div
            className={`grid grid-cols-3 items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 shadow ${headerShrink ? 'p-3 sticky top-0 z-20 bg-slate-800/90 backdrop-blur' : 'p-6'}`}
            initial={false}
            animate={headerShrink ? { scale: 0.9, y: -6, opacity: 0.98 } : { scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <div className="text-center">
              <h2 className={`text-yellow-300 font-semibold ${headerShrink ? 'text-base' : 'text-xl'}`}>{teamNames.team0}</h2>
              <div className={`text-slate-300 font-medium ${headerShrink ? 'text-xs' : 'text-lg'}`}>{players[0]} & {players[2]}</div>
              <div className={`leading-none font-extrabold text-yellow-400 transition-transform ${headerShrink ? 'text-4xl sm:text-5xl' : 'text-7xl sm:text-8xl'} ${animateScore[0] ? 'scale-110' : ''} drop-shadow-[0_0_6px_rgba(255,255,0,0.25)]`}>{scores[0]}</div>
            </div>
            <div className={`text-center text-yellow-300 font-bold ${headerShrink ? 'text-base' : 'text-2xl'}`}>VS</div>
            <div className="text-center">
              <h2 className={`text-yellow-300 font-semibold ${headerShrink ? 'text-base' : 'text-xl'}`}>{teamNames.team1}</h2>
              <div className={`text-slate-300 font-medium ${headerShrink ? 'text-xs' : 'text-lg'}`}>{players[1]} & {players[3]}</div>
              <div className={`leading-none font-extrabold text-yellow-400 transition-transform ${headerShrink ? 'text-4xl sm:text-5xl' : 'text-7xl sm:text-8xl'} ${animateScore[1] ? 'scale-110' : ''} drop-shadow-[0_0_6px_rgba(255,255,0,0.25)]`}>{scores[1]}</div>
            </div>
          </motion.div>
        )
      })()}

      {/* Current Dealer and Suit */}
      <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow mb-4">
        {/* Animated background overlay based on selected suit */}
        <motion.div
          className="fixed inset-0 -z-10"
          initial={{ backgroundColor: '#0f172a' }}
          animate={{ backgroundColor: overlayColor }}
          transition={{ duration: 0.6 }}
          style={patternDataUrl ? { backgroundImage: patternDataUrl, backgroundRepeat: 'repeat', backgroundSize: '70px 70px' } : {}}
        />
        <div className="text-center mb-3 text-slate-200 text-xl">
          <span className="text-slate-300 mr-2">Current Dealer:</span>
          <span className="text-yellow-300 font-bold text-xl">{players[currentDealer]}</span>
        </div>

        {/* Removed next dealer popup per request */}

        <div className="mb-3">
          <h3 className="text-center text-yellow-300 text-xl md:text-2xl font-semibold mb-2">Select Power Suit</h3>
          {!trump && (
            <div className="flex justify-center mb-2">
              <button className="rounded-lg bg-slate-700 px-4 py-3 text-white text-lg font-semibold hover:bg-slate-600" onClick={skipDealer}>
                Skip Dealer (All Pass)
              </button>
            </div>
          )}
          {!trump && (
            <div className="grid grid-cols-2 gap-3">
              {suits.map((suit) => (
                <button
                  key={suit}
                  className={`rounded-lg border-2 px-4 py-3 text-xl font-semibold ${trump === suit ? 'bg-primary border-primary text-white' : 'bg-slate-700 border-slate-600 text-slate-100 hover:bg-slate-600'}`}
                  onClick={() => handleTrumpSelect(suit)}
                >
                  {suit}
                </button>
              ))}
            </div>
          )}
        </div>

        {trump && (
          <>
            <motion.div
              key={trump}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className={`mt-3 rounded-xl border-2 border-emerald-700 bg-emerald-600 p-8 text-center shadow`}
            >
              <div className="tracking-widest text-white/80 text-base md:text-lg font-bold">POWER SUIT</div>
              <div className="text-white text-7xl md:text-8xl font-extrabold drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">{trump}</div>
            </motion.div>

            {/* Adaptive step: scoring with numeric buttons and help tooltip */}
            {roundStep === 'score' && (
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <h4 className="text-slate-300 text-lg md:text-xl">Record Outcome</h4>
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Scoring help"
                      className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-600 text-white text-sm hover:bg-slate-500"
                      onClick={() => setShowScoreHelp(v => !v)}
                    >
                      ?
                    </button>
                    <div className={`absolute z-20 left-1/2 -translate-x-1/2 mt-2 w-72 rounded-md border border-slate-700 bg-slate-800 p-3 text-slate-200 text-sm shadow ${showScoreHelp ? 'block' : 'hidden group-hover:block'}`}>
                      <div className="mb-1"><span className="text-yellow-300 font-semibold">+1</span> Calling team wins 3–4 tricks</div>
                      <div className="mb-1"><span className="text-yellow-300 font-semibold">+2</span> Euchre (defenders) <span className="text-slate-400">or</span> calling team wins all 5 tricks</div>
                      <div><span className="text-yellow-300 font-semibold">+4</span> Loner hand success by callers</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                    <h5 className="text-center text-yellow-300 text-lg font-semibold mb-1">{teamNames.team0}</h5>
                    <div className="text-center text-blue-300 text-sm mb-2">{players[0]} &amp; {players[2]}</div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(0, 'plus1')}>+1</button>
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(0, 'euchre')}>+2</button>
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(0, 'loner')}>+4</button>
                    </div>
                    {/* Points summary not shown since round ends on selection */}
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                    <h5 className="text-center text-yellow-300 text-lg font-semibold mb-1">{teamNames.team1}</h5>
                    <div className="text-center text-red-300 text-sm mb-2">{players[1]} &amp; {players[3]}</div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(1, 'plus1')}>+1</button>
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(1, 'euchre')}>+2</button>
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(1, 'loner')}>+4</button>
                    </div>
                    {/* Points summary not shown since round ends on selection */}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* History Panel */}
      {showHistory && (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 shadow mb-4">
          <h3 className="text-yellow-300 text-xl font-semibold mb-4">📜 Game History</h3>
          {history.length === 0 ? (
            <div className="text-slate-300">No history yet — play a round to see events.</div>
          ) : (
            <div className="space-y-3">
              {history.map((ev, idx) => {
                const teamLabel = ev.scoringTeam === 0 ? teamNames.team0 : (ev.scoringTeam === 1 ? teamNames.team1 : '—')
                const outcomeLabel = ev.outcomeType === 'plus1' ? '+1 (3–4 tricks)' : ev.outcomeType === 'euchre' ? '+2 (euchre)' : ev.outcomeType === 'loner' ? '+4 (loner)' : 'Skipped'
                const suit = ev.trumpSuit || ''
                const dealerName = (typeof ev.dealerIdx === 'number' && players[ev.dealerIdx]) ? players[ev.dealerIdx] : '—'
                return (
                  <HistoryItem
                    key={ev.id}
                    index={idx}
                    event={ev}
                    teamLabel={teamLabel}
                    outcomeLabel={outcomeLabel}
                    suit={suit}
                    teamNames={teamNames}
                    dealerName={dealerName}
                    onUpdate={(updated) => {
                      const updatedHistory = history.map((h, i) => i === idx ? updated : h)
                      setHistory(updatedHistory)
                      recomputeFromHistory(updatedHistory)
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Inline adaptive widget flow inside suit card */}
    </div>
  )
}

export default App

function HistoryItem({ index, event, teamLabel, outcomeLabel, suit, teamNames, dealerName, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [editTeam, setEditTeam] = useState(event.scoringTeam ?? 0)
  const [editOutcome, setEditOutcome] = useState(event.outcomeType ?? 'plus1')

  const applyUpdate = () => {
    // Map edited fields back to event structure
    const scoringTeam = editOutcome === 'skip' ? null : editTeam
    const pointsAwarded = editOutcome === 'skip' ? 0 : (editOutcome === 'plus1' ? 1 : editOutcome === 'euchre' ? 2 : 4)
    const callerTeam = editOutcome === 'euchre' ? (scoringTeam === 0 ? 1 : 0) : scoringTeam
    const updated = {
      ...event,
      scoringTeam,
      pointsAwarded,
      outcomeType: editOutcome,
      callerTeam,
    }
    onUpdate(updated)
    setEditing(false)
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-3">
      <div>
        <div className="text-slate-200 font-semibold">Round {index + 1}</div>
        <div className="text-slate-300 text-sm">Dealer: {dealerName} • {suit ? `Suit: ${suit}` : 'No Suit'}</div>
        <div className="text-slate-100">{teamLabel} — {outcomeLabel}</div>
      </div>
      <div className="mt-2 md:mt-0 flex items-center gap-2">
        {!editing && (
          <button className="rounded-md bg-slate-600 px-3 py-2 text-white text-sm hover:bg-slate-500" onClick={() => setEditing(true)}>Edit</button>
        )}
        {editing && (
          <div className="flex items-center gap-2">
            <select className="rounded-md bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1" value={editTeam ?? 0} onChange={(e) => setEditTeam(Number(e.target.value))} disabled={editOutcome === 'skip'}>
              <option value={0}>{teamNames.team0}</option>
              <option value={1}>{teamNames.team1}</option>
            </select>
            <select className="rounded-md bg-slate-800 border border-slate-700 text-slate-200 px-2 py-1" value={editOutcome} onChange={(e) => setEditOutcome(e.target.value)}>
              <option value="plus1">+1 (3–4 tricks)</option>
              <option value="euchre">+2 (euchre)</option>
              <option value="loner">+4 (loner)</option>
              <option value="skip">Skipped</option>
            </select>
            <button className="rounded-md bg-primary px-3 py-2 text-white text-sm hover:bg-emerald-700" onClick={applyUpdate}>Save</button>
            <button className="rounded-md bg-slate-600 px-3 py-2 text-white text-sm hover:bg-slate-500" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
