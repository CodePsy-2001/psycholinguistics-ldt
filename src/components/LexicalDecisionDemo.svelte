<svelte:options runes={true} />

<script lang="ts">
import { onDestroy } from 'svelte'

type Phase = 'ready' | 'fixation' | 'stimulus' | 'feedback' | 'done'

type Stimulus = {
  text: string
  lexicality: boolean
}

type ResponseKey = 'f' | 'j'

type TrialResult = {
  trial: number
  stimulus: string
  responseKey: 'F' | 'J' | null
  rtMs: number
  isCorrect: boolean
  timedOut: boolean
}

const stimuli: Stimulus[] = [
  { text: '사과', lexicality: true },
  { text: '구름', lexicality: true },
  { text: '피라', lexicality: false },
  { text: '책상', lexicality: true },
  { text: '론지', lexicality: false },
  { text: '기쁨', lexicality: true },
  { text: '초니', lexicality: false },
  { text: '병원', lexicality: true },
  { text: '다솜', lexicality: true },
  { text: '푸라', lexicality: false },
  { text: '연필', lexicality: true },
  { text: '나부', lexicality: false },
]

const responseMap = {
  f: { key: 'F', lexicality: true, label: '단어' },
  j: { key: 'J', lexicality: false, label: '비단어' },
} satisfies Record<
  ResponseKey,
  { key: 'F' | 'J'; lexicality: boolean; label: string }
>

const trialLimitMs = 1800
const fixationMs = 450
const feedbackMs = 500

const panelClass =
  'border border-[#d9dee3] bg-white shadow-[0_18px_40px_rgba(31,35,40,0.08)]'
const keyBoxBaseClass =
  'flex min-h-[76px] items-center justify-center gap-3 border border-[#cfd6da] bg-[#f7f9fb] text-[#26313b] transition duration-150'
const keyBoxActiveClass = '-translate-y-0.5 border-[#2e8c67] bg-[#e7f4ec]'
const keyCapClass =
  'grid size-[38px] place-items-center border border-[#8ea1b2] bg-white text-lg font-black'
const tableCellClass =
  'border-b border-[#e6eaee] px-2 py-3 text-left text-sm font-bold text-[#202124]'
const tableHeadClass =
  'border-b border-[#e6eaee] px-2 py-3 text-left text-xs font-black uppercase text-[#59646f]'

let phase = $state<Phase>('ready')
let trialIndex = $state(0)
let cueText = $state('준비')
let stimulusText = $state('시작 버튼을 누르세요')
let feedbackText = $state('F = 단어, J = 비단어')
let activeKey = $state<ResponseKey | null>(null)
let presentedAt = 0
let results = $state.raw<TrialResult[]>([])

let responseTimer: ReturnType<typeof setTimeout> | undefined
let advanceTimer: ReturnType<typeof setTimeout> | undefined
let activeKeyTimer: ReturnType<typeof setTimeout> | undefined

let completedTrials = $derived(Math.min(trialIndex, stimuli.length))
let progressPercent = $derived((completedTrials / stimuli.length) * 100)
let correctCount = $derived(results.filter((result) => result.isCorrect).length)
let timeoutCount = $derived(results.filter((result) => result.timedOut).length)
let validRts = $derived(
  results.filter((result) => !result.timedOut).map((result) => result.rtMs),
)
let accuracyText = $derived(
  results.length > 0
    ? `${Math.round((correctCount / results.length) * 100)}%`
    : '-',
)
let averageRtText = $derived(
  validRts.length > 0
    ? `${Math.round(validRts.reduce((sum, rt) => sum + rt, 0) / validRts.length)} ms`
    : '-',
)
let recentResults = $derived(results.slice(-6).reverse())

const phaseText: Record<Phase, string> = {
  ready: '대기',
  fixation: '고정점',
  stimulus: '응답 대기',
  feedback: '응답 기록',
  done: '완료',
}

function clearTimers() {
  clearTimeout(responseTimer)
  clearTimeout(advanceTimer)
  clearTimeout(activeKeyTimer)
}

function resetExperiment() {
  clearTimers()
  phase = 'ready'
  trialIndex = 0
  cueText = '준비'
  stimulusText = '시작 버튼을 누르세요'
  feedbackText = 'F = 단어, J = 비단어'
  activeKey = null
  results = []
}

function startExperiment() {
  resetExperiment()
  queueTrial()
}

function queueTrial() {
  if (trialIndex >= stimuli.length) {
    finishExperiment()
    return
  }

  clearTimers()
  phase = 'fixation'
  cueText = `시행 ${trialIndex + 1}`
  stimulusText = '+'
  feedbackText = ''
  activeKey = null
  advanceTimer = setTimeout(presentStimulus, fixationMs)
}

function presentStimulus() {
  const current = stimuli[trialIndex]
  if (!current) {
    finishExperiment()
    return
  }

  phase = 'stimulus'
  cueText = `시행 ${trialIndex + 1}`
  stimulusText = current.text
  feedbackText = 'F 또는 J를 누르세요'
  presentedAt = performance.now()
  responseTimer = setTimeout(() => recordResponse(null), trialLimitMs)
}

function recordResponse(pressedKey: ResponseKey | null) {
  if (phase !== 'stimulus') {
    return
  }

  clearTimeout(responseTimer)

  const current = stimuli[trialIndex]
  const response = pressedKey ? responseMap[pressedKey] : null
  const timedOut = response === null
  const rtMs = Math.round(performance.now() - presentedAt)
  const isCorrect = response
    ? response.lexicality === current.lexicality
    : false

  if (pressedKey) {
    flashKey(pressedKey)
  }

  results = [
    ...results,
    {
      trial: trialIndex + 1,
      stimulus: current.text,
      responseKey: response?.key ?? null,
      rtMs,
      isCorrect,
      timedOut,
    },
  ]

  phase = 'feedback'
  cueText = timedOut ? 'timeout' : response.label
  stimulusText = current.text
  feedbackText = timedOut ? '응답 없음' : isCorrect ? '정답' : '오답'
  trialIndex += 1
  advanceTimer = setTimeout(queueTrial, feedbackMs)
}

function flashKey(key: ResponseKey) {
  activeKey = key
  clearTimeout(activeKeyTimer)
  activeKeyTimer = setTimeout(() => {
    activeKey = null
  }, 220)
}

function finishExperiment() {
  clearTimers()
  phase = 'done'
  cueText = '세션 완료'
  stimulusText = '결과 확인'
  feedbackText = '다시 시작하려면 Enter 또는 버튼을 누르세요'
}

function keyBoxClass(key: ResponseKey) {
  return `${keyBoxBaseClass} ${activeKey === key ? keyBoxActiveClass : ''}`
}

function resultMarkerClass(result: TrialResult) {
  return result.isCorrect
    ? 'border-l-4 border-l-[#2e8c67]'
    : 'border-l-4 border-l-[#c05236]'
}

function stimulusClass(phase: Phase) {
  const base =
    'my-4 grid min-h-32 place-items-center font-black leading-tight text-[#121417]'
  return phase === 'fixation'
    ? `${base} text-[64px] text-[#2d6cdf] sm:text-[86px]`
    : `${base} text-[40px] sm:text-[46px] lg:text-[70px]`
}

function handleKeydown(event: KeyboardEvent) {
  const key = event.key.toLowerCase()

  if (key === 'f' || key === 'j') {
    event.preventDefault()
    recordResponse(key)
    return
  }

  if (
    (key === 'enter' || key === ' ') &&
    (phase === 'ready' || phase === 'done')
  ) {
    event.preventDefault()
    startExperiment()
  }
}

onDestroy(clearTimers)
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen px-3.5 py-5 text-[#202124] sm:p-8">
  <header
    class="mx-auto mb-7 flex max-w-[1180px] flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
  >
    <div>
      <p class="mb-2 text-[13px] font-extrabold uppercase text-[#59646f]">
        Lexical Decision Task
      </p>
      <h1 class="text-2xl font-black leading-tight sm:text-3xl">
        한국어 어휘 판단
      </h1>
    </div>
    <div
      class="inline-flex min-w-32 items-center gap-2 rounded-full border border-[#d9dee3] bg-white px-3.5 py-2.5 text-sm font-bold text-[#3b4651]"
    >
      <span class="size-[9px] rounded-full bg-[#2e8c67]"></span>
      <span>DEMO-001</span>
    </div>
  </header>

  <main class="mx-auto grid max-w-[1180px] grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
    <section
      aria-live="polite"
      class={`${panelClass} flex min-h-[560px] flex-col p-5 sm:p-7 lg:min-h-[640px]`}
    >
      <div
        class="flex items-center justify-between gap-4 text-sm font-extrabold text-[#59646f]"
      >
        <span>{phaseText[phase]}</span>
        <span>{completedTrials} / {stimuli.length}</span>
      </div>
      <div aria-hidden="true" class="mt-3.5 h-2 overflow-hidden rounded-full bg-[#e6eaee]">
        <div
          class="h-full rounded-full bg-[#2d6cdf] transition-[width] duration-200"
          style={`width: ${progressPercent}%`}
        ></div>
      </div>

      <div
        class="my-6 grid min-h-[300px] flex-1 place-items-center content-center border-y border-[#e6eaee] text-center sm:my-8 sm:min-h-[360px]"
      >
        <p class="min-h-6 text-[15px] font-extrabold text-[#687380]">
          {cueText}
        </p>
        <p class={stimulusClass(phase)}>{stimulusText}</p>
        <p class="min-h-7 text-lg font-extrabold text-[#42505c]">
          {feedbackText}
        </p>
      </div>

      <div aria-label="response keys" class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class={keyBoxClass('f')}>
          <span class={keyCapClass}>F</span>
          <strong class="text-lg">단어</strong>
        </div>
        <div class={keyBoxClass('j')}>
          <span class={keyCapClass}>J</span>
          <strong class="text-lg">비단어</strong>
        </div>
      </div>

      {#if phase === 'ready' || phase === 'done'}
        <button
          class="mt-5 min-h-12 min-w-44 cursor-pointer self-center bg-[#202124] px-5 font-black text-white hover:bg-[#34404a] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[#f5b94d]"
          type="button"
          onclick={startExperiment}
        >
          {phase === 'done' ? '다시 시작' : '시작'}
        </button>
      {/if}
    </section>

    <aside class={`${panelClass} p-5 sm:p-6`}>
      <div class="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
        <div class="min-h-[104px] border border-[#e6eaee] bg-[#f7f9fb] p-4.5">
          <span class="mb-3 block text-[13px] font-extrabold text-[#59646f]">
            정확도
          </span>
          <strong class="text-3xl leading-none text-[#171b1f]">
            {accuracyText}
          </strong>
        </div>
        <div class="min-h-[104px] border border-[#e6eaee] bg-[#f7f9fb] p-4.5">
          <span class="mb-3 block text-[13px] font-extrabold text-[#59646f]">
            평균 RT
          </span>
          <strong class="text-3xl leading-none text-[#171b1f]">
            {averageRtText}
          </strong>
        </div>
      </div>

      <div>
        <div
          class="mb-3.5 flex items-center justify-between gap-4 text-sm font-extrabold text-[#59646f]"
        >
          <h2 class="text-lg font-black text-[#202124]">최근 응답</h2>
          <span class="text-[#9a4e25]">timeout {timeoutCount}</span>
        </div>
        <table class="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th class={tableHeadClass}>시행</th>
              <th class={tableHeadClass}>자극</th>
              <th class={tableHeadClass}>키</th>
              <th class={tableHeadClass}>RT</th>
            </tr>
          </thead>
          <tbody>
            {#if recentResults.length === 0}
              <tr>
                <td class={tableCellClass} colspan="4">아직 응답이 없습니다.</td>
              </tr>
            {:else}
              {#each recentResults as result}
                <tr>
                  <td class={`${tableCellClass} ${resultMarkerClass(result)}`}>
                    {result.trial}
                  </td>
                  <td class={tableCellClass}>{result.stimulus}</td>
                  <td class={tableCellClass}>{result.responseKey ?? '-'}</td>
                  <td class={tableCellClass}>
                    {result.timedOut ? 'timeout' : `${result.rtMs} ms`}
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </aside>
  </main>
</div>
