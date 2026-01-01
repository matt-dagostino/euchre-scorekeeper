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
  const [showDealerMessage, setShowDealerMessage] = useState(false)
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
      setShowDealerMessage(true)
      setTimeout(() => setShowDealerMessage(false), 3000)
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
    
    // Show next dealer message
    setShowDealerMessage(true)
    setTimeout(() => setShowDealerMessage(false), 3000)
  }

  const resetGame = () => {
    setScores([0, 0])
    setCurrentDealer(0)
    setTrump('')
    setTrumpTeam(null)
    setRoundPoints([0, 0])
    setShowDealerMessage(false)
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
    setShowDealerMessage(false)
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

    // Show next dealer message
    setShowDealerMessage(true)
    setTimeout(() => setShowDealerMessage(false), 3000)
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
    // Show next dealer message
    setShowDealerMessage(true)
    setTimeout(() => setShowDealerMessage(false), 3000)
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xl space-y-6">
          <h1 className="text-center text-6xl font-extrabold text-yellow-300">🃏 Euchre Score Keeper</h1>
          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
            <h2 className="text-center text-2xl font-semibold text-yellow-300">Enter Player Names</h2>
            <p className="text-center text-slate-300 mb-6">Players sit across from their partner</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-slate-300 font-medium">Player 1 (Dealer starts here)</label>
                <input type="text" value={players[0]} onChange={(e) => handlePlayerChange(0, e.target.value)} placeholder="Enter name" className="w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-slate-300 font-medium">Player 2 (Partner with Player 4)</label>
                <input type="text" value={players[1]} onChange={(e) => handlePlayerChange(1, e.target.value)} placeholder="Enter name" className="w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-slate-300 font-medium">Player 3 (Partner with Player 1)</label>
                <input type="text" value={players[2]} onChange={(e) => handlePlayerChange(2, e.target.value)} placeholder="Enter name" className="w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-slate-300 font-medium">Player 4 (Partner with Player 2)</label>
                <input type="text" value={players[3]} onChange={(e) => handlePlayerChange(3, e.target.value)} placeholder="Enter name" className="w-full rounded-lg border-2 border-slate-600 bg-slate-700 px-5 py-4 text-xl text-slate-100 focus:border-primary focus:outline-none" />
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-primary px-6 py-5 text-xl font-bold text-white transition-colors disabled:opacity-50 hover:bg-emerald-700" onClick={startGame} disabled={!players.every(p => p.trim() !== '')}>Start Game</button>
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-800 p-6 shadow-xl text-center">
          <h1 className="text-3xl font-bold text-yellow-300 mb-4">🎉 GAME OVER! 🎉</h1>
          <div className="rounded-2xl bg-primary p-6 mb-6 shadow">
            <h2 className="text-white text-2xl font-semibold mb-2">Team {winner + 1} Wins!</h2>
            <div className="text-white/90 text-lg font-medium mb-2">{winnerNames}</div>
            <div className="text-yellow-300 text-4xl font-extrabold">{scores[0]} - {scores[1]}</div>
          </div>

          <div className="mb-6">
            <h3 className="text-yellow-300 text-xl font-semibold mb-4">📊 Game Statistics</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <div className="text-slate-300 text-sm font-medium uppercase">Total Rounds (incl. skips)</div>
                <div className="text-yellow-300 text-2xl font-bold">{totalRoundsWithSkips}</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <div className="text-slate-300 text-sm font-medium uppercase">Skipped Rounds</div>
                <div className="text-yellow-300 text-2xl font-bold">{stats.skippedRounds}</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <div className="text-slate-300 text-sm font-medium uppercase">Team 1 Called Suit</div>
                <div className="text-yellow-300 text-2xl font-bold">{team1Trump}x</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <div className="text-slate-300 text-sm font-medium uppercase">Team 2 Called Suit</div>
                <div className="text-yellow-300 text-2xl font-bold">{team2Trump}x</div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                <div className="text-slate-300 text-sm font-medium uppercase">Most Chosen Suit</div>
                <div className="text-yellow-300 text-xl font-bold">{mostCommonSuit[0]}</div>
                <div className="text-slate-400 text-sm">{mostCommonSuit[1]} times</div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 mb-4">
              <h4 className="text-yellow-300 text-lg font-semibold mb-3">Suit Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
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

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-left">
                <h4 className="text-yellow-300 text-lg font-semibold mb-2">Team 1 Points</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">+1</span>
                  <span className="text-emerald-400 font-bold text-xl">{team1Points.p1}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">+2</span>
                  <span className="text-emerald-400 font-bold text-xl">{team1Points.p2}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100">+4</span>
                  <span className="text-emerald-400 font-bold text-xl">{team1Points.p4}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-left">
                <h4 className="text-yellow-300 text-lg font-semibold mb-2">Team 2 Points</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">+1</span>
                  <span className="text-emerald-400 font-bold text-xl">{team2Points.p1}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">+2</span>
                  <span className="text-emerald-400 font-bold text-xl">{team2Points.p2}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100">+4</span>
                  <span className="text-emerald-400 font-bold text-xl">{team2Points.p4}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-left">
                <h4 className="text-yellow-300 text-lg font-semibold mb-2">Rounds Won</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">Team 1</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.roundsWonByTeam[0]}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100">Team 2</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.roundsWonByTeam[1]}</span>
                </div>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-800 p-4 text-left">
                <h4 className="text-yellow-300 text-lg font-semibold mb-2">Outcomes</h4>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">Euchres (Total)</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.euchreEvents}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">Euchres by Team 1</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.euchreByTeam[0]}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">Euchres by Team 2</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.euchreByTeam[1]}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">Loners (Total)</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.lonerEvents}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2 mb-2">
                  <span className="text-slate-100">Loners by Team 1</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.lonerByTeam[0]}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-700/50 p-2">
                  <span className="text-slate-100">Loners by Team 2</span>
                  <span className="text-emerald-400 font-bold text-xl">{stats.lonerByTeam[1]}</span>
                </div>
              </div>
            </div>
          </div>

          <button className="w-full rounded-xl bg-primary px-5 py-4 text-lg font-bold text-white hover:bg-emerald-700" onClick={newGame}>
            Play Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-yellow-300">🃏 Euchre Score Keeper</h1>
        <div className="flex gap-2">
          <button className="rounded-lg bg-accent px-4 py-3 text-white text-lg font-semibold hover:bg-red-600" onClick={resetGame}>Reset Scores</button>
          <button className="rounded-lg bg-slate-300 px-4 py-3 text-slate-900 text-lg font-semibold hover:bg-slate-200" onClick={newGame}>New Game</button>
        </div>
      </div>

      {/* Scores at the top */}
      <div className="grid grid-cols-3 items-center gap-4 rounded-xl border border-slate-700 bg-slate-800 p-6 shadow">
        <div className="text-center">
          <h2 className="text-yellow-300 text-xl font-semibold">Team 1</h2>
          <div className="text-slate-300 text-lg font-medium">{players[0]} & {players[2]}</div>
          <div className={`leading-none text-7xl sm:text-8xl font-extrabold text-yellow-400 transition-transform ${animateScore[0] ? 'scale-110' : ''} drop-shadow-[0_0_6px_rgba(255,255,0,0.25)]`}>{scores[0]}</div>
        </div>
        <div className="text-center text-yellow-300 font-bold text-2xl">VS</div>
        <div className="text-center">
          <h2 className="text-yellow-300 text-xl font-semibold">Team 2</h2>
          <div className="text-slate-300 text-lg font-medium">{players[1]} & {players[3]}</div>
          <div className={`leading-none text-7xl sm:text-8xl font-extrabold text-yellow-400 transition-transform ${animateScore[1] ? 'scale-110' : ''} drop-shadow-[0_0_6px_rgba(255,255,0,0.25)]`}>{scores[1]}</div>
        </div>
      </div>

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

        {showDealerMessage && (
          <div className="bg-primary text-white rounded-lg p-3 text-center font-semibold mb-3 text-lg">
            🎴 Next dealer is {players[currentDealer]}!
          </div>
        )}

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
                    <h5 className="text-center text-yellow-300 text-lg font-semibold mb-2">Team 1</h5>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(0, 'plus1')}>+1</button>
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(0, 'euchre')}>+2</button>
                      <button className="rounded-md bg-emerald-600 px-3 py-2 text-white text-lg font-bold hover:bg-emerald-700" onClick={() => handleOutcome(0, 'loner')}>+4</button>
                    </div>
                    {/* Points summary not shown since round ends on selection */}
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-800 p-3">
                    <h5 className="text-center text-yellow-300 text-lg font-semibold mb-2">Team 2</h5>
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

      {/* Inline adaptive widget flow inside suit card */}
    </div>
  )
}

export default App
