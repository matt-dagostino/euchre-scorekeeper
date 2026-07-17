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
      <div className="app-shell flex w-full min-h-screen flex-col items-center justify-start px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex w-full flex-1 flex-col gap-6 sm:gap-8">
          <div className="text-center">
            <div className="eyebrow mb-3">The classic trick-taking game</div>
            <h1 className="gradient-title text-4xl font-black tracking-tight sm:text-6xl">Euchre Scorekeeper</h1>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">Set the table, name your teams, and keep every hand effortless.</p>
          </div>
          <div className="glass-panel flex-1 rounded-3xl p-5 sm:p-8 lg:p-10">
            <div className="mb-7 text-center">
              <div className="eyebrow mb-2">Game setup</div>
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Who&apos;s playing?</h2>
            </div>
            <div className="mb-6 flex items-center justify-center gap-3 sm:gap-5">
              <button className="interactive rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2.5 text-sm font-bold text-emerald-200 hover:bg-emerald-400/20 sm:text-base" onClick={() => setEditingTeam(0)}>{teamNames.team0}</button>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">vs</span>
              <button className="interactive rounded-full border border-violet-400/30 bg-violet-400/10 px-5 py-2.5 text-sm font-bold text-violet-200 hover:bg-violet-400/20 sm:text-base" onClick={() => setEditingTeam(1)}>{teamNames.team1}</button>
            </div>
            {editingTeam !== null && (
              <div className="mx-auto mb-6 max-w-xl rounded-2xl border border-zinc-800/80 bg-black/20 p-3">
                <input type="text" value={editingTeam === 0 ? teamNames.team0 : teamNames.team1} onChange={(e) => setTeamNames(prev => (editingTeam === 0 ? { ...prev, team0: e.target.value } : { ...prev, team1: e.target.value }))} className="field px-4 py-3" />
                <div className="mt-2 flex justify-end">
                  <button className="primary-action rounded-lg px-4 py-2 text-sm" onClick={() => updateTeamName(editingTeam, editingTeam === 0 ? teamNames.team0 : teamNames.team1)}>Save Team Name</button>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="glass-card team-emerald rounded-2xl p-4 sm:p-5">
                <label className="text-sm font-bold text-emerald-200">Player 1 <span className="font-normal text-zinc-500">· {teamNames.team0}</span></label>
                <input type="text" value={players[0]} onChange={(e) => handlePlayerChange(0, e.target.value)} placeholder="Enter name" className="field mt-2 px-4 py-3.5 text-lg" />
              </div>
              <div className="glass-card team-violet rounded-2xl p-4 sm:p-5">
                <label className="text-sm font-bold text-violet-200">Player 2 <span className="font-normal text-zinc-500">· {teamNames.team1}</span></label>
                <input type="text" value={players[1]} onChange={(e) => handlePlayerChange(1, e.target.value)} placeholder="Enter name" className="field mt-2 px-4 py-3.5 text-lg" />
              </div>
              <div className="glass-card team-violet rounded-2xl p-4 sm:p-5 md:order-4">
                <label className="text-sm font-bold text-violet-200">Player 4 <span className="font-normal text-zinc-500">· {teamNames.team1}</span></label>
                <input type="text" value={players[3]} onChange={(e) => handlePlayerChange(3, e.target.value)} placeholder="Enter name" className="field mt-2 px-4 py-3.5 text-lg" />
              </div>
              <div className="glass-card team-emerald rounded-2xl p-4 sm:p-5 md:order-3">
                <label className="text-sm font-bold text-emerald-200">Player 3 <span className="font-normal text-zinc-500">· {teamNames.team0}</span></label>
                <input type="text" value={players[2]} onChange={(e) => handlePlayerChange(2, e.target.value)} placeholder="Enter name" className="field mt-2 px-4 py-3.5 text-lg" />
              </div>
            </div>
            <p className="mt-5 text-center text-sm text-zinc-500">Partners sit opposite: Players 1 &amp; 3 versus Players 2 &amp; 4.</p>
            <button className="primary-action mt-7 w-full rounded-2xl px-6 py-4 text-lg sm:py-5" onClick={startGame} disabled={!players.every(p => p.trim() !== '')}>Start the Game <span aria-hidden="true" className="ml-2">→</span></button>
          </div>
        </div>
        <div className="mt-7 text-center text-xs text-zinc-600">
          <span>Made by </span>
          <a href="https://github.com/matt-dagostino" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition-colors hover:text-emerald-300">Matteo Dagostino</a>
          <span className="mx-2 text-zinc-700">·</span>
          <a href="https://www.linkedin.com/in/matt-dag09/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 transition-colors hover:text-emerald-300">LinkedIn</a>
        </div>
      </div>
    )
  }

  // Dealer selection step right after starting
  if (gameStarted && selectingDealer && !gameEnded) {
    return (
      <div className="app-shell flex w-full min-h-screen items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="glass-panel flex min-h-[calc(100vh-1.5rem)] w-full flex-col justify-center rounded-3xl p-5 sm:min-h-[calc(100vh-3rem)] sm:p-8 lg:min-h-[calc(100vh-4rem)] lg:p-10">
          <div className="eyebrow mb-2 text-center">First hand</div>
          <h2 className="gradient-title mb-3 text-center text-3xl font-black">Choose the Dealer</h2>
          <p className="mb-7 text-center text-zinc-400">Tap the player holding the first deal.</p>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {[0,1,3,2].map((idx) => {
              const isBlue = idx === 0 || idx === 2
              const btnClasses = isBlue
                ? "interactive team-emerald rounded-2xl border px-3 py-6 text-emerald-100 text-lg font-bold hover:border-emerald-400/60 hover:bg-emerald-400/15 sm:text-xl"
                : "interactive team-violet rounded-2xl border px-3 py-6 text-violet-100 text-lg font-bold hover:border-violet-400/60 hover:bg-violet-400/15 sm:text-xl"
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
      <div className="app-shell flex w-full min-h-screen items-center justify-center p-3 sm:p-6 lg:p-8">
        <div className="glass-panel min-h-[calc(100vh-1.5rem)] w-full rounded-3xl p-4 text-center sm:min-h-[calc(100vh-3rem)] sm:p-7 lg:min-h-[calc(100vh-4rem)] lg:p-10">
          <div className="eyebrow mb-2">Final result</div>
          <h1 className="gradient-title mb-5 text-3xl font-black tracking-tight sm:text-4xl">Game Complete</h1>
          <div className="relative mb-7 overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 via-zinc-900/70 to-violet-500/20 p-7 shadow-2xl shadow-emerald-950/30">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent" />
            <div className="eyebrow mb-2 text-emerald-200">Champions</div>
            <h2 className="text-3xl font-black text-white sm:text-4xl">{winner === 0 ? teamNames.team0 : teamNames.team1}</h2>
            <div className="mb-3 mt-1 text-base font-medium text-zinc-300 sm:text-lg">{winnerNames}</div>
            <div className="score-glow text-5xl font-black tracking-tight sm:text-6xl">{scores[0]} <span className="text-zinc-600">—</span> {scores[1]}</div>
          </div>

          <div className="mb-6">
            <h3 className="mb-4 text-xl font-bold text-zinc-100 sm:text-2xl">Game Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-tile">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Rounds</div>
                <div className="mt-1 text-3xl font-black text-amber-300">{totalRoundsWithSkips}</div>
              </div>
              <div className="stat-tile">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Skipped Rounds</div>
                <div className="mt-1 text-3xl font-black text-amber-300">{stats.skippedRounds}</div>
              </div>
              <div className="stat-tile">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Most Chosen Suit</div>
                <div className="mt-1 text-xl font-black text-amber-300">{mostCommonSuit[0]}</div>
                <div className="text-sm text-zinc-500">{mostCommonSuit[1]} times</div>
              </div>
            </div>

            <div className="glass-card mb-6 rounded-2xl p-5 text-left sm:p-6">
              <h4 className="mb-3 text-lg font-bold text-zinc-100">Suit Breakdown</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="stat-tile flex items-center justify-between p-3">
                  <span className="text-zinc-200">♠️ Spades</span>
                  <span className="text-xl font-black text-emerald-300">{stats.trumpSuits['Spades']}</span>
                </div>
                <div className="stat-tile flex items-center justify-between p-3">
                  <span className="text-zinc-200">♥️ Hearts</span>
                  <span className="text-xl font-black text-emerald-300">{stats.trumpSuits['Hearts']}</span>
                </div>
                <div className="stat-tile flex items-center justify-between p-3">
                  <span className="text-zinc-200">♦️ Diamonds</span>
                  <span className="text-xl font-black text-emerald-300">{stats.trumpSuits['Diamonds']}</span>
                </div>
                <div className="stat-tile flex items-center justify-between p-3">
                  <span className="text-zinc-200">♣️ Clubs</span>
                  <span className="text-xl font-black text-emerald-300">{stats.trumpSuits['Clubs']}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-left">
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h4 className="mb-3 text-lg font-bold text-zinc-100">Team Calls</h4>
                <div className="stat-tile mb-2 flex items-center justify-between p-3">
                  <span className="text-emerald-200">{teamNames.team0}</span>
                  <span className="text-xl font-black text-emerald-300">{team1Trump}</span>
                </div>
                <div className="stat-tile flex items-center justify-between p-3">
                  <span className="text-violet-200">{teamNames.team1}</span>
                  <span className="text-xl font-black text-violet-300">{team2Trump}</span>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 sm:p-6">
                <h4 className="mb-3 text-lg font-bold text-zinc-100">Outcomes</h4>
                <div className="stat-tile mb-2 flex items-center justify-between gap-3 p-3">
                  <span className="text-zinc-200">Euchres</span>
                  <span className="text-right text-xl font-black text-amber-300">{stats.euchreEvents} <span className="block text-xs font-medium text-zinc-500">{teamNames.team0}: {stats.euchreByTeam[0]} · {teamNames.team1}: {stats.euchreByTeam[1]}</span></span>
                </div>
                <div className="stat-tile flex items-center justify-between gap-3 p-3">
                  <span className="text-zinc-200">Loners</span>
                  <span className="text-right text-xl font-black text-amber-300">{stats.lonerEvents} <span className="block text-xs font-medium text-zinc-500">{teamNames.team0}: {stats.lonerByTeam[0]} · {teamNames.team1}: {stats.lonerByTeam[1]}</span></span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="primary-action w-full rounded-xl px-5 py-4 text-lg" onClick={playAgain}>
              Play Again
            </button>
            <button className="secondary-action w-full rounded-xl px-5 py-4 text-lg" onClick={newGame}>
              New Game
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell mx-auto flex w-full min-h-screen flex-col p-3 sm:p-5 lg:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="eyebrow mb-1">Live table</div>
          <h1 className="gradient-title text-2xl font-black tracking-tight sm:text-3xl">Euchre Scorekeeper</h1>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex">
          <button className="danger-action min-h-12 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm" onClick={resetGame}>Reset Scores</button>
          <button className="secondary-action min-h-12 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm" onClick={newGame}>New Game</button>
          <button className="secondary-action min-h-12 rounded-xl px-3 py-2.5 text-xs sm:px-4 sm:text-sm" onClick={() => setShowHistory(v => !v)}>{showHistory ? 'Hide History' : 'History'}</button>
        </div>
      </div>

      {/* Scores at the top (shrinks during round) */}
      {(() => {
        const headerShrink = Boolean(trump) && roundStep === 'score'
        return (
          <motion.div
            className={`glass-panel grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-3xl sm:gap-4 ${headerShrink ? 'sticky top-2 z-20 p-3' : 'p-4 sm:p-6'}`}
            initial={false}
            animate={headerShrink ? { scale: 0.9, y: -6, opacity: 0.98 } : { scale: 1, y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <div className="text-center">
              <h2 className={`font-bold text-emerald-300 ${headerShrink ? 'text-sm' : 'text-base sm:text-xl'}`}>{teamNames.team0}</h2>
              <div className={`font-medium text-zinc-500 ${headerShrink ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-base'}`}>{players[0]} & {players[2]}</div>
              <div className={`score-glow leading-none font-black transition-transform duration-200 ${headerShrink ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-8xl'} ${animateScore[0] ? 'scale-110' : ''}`}>{scores[0]}</div>
            </div>
            <div className={`rounded-full border border-zinc-800 bg-zinc-950/60 text-center font-black uppercase tracking-widest text-zinc-600 ${headerShrink ? 'px-2 py-1 text-[10px]' : 'px-3 py-1.5 text-xs sm:text-sm'}`}>vs</div>
            <div className="text-center">
              <h2 className={`font-bold text-violet-300 ${headerShrink ? 'text-sm' : 'text-base sm:text-xl'}`}>{teamNames.team1}</h2>
              <div className={`font-medium text-zinc-500 ${headerShrink ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-base'}`}>{players[1]} & {players[3]}</div>
              <div className={`score-glow leading-none font-black transition-transform duration-200 ${headerShrink ? 'text-4xl sm:text-5xl' : 'text-6xl sm:text-8xl'} ${animateScore[1] ? 'scale-110' : ''}`}>{scores[1]}</div>
            </div>
          </motion.div>
        )
      })()}

      {/* Current Dealer and Suit */}
      <div className="glass-panel mb-4 mt-4 rounded-3xl p-4 sm:p-6">
        {/* Animated background overlay based on selected suit */}
        <motion.div
          className="fixed inset-0 -z-10"
          initial={{ backgroundColor: '#0f172a' }}
          animate={{ backgroundColor: overlayColor }}
          transition={{ duration: 0.6 }}
          style={patternDataUrl ? { backgroundImage: patternDataUrl, backgroundRepeat: 'repeat', backgroundSize: '70px 70px' } : {}}
        />
        <div className="mb-5 text-center">
          <span className="eyebrow mr-2">Current dealer</span>
          <span className="text-lg font-black text-amber-300 sm:text-xl">{players[currentDealer]}</span>
        </div>

        {/* Removed next dealer popup per request */}

        <div className="mb-3">
          <h3 className="mb-3 text-center text-xl font-bold text-white md:text-2xl">Select the Power Suit</h3>
          {!trump && (
            <div className="mb-3 flex justify-center">
              <button className="secondary-action min-h-12 rounded-xl px-5 py-3 text-sm" onClick={skipDealer}>
                Skip Dealer (All Pass)
              </button>
            </div>
          )}
          {!trump && (
            <div className="grid grid-cols-2 gap-3">
              {suits.map((suit) => (
                <button
                  key={suit}
                  className={`interactive rounded-2xl border px-3 py-4 text-base font-bold shadow-lg shadow-black/20 sm:px-4 sm:text-xl ${trump === suit ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100' : 'border-zinc-800 bg-zinc-950/45 text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800/70'}`}
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
              className="relative mt-4 overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/30 via-emerald-900/50 to-zinc-950/80 p-6 text-center shadow-2xl shadow-emerald-950/40 sm:p-8"
            >
              <div className="eyebrow text-emerald-200">Power Suit</div>
              <div className="mt-1 text-5xl font-black text-white drop-shadow-[0_0_18px_rgba(52,211,153,0.35)] sm:text-7xl md:text-8xl">{trump}</div>
            </motion.div>

            {/* Adaptive step: scoring with numeric buttons and help tooltip */}
            {roundStep === 'score' && (
              <div className="mt-5">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <h4 className="text-lg font-bold text-zinc-200 md:text-xl">Record Outcome</h4>
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Scoring help"
                      className="interactive inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-800 text-sm font-bold text-zinc-300 hover:border-zinc-500 hover:text-white"
                      onClick={() => setShowScoreHelp(v => !v)}
                    >
                      ?
                    </button>
                    <div className={`glass-panel absolute left-1/2 z-20 mt-2 w-72 -translate-x-1/2 rounded-xl p-3 text-left text-sm text-zinc-300 ${showScoreHelp ? 'block' : 'hidden group-hover:block'}`}>
                      <div className="mb-1"><span className="font-bold text-amber-300">+1</span> Calling team wins 3–4 tricks</div>
                      <div className="mb-1"><span className="font-bold text-amber-300">+2</span> Euchre (defenders) <span className="text-zinc-500">or</span> callers sweep</div>
                      <div><span className="font-bold text-amber-300">+4</span> Successful loner hand</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                  <div className="glass-card team-emerald rounded-2xl p-4">
                    <h5 className="mb-1 text-center text-lg font-bold text-emerald-200">{teamNames.team0}</h5>
                    <div className="mb-3 text-center text-sm text-zinc-500">{players[0]} &amp; {players[2]}</div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button className="primary-action min-h-14 rounded-xl px-3 py-3 text-lg" onClick={() => handleOutcome(0, 'plus1')}>+1</button>
                      <button className="primary-action min-h-14 rounded-xl px-3 py-3 text-lg" onClick={() => handleOutcome(0, 'euchre')}>+2</button>
                      <button className="primary-action min-h-14 rounded-xl px-3 py-3 text-lg" onClick={() => handleOutcome(0, 'loner')}>+4</button>
                    </div>
                    {/* Points summary not shown since round ends on selection */}
                  </div>

                  <div className="glass-card team-violet rounded-2xl p-4">
                    <h5 className="mb-1 text-center text-lg font-bold text-violet-200">{teamNames.team1}</h5>
                    <div className="mb-3 text-center text-sm text-zinc-500">{players[1]} &amp; {players[3]}</div>
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      <button className="interactive min-h-14 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-3 text-lg font-bold text-white shadow-lg shadow-violet-950/40 hover:border-violet-300/60 hover:from-violet-500 hover:to-violet-400" onClick={() => handleOutcome(1, 'plus1')}>+1</button>
                      <button className="interactive min-h-14 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-3 text-lg font-bold text-white shadow-lg shadow-violet-950/40 hover:border-violet-300/60 hover:from-violet-500 hover:to-violet-400" onClick={() => handleOutcome(1, 'euchre')}>+2</button>
                      <button className="interactive min-h-14 rounded-xl border border-violet-400/30 bg-gradient-to-r from-violet-600 to-violet-500 px-3 py-3 text-lg font-bold text-white shadow-lg shadow-violet-950/40 hover:border-violet-300/60 hover:from-violet-500 hover:to-violet-400" onClick={() => handleOutcome(1, 'loner')}>+4</button>
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
        <div className="glass-panel mb-4 rounded-3xl p-4 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10" aria-hidden="true">♠</span>
            <div>
              <div className="eyebrow">Scorecard</div>
              <h3 className="text-xl font-bold text-zinc-100">Game History</h3>
            </div>
          </div>
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/25 p-8 text-center text-zinc-500">No history yet — play a round to see events.</div>
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
    <div className="flex flex-col rounded-2xl border border-zinc-800/70 bg-zinc-950/35 p-4 transition-colors hover:border-zinc-700 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="font-bold text-zinc-100">Round {index + 1}</div>
        <div className="text-sm text-zinc-500">Dealer: {dealerName} • {suit ? `Suit: ${suit}` : 'No Suit'}</div>
        <div className="mt-1 text-sm font-medium text-zinc-300">{teamLabel} — <span className="text-amber-300">{outcomeLabel}</span></div>
      </div>
      <div className="mt-2 md:mt-0 flex items-center gap-2">
        {!editing && (
          <button className="secondary-action rounded-lg px-3 py-2 text-sm" onClick={() => setEditing(true)}>Edit</button>
        )}
        {editing && (
          <div className="flex flex-wrap items-center gap-2">
            <select className="field w-auto px-2 py-2 text-sm" value={editTeam ?? 0} onChange={(e) => setEditTeam(Number(e.target.value))} disabled={editOutcome === 'skip'}>
              <option value={0}>{teamNames.team0}</option>
              <option value={1}>{teamNames.team1}</option>
            </select>
            <select className="field w-auto px-2 py-2 text-sm" value={editOutcome} onChange={(e) => setEditOutcome(e.target.value)}>
              <option value="plus1">+1 (3–4 tricks)</option>
              <option value="euchre">+2 (euchre)</option>
              <option value="loner">+4 (loner)</option>
              <option value="skip">Skipped</option>
            </select>
            <button className="primary-action rounded-lg px-3 py-2 text-sm" onClick={applyUpdate}>Save</button>
            <button className="secondary-action rounded-lg px-3 py-2 text-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        )}
      </div>
    </div>
  )
}
