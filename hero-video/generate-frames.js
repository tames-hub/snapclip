#!/usr/bin/env node
// Generate hero demo video frames using puppeteer-core + Chrome
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, 'frames');
const WIDTH = 1080;
const HEIGHT = 1920;

// Find Chrome
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const scenes = [
  {
    name: '01-upload',
    duration: 80, // frames (at 30fps ≈ 2.7s)
    html: `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;padding:120px 60px 0;">
      <div style="width:100%;max-width:900px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:60px;">
          <div style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SnapClip</div>
        </div>
        <h2 style="font-size:48px;font-weight:800;color:#111;margin-bottom:16px;">영상 만들기</h2>
        <p style="font-size:24px;color:#666;margin-bottom:60px;">상품 사진을 업로드하고 스타일을 선택하세요</p>
        
        <div style="background:white;border-radius:24px;border:2px dashed #d1d5db;padding:80px 40px;text-align:center;margin-bottom:40px;">
          <div style="font-size:80px;margin-bottom:20px;">📷</div>
          <p style="font-size:28px;color:#374151;font-weight:600;margin-bottom:8px;">사진을 드래그하거나 클릭하세요</p>
          <p style="font-size:20px;color:#9ca3af;">JPG, PNG, WEBP (최대 10MB)</p>
        </div>
      </div>
    </div>`
  },
  {
    name: '02-photo-added',
    duration: 70,
    html: `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;padding:120px 60px 0;">
      <div style="width:100%;max-width:900px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:60px;">
          <div style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SnapClip</div>
        </div>
        <h2 style="font-size:48px;font-weight:800;color:#111;margin-bottom:16px;">영상 만들기</h2>
        <p style="font-size:24px;color:#666;margin-bottom:60px;">상품 사진을 업로드하고 스타일을 선택하세요</p>
        
        <div style="background:white;border-radius:24px;border:2px solid #ec4899;padding:40px;text-align:center;margin-bottom:40px;">
          <div style="width:200px;height:200px;border-radius:16px;background:linear-gradient(135deg,#fef3c7,#fde68a);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:100px;">👕</div>
          <p style="font-size:24px;color:#111;font-weight:600;">sweater.png</p>
          <p style="font-size:18px;color:#22c55e;margin-top:8px;">✓ 업로드 완료</p>
        </div>
        
        <div style="background:white;border-radius:20px;padding:32px;border:1px solid #e5e7eb;">
          <label style="font-size:22px;font-weight:700;color:#111;display:block;margin-bottom:16px;">상품명 *</label>
          <div style="padding:20px;border-radius:16px;border:1px solid #e5e7eb;font-size:22px;color:#111;">올리브 니트 스웨터</div>
        </div>
      </div>
    </div>`
  },
  {
    name: '03-template',
    duration: 80,
    html: `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;padding:120px 60px 0;">
      <div style="width:100%;max-width:900px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:60px;">
          <div style="font-size:36px;font-weight:800;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">SnapClip</div>
        </div>
        <h2 style="font-size:40px;font-weight:800;color:#111;margin-bottom:40px;">템플릿 선택</h2>
        
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:50px;">
          ${[
            {emoji:'◻️',name:'심플',sel:false},
            {emoji:'🔥',name:'트렌디',sel:true},
            {emoji:'💎',name:'고급',sel:false}
          ].map(t => `
            <div style="background:${t.sel?'linear-gradient(135deg,#f97316,#ec4899,#9333ea)':'white'};border-radius:20px;padding:32px;text-align:center;border:${t.sel?'none':'1px solid #e5e7eb'};">
              <div style="font-size:52px;margin-bottom:12px;">${t.emoji}</div>
              <div style="font-size:24px;font-weight:700;color:${t.sel?'white':'#111'};">${t.name}</div>
            </div>
          `).join('')}
        </div>
        
        <h2 style="font-size:40px;font-weight:800;color:#111;margin-bottom:40px;">화면 비율</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">
          ${[
            {label:'9:16',desc:'릴스/숏츠',sel:true},
            {label:'1:1',desc:'피드',sel:false},
            {label:'16:9',desc:'유튜브',sel:false}
          ].map(r => `
            <div style="background:${r.sel?'linear-gradient(135deg,#f97316,#ec4899,#9333ea)':'white'};border-radius:20px;padding:28px;text-align:center;border:${r.sel?'none':'1px solid #e5e7eb'};">
              <div style="font-size:28px;font-weight:800;color:${r.sel?'white':'#111'};margin-bottom:4px;">${r.label}</div>
              <div style="font-size:18px;color:${r.sel?'rgba(255,255,255,0.8)':'#666'};">${r.desc}</div>
            </div>
          `).join('')}
        </div>
        
        <button style="width:100%;margin-top:50px;padding:28px;border-radius:20px;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);color:white;font-size:28px;font-weight:700;border:none;box-shadow:0 8px 30px rgba(236,72,153,0.3);">
          🎬 영상 생성하기
        </button>
      </div>
    </div>`
  },
  {
    name: '04-generating',
    duration: 90,
    html: `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;">
      <div style="text-align:center;max-width:700px;">
        <div style="font-size:120px;margin-bottom:40px;">🎬</div>
        <h2 style="font-size:44px;font-weight:800;color:#111;margin-bottom:20px;">AI가 영상을 만들고 있어요</h2>
        <p style="font-size:24px;color:#666;margin-bottom:60px;">보통 30초~1분 정도 걸려요</p>
        
        <div style="background:#e5e7eb;border-radius:100px;height:16px;overflow:hidden;margin-bottom:24px;">
          <div style="width:72%;height:100%;background:linear-gradient(90deg,#f97316,#ec4899,#9333ea);border-radius:100px;"></div>
        </div>
        <p style="font-size:20px;color:#9333ea;font-weight:600;">🎨 씬 이미지 생성 중... 72%</p>
        
        <div style="margin-top:60px;display:flex;gap:20px;justify-content:center;">
          ${['배경 제거 ✓','씬 생성 중...','영상 렌더링','음악 합성'].map((s,i) => `
            <div style="padding:14px 24px;border-radius:12px;font-size:18px;${i<1?'background:#ecfdf5;color:#059669;':''}${i===1?'background:linear-gradient(135deg,#fef3c7,#fce7f3);color:#9333ea;font-weight:600;':''}${i>1?'background:#f3f4f6;color:#9ca3af;':''}">
              ${s}
            </div>
          `).join('')}
        </div>
      </div>
    </div>`
  },
  {
    name: '05-complete',
    duration: 100,
    html: `
    <div style="width:${WIDTH}px;height:${HEIGHT}px;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;flex-direction:column;align-items:center;padding:120px 60px 0;">
      <div style="text-align:center;max-width:800px;">
        <div style="font-size:100px;margin-bottom:30px;">🎉</div>
        <h2 style="font-size:48px;font-weight:800;color:#111;margin-bottom:16px;">영상이 완성되었어요!</h2>
        <p style="font-size:24px;color:#666;margin-bottom:50px;">지금 바로 다운로드하거나 SNS에 공유하세요</p>
        
        <div style="width:360px;height:640px;border-radius:24px;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);margin:0 auto 40px;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
          <div style="text-align:center;color:white;">
            <div style="font-size:80px;margin-bottom:20px;">▶️</div>
            <div style="font-size:22px;opacity:0.8;">올리브 니트 스웨터</div>
            <div style="font-size:18px;opacity:0.5;margin-top:8px;">15초 • 1080p</div>
          </div>
        </div>
        
        <div style="display:flex;gap:16px;justify-content:center;">
          <button style="padding:20px 48px;border-radius:16px;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);color:white;font-size:24px;font-weight:700;border:none;box-shadow:0 8px 30px rgba(236,72,153,0.3);">
            📥 다운로드
          </button>
          <button style="padding:20px 48px;border-radius:16px;background:white;color:#374151;font-size:24px;font-weight:700;border:1px solid #e5e7eb;">
            🔗 공유하기
          </button>
        </div>
      </div>
    </div>`
  }
];

async function main() {
  if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: [`--window-size=${WIDTH},${HEIGHT}`]
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT });
  
  let frameNum = 0;
  
  for (const scene of scenes) {
    console.log(`Rendering scene: ${scene.name} (${scene.duration} frames)`);
    
    await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{margin:0;padding:0;box-sizing:border-box;}</style></head><body>${scene.html}</body></html>`, {
      waitUntil: 'load'
    });
    
    for (let f = 0; f < scene.duration; f++) {
      const padded = String(frameNum).padStart(5, '0');
      await page.screenshot({ path: path.join(FRAMES_DIR, `frame_${padded}.png`), type: 'png' });
      frameNum++;
    }
  }
  
  console.log(`Total frames: ${frameNum}`);
  await browser.close();
}

main().catch(console.error);
