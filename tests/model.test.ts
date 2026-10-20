import { describe, expect, it } from "vitest";
import { answerExam, BASE_BANK, checkPractice, createExam, emptyStore, fingerprint, grade, importQuestions, nextPractice, parseCsv, remainingSeconds, restoreStore, startPractice, SUBJECTS, submitExam, validateQuestion } from "../src/model";
const bank=BASE_BANK;
// Independent arithmetic path: JS numbers versus generator's Python Decimal.
const evaluate:Record<string,(v:number[])=>number>={
 frequency:v=>v[0]/v[1]*1e6,
 severity:v=>v[0]/v[1]*1000,
 incidence:v=>1000*v[0]/v[1],
 lostAverage:v=>v[0]/v[1],
 trainingRate:v=>v[0]/v[1]*100,
 series:v=>(v[0]/100)*(v[1]/100)*100,
 parallel:v=>((v[0]/100)+(v[1]/100)-(v[0]/100)*(v[1]/100))*100,
 riskScore:v=>v[0]*v[1],
 humanMoment:v=>v[0]*(v[1]/100),
 errorFree:v=>Math.pow(v[0]/100,v[1])*100,
 kinetic:v=>v[0]*Math.pow(v[1],2)/2,
 pressure:v=>v[0]*v[1]*1000,
 rimSpeed:v=>v[1]/60*(v[0]/100)*3.14,
 gear:v=>v[2]/(v[1]/v[0]),
 stopDistance:v=>(v[0]/10+0)/2*v[1],
 ohm:v=>(v[0]/v[1])*1000,
 joule:v=>Math.pow(v[0],2)*v[1]*v[2],
 power:v=>v[1]*v[0],
 dilution:v=>((v[0]/100*v[1])/(v[1]+v[2]))*100,
 ppm:v=>v[0]/(v[1]*1e6)*1e6,
 stress:v=>(v[0]*1e3)/v[1],
 safetyFactor:v=>v[0]/v[1],
 craneMoment:v=>v[1]*v[0],
 earthVolume:v=>(v[2]/10)*v[1]*v[0],
 distributedLoad:v=>v[1]*v[0]
};
function rounded(v:number){return Math.round((v+Number.EPSILON*Math.max(1,Math.abs(v)))*100)/100;}
describe("자체 제작 문제은행 품질",()=>{
 it("1000개 고유 문항·5과목 각 200개·25유형 각 40개, 기출 0",()=>{
  expect(bank).toHaveLength(1000);
  expect(new Set(bank.map(q=>q.id)).size).toBe(1000);
  expect(new Set(bank.map(fingerprint)).size).toBe(1000);
  SUBJECTS.forEach(s=>expect(bank.filter(q=>q.subject===s)).toHaveLength(200));
  expect(new Set(bank.map(q=>q.family)).size).toBe(25);
  Object.keys(evaluate).forEach(f=>expect(bank.filter(q=>q.family===f)).toHaveLength(40));
  bank.forEach(q=>{validateQuestion(q);expect(q.type).toBe("original");expect(q.year).toBeNull();expect(q.session).toBeNull();expect(q.version).toBe("main");expect(q.reviewNote).toContain("공식");expect(q.rights).toContain("자체 제작");});
 });
 it("반올림 경계",()=>{expect(rounded(0.625)).toBe(.63);expect(rounded(14.325)).toBe(14.33);});
 for(const q of bank) it(`독립 계산·보기·단위 ${q.id}`,()=>{
   const c=q.calculation!; const result=evaluate[c.kind](c.values);
   expect(c.result).toBeCloseTo(result,8);
   const options=q.choices.map(x=>Number.parseFloat(x));
   expect(new Set(options).size).toBe(4);
   expect(options[q.answer-1]).toBeCloseTo(rounded(result),8);
   expect(options.filter(v=>Math.abs(v-rounded(result))<1e-8)).toHaveLength(1);
   expect(q.explanation).toContain(`${q.answer}번`);
   expect(q.explanation).toContain(c.unit);
   expect(q.verificationStatus).toBe("reviewed");
 });
});
describe("모의시험 및 절대 시간", () => {
  it("100개 고유 문항을 균형 있게 추출하며 검증 대기는 제외한다", () => {
    const exam = createExam(
      [...bank, { ...bank[0], id: "pending", verificationStatus: "pending" }],
      "main",
      1000,
    );
    expect(exam.questions).toHaveLength(100);
    expect(new Set(exam.questions.map((q) => q.id)).size).toBe(100);
    SUBJECTS.forEach((s) =>
      expect(exam.questions.filter((q) => q.subject === s)).toHaveLength(20),
    );
    expect(exam.deadline).toBe(9001000);
    expect(exam.questions.some((q) => q.id === "pending")).toBe(false);
  });
  it("각 과목에서 확보된 5개 독립 유형을 우선 포함한다", () => {
    for (let round=0;round<20;round++) {
      const exam=createExam(bank,"main");
      SUBJECTS.forEach(subject => expect(new Set(exam.questions.filter(q=>q.subject===subject).map(q=>q.family)).size).toBe(5));
    }
  });
  it("수입 문항의 유형이 20개 미만이어도 문항 수가 충분하면 100문항 시험을 구성한다", () => {
    const imported = bank.map((q) => ({ ...q, family: `only-${q.subject}` }));
    const exam = createExam(imported, "main");
    expect(exam.questions).toHaveLength(100);
    expect(new Set(exam.questions.map((q) => q.id)).size).toBe(100);
  });
  it("미준비 버전과 과목 문항 부족은 시험 시작을 차단한다", () => {
    expect(() => createExam(bank.filter(q => q.verificationStatus === "pending"), "main")).toThrow();
    expect(() =>
      createExam(
        bank.filter((q) => q.subject !== SUBJECTS[0]),
        "main",
      ),
    ).toThrow();
  });
  it("평균 59점 불합격·60점 합격·과목별 40점 경계와 과락을 판정한다", () => {
    const e=createExam(bank,"main");
    const groups=SUBJECTS.map(s=>e.questions.filter(q=>q.subject===s));
    const answer=(counts:number[])=> {e.answers={};groups.forEach((g,i)=>g.slice(0,counts[i]).forEach(q=>e.answers[q.id]=q.answer));return grade(e);};
    expect(answer([11,12,12,12,12])).toMatchObject({score:59,passed:false});
    expect(answer([12,12,12,12,12])).toMatchObject({score:60,passed:true,unanswered:40});
    expect(answer([8,13,13,13,13])).toMatchObject({score:60,passed:true});
    expect(answer([7,20,20,20,20])).toMatchObject({score:87,passed:false});
    expect(answer([0,20,20,20,20])).toMatchObject({score:80,passed:false});
  });
  it("답안 변경을 허용하고 종료 시각 이후 변경은 차단한다", () => {
    let state = { ...emptyStore(), exam: createExam(bank, "main", 1000) };
    const id = state.exam.questions[0].id;
    let s = answerExam(state, id, 1, 2000);
    s = answerExam(s, id, 2, 3000);
    expect(s.exam?.answers[id]).toBe(2);
    s = answerExam(s, id, 3, 9001000);
    expect(s.exam).toBeNull();
    expect(s.results[0].answers[id]).toBe(2);
    expect(s.results[0].reason).toBe("timeout");
  });
  it("새로고침 후 절대 시각으로 복원하고 백그라운드 지연을 더하지 않는다", () => {
    const s = { ...emptyStore(), exam: createExam(bank, "main", 1000) };
    const restored = restoreStore(JSON.stringify(s));
    expect(remainingSeconds(restored.exam!.deadline, 1000)).toBe(9000);
    expect(remainingSeconds(restored.exam!.deadline, 1801000)).toBe(7200);
    expect(remainingSeconds(restored.exam!.deadline, 9000999)).toBe(1);
    expect(remainingSeconds(restored.exam!.deadline, 9001000)).toBe(0);
    expect(remainingSeconds(restored.exam!.deadline, 9999999)).toBe(0);
  });
  it("제출은 한 번만 기록되고 미응답은 오답노트에 들어간다", () => {
    const s = { ...emptyStore(), exam: createExam(bank, "main", 1000) };
    const submitted = submitExam(s, 4000);
    expect(submitted.attempts).toHaveLength(100);
    expect(submitted.wrongIds).toHaveLength(100);
    expect(submitted.results).toHaveLength(1);
    expect(submitExam(submitted, 5000)).toEqual(submitted);
  });
});
describe("랜덤 학습", () => {
  it("한 과목의 모든 문항을 순회하기 전에는 중복이 없다", () => {
    let p = startPractice(bank, "main", SUBJECTS[0]);
    const ids = new Set<string>();
    for (let i = 0; i < 200; i++) {
      expect(ids.has(p.currentId)).toBe(false);
      ids.add(p.currentId);
      p = nextPractice(p, bank);
    }
    expect(ids.size).toBe(200);
    expect(p.subject).toBe(SUBJECTS[0]);
  });
  it("즉시 채점·연속 정답·통계를 저장하며 중복 채점을 방지한다", () => {
    const p = startPractice(bank, "main");
    const q = bank.find((q) => q.id === p.currentId)!;
    const s = checkPractice(
      {
        ...emptyStore(),
        wrongIds: [q.id],
        practice: { ...p, selected: q.answer },
      },
      bank,
      1234,
    );
    expect(s.practice).toMatchObject({
      revealed: true,
      streak: 1,
      correct: 1,
      answered: 1,
    });
    expect(s.attempts).toHaveLength(1);
    expect(s.wrongIds).not.toContain(q.id);
    expect(checkPractice(s, bank, 3000)).toEqual(s);
    const next = nextPractice(s.practice!, bank);
    const q2 = bank.find((q) => q.id === next.currentId)!;
    const wrong = checkPractice(
      { ...s, practice: { ...next, selected: (q2.answer % 4) + 1 } },
      bank,
    );
    expect(wrong.practice?.streak).toBe(0);
    expect(wrong.wrongIds).toContain(q2.id);
  });
  it("오답만 선택한 복습에서는 해당 문항만 출제하며 1개 문제도 재학습할 수 있다", () => {
    const p = startPractice(bank, "main", "전체", [bank[0].id]);
    expect(p.currentId).toBe(bank[0].id);
    expect(nextPractice({ ...p, revealed: true }, bank)).toMatchObject({
      currentId: bank[0].id,
      revealed: false,
    });
  });
});
describe("가져오기 및 복구", () => {
  const example = {
    ...bank[0],
    id: "CUSTOM-001",
    question: "사용자가 작성한 고유한 질문",
  };
  it("JSON은 검증 대기로 등록하며 ID 및 보기 순서가 다른 동일 문항을 중복 제거한다", () => {
    expect(importQuestions([example], bank).added[0].verificationStatus).toBe(
      "pending",
    );
    expect(
      importQuestions(
        [
          bank[0],
          {
            ...bank[0],
            id: "OTHER",
            choices: [...bank[0].choices].reverse(),
            answer: 5 - bank[0].answer,
          },
        ],
        bank,
      ),
    ).toMatchObject({ added: [], duplicates: 2 });
  });
  it("CSV의 쉼표·줄바꿈·따옴표를 보존하며 JSON과 동등한 문항을 읽는다", () => {
    const q = { ...example, question: '쉼표, 따옴표 "테스트"\n다음 줄' };
    const { choices, ...rest } = q;
    const entries = {
      ...rest,
      choice1: choices[0],
      choice2: choices[1],
      choice3: choices[2],
      choice4: choices[3],
    };
    const escape = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;
    const csv =
      Object.keys(entries).join(",") +
      "\n" +
      Object.values(entries).map(escape).join(",");
    const parsed = parseCsv(csv);
    expect(importQuestions(parsed, bank).added[0].question).toBe(q.question);
  });
  it("가짜 연도, 잘못된 정답, 중복 보기, 위험한 출처 URL, 미완결 CSV는 차단한다", () => {
    for (const value of [
      { ...example, year: 2020 },
      { ...example, answer: 5 },
      { ...example, choices: ["a", "a", "b", "c"] },
      { ...example, sourceUrl: "javascript:alert(1)" },
      { ...example, sourceUrl: "https://example.com", session: "1" },
    ])
      expect(() => importQuestions([value], bank)).toThrow();
    expect(() => parseCsv('id,question\n"open')).toThrow();
    expect(() => parseCsv("id,id\nx,x")).toThrow();
    expect(() => parseCsv("id,question\none")).toThrow();
  });
  it("1개 오류라도 전체 등록을 중단한다", () => {
    expect(() =>
      importQuestions(
        [example, { ...example, id: "invalid", answer: 99 }],
        bank,
      ),
    ).toThrow("2번 문항");
  });
  it("존재하는 기록은 보존하고 손상된 저장소 형식은 거부한다", () => {
    expect(restoreStore(null)).toEqual(emptyStore());
    expect(restoreStore(JSON.stringify(emptyStore()))).toEqual(emptyStore());
    expect(() => restoreStore("{bad")).toThrow();
    expect(() =>
      restoreStore(
        JSON.stringify({ ...emptyStore(), exam: { questions: [] } }),
      ),
    ).toThrow();
    expect(() =>
      restoreStore(
        JSON.stringify({ ...emptyStore(), practice: { currentId: "invalid" } }),
      ),
    ).toThrow();
  });
});
