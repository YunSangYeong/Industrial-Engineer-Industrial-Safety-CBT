export const QUALIFICATION = {
  "name": "산업안전산업기사",
  "slug": "Industrial-Engineer-Industrial-Safety-CBT",
  "subjects": [
    "산업재해 예방 및 안전보건교육",
    "인간공학 및 위험성 평가·관리",
    "기계·기구 및 설비 안전 관리",
    "전기 및 화학설비 안전 관리",
    "건설공사 안전 관리"
  ],
  "questionsPerSubject": 20,
  "questionCount": 100,
  "durationMinutes": 150,
  "choiceCount": 4,
  "passScore": 60,
  "subjectCutoff": 40,
  "storageKey": "industrial-safety-associate-cbt:v1",
  "bankId": "main",
  "rulesVerificationStatus": "pending",
  "officialSource": "https://www.q-net.or.kr/crf005.do?id=crf00503&jmCd=2381",
  "rulesNote": "잠정 설정. Q-Net 공식 자료는 프록시 HTTP 403으로 본문 확인하지 못함. 공식 재현 검증 미완료."
} as const;
