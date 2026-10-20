import {test,expect,type Page} from '@playwright/test';
async function open(page:Page){
 await page.getByRole('button',{name:'메뉴 열기'}).click();
 await expect(page.locator('.sidebar')).toHaveClass(/open/);
 // Wait for CSS transform animation before choosing input coordinates.
 await page.waitForTimeout(250);
}
for(const viewport of [{width:390,height:480},{width:740,height:360}]){
 for(const input of ['wheel','touch'] as const){
 test(`작은 메뉴 ${viewport.width}×${viewport.height} ${input} 아래·위 실제 입력`,async({page})=>{
  await page.setViewportSize(viewport);await page.goto('');await open(page);
  const sidebar=page.locator('.sidebar');
  expect(await sidebar.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
  const cdp=await page.context().newCDPSession(page);
  if(input==='touch')await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  const move=async(down:boolean)=>{
    if(input==='wheel'){
      await page.mouse.move(110,Math.floor(viewport.height/2));
      await page.mouse.wheel(0,down?650:-650);
    }else{
      const start=down?viewport.height-65:90;
      const end=down?90:viewport.height-65;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:110,y:start,id:1}]});
      for(let i=1;i<=12;i++){
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:110,y:start+(end-start)*i/12,id:1}]});
        await page.waitForTimeout(16);
      }
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    }
    await page.waitForTimeout(180);
  };
  const initialY=await page.evaluate(()=>scrollY);
  for(let i=0;i<4;i++)await move(true);
  expect(await sidebar.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
  await expect(page.getByRole('button',{name:'학습 기록 백업',exact:true})).toBeInViewport();
  await expect(page.getByRole('button',{name:'데이터 초기화',exact:true})).toBeInViewport();
  expect(await page.evaluate(()=>scrollY)).toBe(initialY);
  for(let i=0;i<4;i++)await move(false);
  await expect.poll(()=>sidebar.evaluate(el=>el.scrollTop)).toBe(0);
  const dashboard=page.getByRole('navigation').getByRole('button',{name:'학습 대시보드'});
  await expect(dashboard).toBeInViewport();await dashboard.click();
  await expect(sidebar).not.toHaveClass(/open/);
  await open(page);await page.mouse.click(viewport.width-20,viewport.height/2);
  await expect(sidebar).not.toHaveClass(/open/);
 });
 }
}
test('글자 확대와 뷰포트 높이 변경에도 메뉴 하단과 상단 접근',async({page})=>{
 await page.setViewportSize({width:390,height:480});await page.goto('');
 await page.addStyleTag({content:'.sidebar button,.sidebar p,.sidebar small{font-size:20px!important}.sidebar nav button{height:auto;min-height:65px}'});
 await open(page);await page.setViewportSize({width:390,height:360});
 await page.mouse.move(110,180);await page.mouse.wheel(0,1800);
 await expect(page.getByRole('button',{name:'데이터 초기화',exact:true})).toBeInViewport();
 await page.mouse.wheel(0,-1800);
 await expect(page.getByRole('navigation').getByRole('button',{name:'학습 대시보드'})).toBeInViewport();
});
