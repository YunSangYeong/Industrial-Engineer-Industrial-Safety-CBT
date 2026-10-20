"""Deterministic authored engineering exercises, not past exam questions.
25 families x 40 input conditions. No statutory thresholds are asserted.
Formula/answer validation is performed independently in tests/model.test.ts.
"""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
import json,csv,io
ROOT=Path(__file__).resolve().parents[1]
SUBJECTS=['산업재해 예방 및 안전보건교육','인간공학 및 위험성 평가·관리','기계·기구 및 설비 안전 관리','전기 및 화학설비 안전 관리','건설공사 안전 관리']
F=[]
def family(subject,kind,topic,unit,make,solve,formula):F.append((subject,kind,topic,unit,make,solve,formula))
# Each problem defines the convention it uses; statistics use explicitly defined denominators.
family(0,'frequency','재해 도수율','',lambda n:(f'한 사업장의 총 근로시간이 500,000시간이고 휴업재해 건수가 {n+1}건이다. 이 문제에서 도수율을 재해 건수 ÷ 총 근로시간 × 1,000,000으로 정의할 때 도수율은?', [n+1,500000]),lambda a,b:Decimal(a)*1000000/Decimal(b),'도수율 = 재해 건수 × 1,000,000 ÷ 총 근로시간')
family(0,'severity','재해 강도율','',lambda n:(f'총 근로시간 200,000시간 동안 근로손실일수 {20+5*n}일이 발생했다. 강도율을 근로손실일수 ÷ 총 근로시간 × 1,000으로 정의할 때 값은?', [20+5*n,200000]),lambda a,b:Decimal(a)*1000/Decimal(b),'강도율 = 근로손실일수 × 1,000 ÷ 총 근로시간')
family(0,'incidence','연천인율','',lambda n:(f'연평균 근로자 500명 중 해당 연도 재해자가 {n+1}명이다. 연천인율을 재해자 수 ÷ 연평균 근로자 수 × 1,000으로 정의하면?', [n+1,500]),lambda a,b:Decimal(a)*1000/Decimal(b),'연천인율 = 연간 재해자 수 × 1,000 ÷ 연평균 근로자 수')
family(0,'lostAverage','재해 1건당 손실일수','일/건',lambda n:(f'동일 기간 재해 5건의 근로손실일수가 합계 {50+5*n}일이다. 재해 1건당 평균 근로손실일수는?', [50+5*n,5]),lambda a,b:Decimal(a)/Decimal(b),'평균 손실일수 = 총 근로손실일수 ÷ 재해 건수')
family(0,'trainingRate','교육 이수 현황','%',lambda n:(f'자체 안전교육 대상자 100명 중 {50+n}명이 교육을 이수했다. 법정 충족 여부와 별개로 단순 이수율을 계산하면?', [50+n,100]),lambda a,b:Decimal(a)*100/Decimal(b),'이수율(%) = 이수자 수 ÷ 대상자 수 × 100')
family(1,'series','직렬 시스템 신뢰도','%',lambda n:(f'독립인 두 구성요소가 모두 정상이어야 시스템이 작동한다. 각각 임무시간 신뢰도가 0.90과 {Decimal(50+n)/100}일 때 시스템 신뢰도(%)는?', [90,50+n]),lambda a,b:Decimal(a)*Decimal(b)/100,'독립 직렬 시스템 신뢰도(%) = R₁(%) × R₂(%) ÷ 100')
family(1,'parallel','병렬 시스템 신뢰도','%',lambda n:(f'독립인 두 구성요소 중 하나 이상이 정상이면 작동한다. 공통원인 고장이 없고 신뢰도가 0.80과 {Decimal(50+n)/100}일 때 시스템 신뢰도(%)는?', [80,50+n]),lambda a,b:100-Decimal(100-a)*Decimal(100-b)/100,'독립 병렬 신뢰도(%) = 100 − (100−R₁) × (100−R₂) ÷ 100')
family(1,'riskScore','위험성 평가 점수','점',lambda n:(f'이 사업장은 자체 평가에서 위험 점수 = 발생가능성 점수 × 중대성 점수로 정했다. 발생가능성 {n+1}점, 중대성 3점일 때 점수는? (이 점수표는 법정 공통 기준이 아니다.)', [n+1,3]),lambda a,b:Decimal(a)*b,'주어진 자체 점수표에서 위험 점수 = 발생가능성 × 중대성')
family(1,'humanMoment','작업 자세와 모멘트','N·m',lambda n:(f'손에 수직 아래로 {20+n*2} N의 하중이 작용한다. 팔꿈치부터 하중 작용선까지 수평 거리가 0.25 m이고 팔 자체 무게는 무시한다. 팔꿈치에 대한 하중의 모멘트 크기는?', [20+n*2,25]),lambda a,b:Decimal(a)*Decimal(b)/100,'모멘트 = 힘 × 수직거리. cm 단위 거리는 100으로 나누어 m로 환산한다')
family(1,'errorFree','반복 작업 무오류 확률','%',lambda n:(f'한 작업의 무오류 확률이 {Decimal(50+n)/100}이다. 두 번의 작업 결과가 서로 독립이고 확률이 같을 때 두 작업 모두 무오류일 확률(%)은?', [50+n,2]),lambda a,b:Decimal(a)**b/100,'독립 반복 2회 무오류 확률(%) = (1회 확률(%) ÷ 100)² × 100')
family(2,'kinetic','움직이는 기계의 운동에너지','J',lambda n:(f'질량 {10+n} kg인 기계 부품이 속력 2 m/s로 병진 운동한다. 회전 운동은 무시할 때 운동에너지는?', [10+n,2]),lambda a,b:Decimal(a)*b*b/2,'병진 운동에너지 E = ½mv². kg·m²/s² = J')
family(2,'pressure','유압 실린더 힘','N',lambda n:(f'유압 실린더의 유효 피스톤 면적은 0.002 m², 압력은 {n+1} MPa이다. 마찰·배압을 무시할 때 이론 출력 힘은?', [n+1,2]),lambda a,b:Decimal(a)*1000000*Decimal(b)/1000,'F = pA. MPa는 10⁶ Pa, 면적 0.002 m²를 사용한다')
family(2,'rimSpeed','회전체 주변 속도','m/s',lambda n:(f'직경 0.20 m인 회전체가 분당 {300+n*30}회 회전한다. π = 3.14로 계산할 때 바깥 둘레의 선속도는?', [20,300+n*30]),lambda a,b:Decimal('3.14')*Decimal(a)/100*Decimal(b)/60,'v = πDn ÷ 60. 직경 D는 m, 회전수 n은 rpm으로 대입한다')
family(2,'gear','맞물린 기어 회전수','rpm',lambda n:(f'잇수 20개인 구동 기어가 {100+n*10} rpm으로 회전한다. 잇수 40개인 종동 기어와 직접 맞물릴 때 종동 기어의 회전수 크기는? 미끄럼은 없다.', [20,40,100+n*10]),lambda a,b,c:Decimal(a)*Decimal(c)/Decimal(b),'n₂ = n₁ × Z₁ ÷ Z₂. 회전 방향이 아닌 회전수의 크기를 구한다')
family(2,'stopDistance','정지 중 등가속도 이동','m',lambda n:(f'기계 이송부의 초기 속력은 {Decimal(10+n)/10} m/s이다. 정지까지 일정하게 감속하고 정지시간은 2 s, 반응 지연은 없다. 감속 중 이동거리는?', [10+n,2]),lambda a,b:Decimal(a)/10*Decimal(b)/2,'등가속도 정지거리 = (초기속도 + 최종속도 0) ÷ 2 × 정지시간')
family(3,'ohm','인체 등가저항 가정의 전류','mA',lambda n:(f'접촉 경로를 순수 저항 2,000 Ω으로 단순화한다. 양단 전압이 {20+n*5} V일 때 옴의 법칙상 전류는 몇 mA인가? 실제 인체 저항·안전 한계 판정에는 사용하지 않는다.', [20+n*5,2000]),lambda a,b:Decimal(a)*1000/Decimal(b),'I = V ÷ R (A). A를 mA로 바꾸기 위해 1,000을 곱한다')
family(3,'joule','저항 발열 에너지','J',lambda n:(f'저항 5 Ω에 일정한 전류 2 A가 {n+1} s 동안 흐른다. 저항과 전류가 일정하다고 가정할 때 발생 열에너지는?', [2,5,n+1]),lambda a,b,c:Decimal(a)*a*b*c,'줄의 법칙 Q = I²Rt. A²·Ω·s = J')
family(3,'power','단상 저항 부하 전력','W',lambda n:(f'단상 교류 회로에서 순수 저항 부하의 실효 전압은 100 V, 실효 전류는 {n+1} A이다. 역률은 1일 때 유효전력은?', [100,n+1]),lambda a,b:Decimal(a)*b,'순수 저항 부하 유효전력 P = VI. 역률 1이며 V와 I는 실효값이다')
family(3,'dilution','완전혼합 용액 희석','%',lambda n:(f'질량 백분율 {10+n}% 용액 100 g에 용질이 없는 물 100 g을 넣는다. 손실·반응·증발 없이 완전히 혼합할 때 최종 질량 백분율은?', [10+n,100,100]),lambda a,b,c:Decimal(a)*Decimal(b)/Decimal(b+c),'최종 질량% = 초기 질량% × 초기 용액 질량 ÷ 최종 용액 질량')
family(3,'ppm','기체 부피 농도','ppm',lambda n:(f'완전히 혼합된 기체 시료의 전체 부피는 1.000 m³이며 그중 특정 기체의 부피는 {n+1} mL이다. 동일 온도·압력의 부피비 농도는 몇 ppm인가? 노출 기준의 적합 여부는 판단하지 않는다.', [n+1,1]),lambda a,b:Decimal(a)/Decimal(b),'1 m³ = 10⁶ mL. 부피 ppm = (성분 mL ÷ 전체 mL) × 10⁶')
family(4,'stress','부재 평균 압축응력','MPa',lambda n:(f'중심 압축하중 {10+n} kN이 단면적 1,000 mm²인 부재에 작용한다. 좌굴·편심·응력집중은 무시할 때 평균 압축응력은?', [10+n,1000]),lambda a,b:Decimal(a)*1000/Decimal(b),'평균 응력 σ = F ÷ A. kN를 N으로 환산하며 N/mm² = MPa')
family(4,'safetyFactor','하중 기준 안전율','',lambda n:(f'단순 하중비로 정의한 안전율 = 파괴하중 ÷ 사용하중이다. 시험 파괴하중이 {100+n*5} kN, 사용하중이 20 kN이면 안전율은? 법정 허용치와 비교하는 문제는 아니다.', [100+n*5,20]),lambda a,b:Decimal(a)/Decimal(b),'주어진 하중 기준 안전율 = 파괴하중 ÷ 사용하중. 같은 단위의 비이므로 무차원이다')
family(4,'craneMoment','양중 하중 모멘트','kN·m',lambda n:(f'하중의 중량이 {10+n} kN이고 회전 중심부터 중량 작용선까지 수평거리가 3 m이다. 정적 하중 모멘트는? 붐 무게·동하중은 무시하며 크레인 허용 능력을 판정하지 않는다.', [10+n,3]),lambda a,b:Decimal(a)*b,'정적 하중 모멘트 = 중량 × 수평 작업반경. kN × m = kN·m')
family(4,'earthVolume','직육면체 굴착량','m³',lambda n:(f'연직 벽을 갖는 이상적인 직육면체 굴착 공간의 길이는 {n+1} m, 폭은 2 m, 깊이는 1.5 m이다. 부풀음·흙막이 두께를 무시한 원지반 굴착 체적은?', [n+1,2,15]),lambda a,b,c:Decimal(a)*b*Decimal(c)/10,'직육면체 체적 = 길이 × 폭 × 깊이. 깊이 1.5 m를 대입한다')
family(4,'distributedLoad','등분포하중 합력','kN',lambda n:(f'길이 4 m 구간에 크기 {n+1} kN/m의 연직 등분포하중이 작용한다. 이 구간 전체에 작용하는 하중의 합력 크기는?', [n+1,4]),lambda a,b:Decimal(a)*b,'등분포하중 합력 = 단위 길이당 하중 × 재하 길이. kN/m × m = kN')

def fmt(n):
 d=Decimal(n).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)
 return format(d,'f').rstrip('0').rstrip('.') if d%1 else str(int(d))
def substitution(kind,v):
 a,b=v[:2];c=v[2] if len(v)>2 else None
 expressions={
 'frequency':f'{a} × 1,000,000 ÷ {b}',
 'severity':f'{a} × 1,000 ÷ {b}',
 'incidence':f'{a} × 1,000 ÷ {b}',
 'lostAverage':f'{a} ÷ {b}',
 'trainingRate':f'{a} ÷ {b} × 100',
 'series':f'{a} × {b} ÷ 100',
 'parallel':f'100 − (100−{a}) × (100−{b}) ÷ 100',
 'riskScore':f'{a} × {b}',
 'humanMoment':f'{a} × ({b} ÷ 100)',
 'errorFree':f'({a} ÷ 100)² × 100',
 'kinetic':f'0.5 × {a} × {b}²',
 'pressure':f'({a} × 1,000,000) × ({b} ÷ 1,000)',
 'rimSpeed':f'3.14 × ({a} ÷ 100) × {b} ÷ 60',
 'gear':f'{c} × {a} ÷ {b}',
 'stopDistance':f'({a} ÷ 10 + 0) ÷ 2 × {b}',
 'ohm':f'{a} ÷ {b} × 1,000',
 'joule':f'{a}² × {b} × {c}',
 'power':f'{a} × {b}',
 'dilution':f'{a} × {b} ÷ ({b} + {c})',
 'ppm':f'{a} ÷ ({b} × 1,000,000) × 1,000,000',
 'stress':f'({a} × 1,000) ÷ {b}',
 'safetyFactor':f'{a} ÷ {b}',
 'craneMoment':f'{a} × {b}',
 'earthVolume':f'{a} × {b} × ({c} ÷ 10)',
 'distributedLoad':f'{a} × {b}'}
 return expressions[kind]

def generate():
 out=[]
 for subject,kind,topic,unit,make,solve,formula in F:
  for n in range(40):
   prompt,values=make(n);result=solve(*values);rounded=Decimal(fmt(result))
   # Positive distinct alternatives; all answers rounded by the same convention.
   delta=min(max(Decimal('.01'),abs(rounded)/10),abs(rounded)/4).quantize(Decimal('.01'),rounding=ROUND_HALF_UP)
   rank=n%4
   options=[rounded+(i-rank)*delta for i in range(4)]
   shift=(n+subject)%4;options=options[shift:]+options[:shift]
   answer=options.index(rounded)+1
   label=lambda v:fmt(v)+(f' {unit}' if unit else '')
   q={'id':f'IS-{subject+1}-{kind}-{n+1:03}','subject':SUBJECTS[subject],'topic':topic,'question':prompt+' 소수 셋째 자리에서 반올림하여 소수 둘째 자리까지 구한다.','choices':[label(v) for v in options],'answer':answer,'explanation':f'{formula}. 수치를 대입하면 {substitution(kind,values)} = {fmt(result)}'+(f' {unit}' if unit else '')+f'이다. 소수 둘째 자리까지 반올림한 값과 일치하는 {answer}번을 선택한다. 주어진 이상화 가정에서만 성립하며 실제 작업의 안전성 판정이나 법정 기준을 대체하지 않는다.','difficulty':'하' if n<20 else '중','year':None,'session':None,'type':'original','sourceUrl':'https://github.com/YunSangYeong/Industrial-Engineer-Industrial-Safety-CBT/blob/main/scripts/generate_bank.py','verificationStatus':'reviewed','reviewNote':'자체 제작 수치 변형. 일반 공학·확률·통계 지식에 따라 식·문장·단위 내부 검토 및 독립 수치 테스트. 저장소 URL은 작성 위치이며 외부 정답 증빙이 아님. 공식 출제기준 대조·외부 전문가 검수 미완료. 기출 아님.','version':'main','rights':'자체 제작, CC BY 4.0, Industrial Safety CBT contributors','family':kind,'calculation':{'kind':kind,'values':values,'result':float(result),'unit':unit,'precision':2}}
   out.append(q)
 return out
if __name__=='__main__':
 bank=generate();(ROOT/'src/data/questions.json').write_text(json.dumps(bank,ensure_ascii=False,indent=2)+'\n')
 # These templates are pending and do not duplicate the public bank.
 sample={**bank[0],'id':'LOCAL-SAMPLE-001','question':'자체 교육 대상 200명 중 150명이 교육을 마쳤다. 단순 이수율은?','topic':'교육 이수율','choices':['25%','50%','75%','100%'],'answer':3,'explanation':'이수율은 150 ÷ 200 × 100 = 75%이다. 법정 교육 충족 여부와 별개인 산술 문제다.','verificationStatus':'pending','reviewNote':'예제. 등록 뒤 출처·정답·권리 확인 필요.'}
 sample.pop('family');sample.pop('calculation')
 (ROOT/'public/templates/questions.json').write_text(json.dumps([sample],ensure_ascii=False,indent=2)+'\n')
 cols=['id','subject','topic','question','choice1','choice2','choice3','choice4','answer','explanation','difficulty','year','session','type','sourceUrl','verificationStatus','reviewNote','version','rights']
 with (ROOT/'public/templates/questions.csv').open('w',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=cols);writer.writeheader();row={k:v for k,v in sample.items() if k!='choices'};row.update({f'choice{i+1}':c for i,c in enumerate(sample['choices'])});writer.writerow(row)
 print(f'{len(bank)} authored exercises; {len(F)} independent families; {len(bank)//len(F)} conditions/family')
