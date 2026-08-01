import type { Subject, SmartParseResult } from '../types';

export function parseNaturalLanguage(text: string, subjects: Subject[]): SmartParseResult {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      rawText: '',
      title: '',
      detectedType: 'all',
      confidence: 0,
    };
  }

  const now = new Date();
  let targetDate = new Date(now);
  let hasDate = false;
  let hasTime = false;
  let parsedTime = '';

  let workingText = trimmed;

  // 1. 과목 매칭 (Subject Recognition)
  let foundSubject: Subject | undefined = undefined;
  for (const subj of subjects) {
    if (workingText.includes(subj.name)) {
      foundSubject = subj;
      break;
    }
    if (subj.code && workingText.toLowerCase().includes(subj.code.toLowerCase())) {
      foundSubject = subj;
      break;
    }
  }
  // 약어 처리 (예: 컴프로 -> 컴퓨터프로그래밍, 경영 -> 경영학원론)
  if (!foundSubject) {
    const aliasMap: Record<string, string> = {
      '컴프로': '컴퓨터프로그래밍',
      '경영': '경영학원론',
      '마케팅': '마케팅원론',
      '영회': '영어회화',
    };
    for (const [alias, full] of Object.entries(aliasMap)) {
      if (workingText.includes(alias)) {
        foundSubject = subjects.find(s => s.name.includes(full));
        if (foundSubject) break;
      }
    }
  }

  // 2. 상대적 날짜 파싱 (오늘, 내일, 모레, 이번주 등)
  if (/\b오늘\b/.test(workingText)) {
    hasDate = true;
    workingText = workingText.replace(/\b오늘\b/g, '');
  } else if (/\b내일\b/.test(workingText)) {
    hasDate = true;
    targetDate.setDate(targetDate.getDate() + 1);
    workingText = workingText.replace(/\b내일\b/g, '');
  } else if (/\b모레\b/.test(workingText)) {
    hasDate = true;
    targetDate.setDate(targetDate.getDate() + 2);
    workingText = workingText.replace(/\b모레\b/g, '');
  }

  // 3. absolute date parsing (M월 D일, YYYY-MM-DD 등)
  const monthDayRegex = /(\d{1,2})월\s*(\d{1,2})일/;
  const matchMD = workingText.match(monthDayRegex);
  if (matchMD) {
    hasDate = true;
    const m = parseInt(matchMD[1], 10) - 1;
    const d = parseInt(matchMD[2], 10);
    targetDate.setMonth(m, d);
    // If month is in past compared to today, assume current year
    workingText = workingText.replace(monthDayRegex, '');
  }

  // 4. 시간 파싱 (오전/오후 X시, XX:XX, X시반)
  const timeRegex = /(오전|오후|아침|저녁|밤)?\s*(\d{1,2})시(?:\s*(\d{1,2})분|\s*(반))?/;
  const matchTime = workingText.match(timeRegex);
  if (matchTime) {
    hasTime = true;
    const ampm = matchTime[1];
    let hour = parseInt(matchTime[2], 10);
    let minute = 0;
    if (matchTime[3]) minute = parseInt(matchTime[3], 10);
    if (matchTime[4] === '반') minute = 30;

    if (ampm === '오후' || ampm === '저녁' || ampm === '밤') {
      if (hour < 12) hour += 12;
    } else if (ampm === '오전' || ampm === '아침') {
      if (hour === 12) hour = 0;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    parsedTime = `${pad(hour)}:${pad(minute)}`;
    workingText = workingText.replace(timeRegex, '');
  } else {
    const hhmmRegex = /(\d{1,2}):(\d{2})/;
    const matchHHMM = workingText.match(hhmmRegex);
    if (matchHHMM) {
      hasTime = true;
      const hour = parseInt(matchHHMM[1], 10);
      const minute = parseInt(matchHHMM[2], 10);
      const pad = (n: number) => n.toString().padStart(2, '0');
      parsedTime = `${pad(hour)}:${pad(minute)}`;
      workingText = workingText.replace(hhmmRegex, '');
    }
  }

  // 5. 불필요 접속사/조사 정리 (에, 을, 를, 공부를, 할거야 등)
  let cleanTitle = workingText
    .replace(/(에|에서|을|를|이|가)\s*$/g, '')
    .replace(/공부를\s*할거야|공부하기|복습하기|과제하기|공부|복습|과제|제출/g, (m) => m) // keep key verbs
    .trim();

  // If title became empty or too short, revert to trimmed text
  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = trimmed;
  }

  // Format date YYYY-MM-DD
  const year = targetDate.getFullYear();
  const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
  const day = targetDate.getDate().toString().padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;

  const confidence = (hasDate ? 0.4 : 0.1) + (hasTime ? 0.3 : 0) + (foundSubject ? 0.3 : 0);

  return {
    rawText: trimmed,
    date: formattedDate,
    time: hasTime ? parsedTime : '19:00',
    subjectId: foundSubject?.id,
    subjectName: foundSubject?.name,
    title: cleanTitle,
    detectedType: 'all',
    confidence,
  };
}
