# psycholinguistics-ldt

언어심리학 연구과제를 위한 Astro 프로젝트입니다.

## 연구방법

### 어휘판단 과제 (LDT: Lexical Decision Task)

참가자는 화면에 제시된 문자열을 보고 그것이 실제 한국어 단어인지, 아니면 비단어(nonword)인지를 가능한 한 빠르고 정확하게 판단합니다.

예:
단어: “사과”, “바다”, “연필”
비단어: “사모”, “구닙”, “런패” 같은 한국어 형태를 흉내 낸 비단어

단어면 J, 비단어면 F를 누릅니다.

손 배치는 고정하고, 참가자에게 연습 시행을 제공합니다.
RT(Reactions Time)을 측정해야 합니다.

#### 전체 흐름

1. 실험 설명 및 동의
2. 연습 시행 10개
3. 본 시행
4. 종료

#### 한 시행(trial)의 구조

타이밍

- fixation cross: 500 ms
- empty screen: 200 ms
- stimulus: until react, max 2500 ms
- feedback: only in practice
- interval: 1000 ms

규칙

### 회귀분석할 요인

- 정서의 종류 3가지 (긍정적, 중립적, 부정적)
- 한자어 / 순우리말 여부
- 기타 기계적 요인들: LogFreq, OrthN, PhonN
