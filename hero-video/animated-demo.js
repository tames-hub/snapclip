#!/usr/bin/env node
// Animated SnapClip hero demo with cursor, typing, transitions
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const FRAMES_DIR = path.join(__dirname, 'anim-frames');
const W = 1080, H = 1920, FPS = 30;
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

if (!fs.existsSync(FRAMES_DIR)) fs.mkdirSync(FRAMES_DIR, { recursive: true });

// Each scene is a function(t) → HTML, t=0..1
function lerp(a,b,t){ return a+(b-a)*Math.min(1,Math.max(0,t)); }
function easeOut(t){ return 1-(1-t)*(1-t); }

const baseStyle = `
  *{margin:0;padding:0;box-sizing:border-box;}
  body{width:${W}px;height:${H}px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;overflow:hidden;background:#f9fafb;}
  .grad{background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .grad-bg{background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);}
  .cursor{width:24px;height:24px;border-radius:50%;background:rgba(236,72,153,0.8);position:absolute;pointer-events:none;z-index:999;box-shadow:0 0 20px rgba(236,72,153,0.5);}
`;

// Scene definitions with animation
const scenes = [
  // Scene 1: Upload area with cursor moving to it (3s = 90 frames)
  {
    frames: 90,
    render: (t) => {
      const cursorX = lerp(800, 540, easeOut(Math.min(1, t*2)));
      const cursorY = lerp(1600, 900, easeOut(Math.min(1, t*2)));
      const uploadScale = t > 0.5 ? lerp(1, 1.02, Math.sin((t-0.5)*20)) : 1;
      const borderColor = t > 0.6 ? '#ec4899' : '#d1d5db';
      const showCheck = t > 0.75;
      
      return `
        <style>${baseStyle}</style>
        <div style="padding:100px 60px;">
          <div class="grad" style="font-size:40px;font-weight:800;margin-bottom:50px;">SnapClip</div>
          <h2 style="font-size:52px;font-weight:800;color:#111;margin-bottom:12px;">영상 만들기</h2>
          <p style="font-size:24px;color:#666;margin-bottom:50px;">상품 사진을 업로드하세요</p>
          
          <div style="background:white;border-radius:24px;border:2px ${t>0.6?'solid':'dashed'} ${borderColor};padding:${showCheck?'40':'80'}px 40px;text-align:center;transform:scale(${uploadScale});transition:all 0.3s;">
            ${showCheck ? `
              <div style="display:flex;align-items:center;gap:20px;justify-content:center;">
                <div style="width:140px;height:140px;border-radius:16px;background:linear-gradient(135deg,#fef3c7,#fde68a);display:flex;align-items:center;justify-content:center;font-size:70px;">👕</div>
                <div style="text-align:left;">
                  <p style="font-size:26px;color:#111;font-weight:700;">sweater.png</p>
                  <p style="font-size:20px;color:#22c55e;margin-top:6px;">✓ 업로드 완료</p>
                </div>
              </div>
            ` : `
              <div style="font-size:80px;margin-bottom:16px;">📷</div>
              <p style="font-size:28px;color:#374151;font-weight:600;">사진을 드래그하거나 클릭하세요</p>
              <p style="font-size:20px;color:#9ca3af;margin-top:8px;">JPG, PNG, WEBP (최대 10MB)</p>
            `}
          </div>
          
          ${showCheck ? `
            <div style="margin-top:30px;background:white;border-radius:20px;padding:28px;border:1px solid #e5e7eb;">
              <label style="font-size:20px;font-weight:700;color:#111;display:block;margin-bottom:12px;">상품명</label>
              <div style="padding:16px 20px;border-radius:14px;border:2px solid #ec4899;font-size:22px;color:#111;display:flex;align-items:center;">
                ${'올리브 니트 스웨터'.slice(0, Math.floor(lerp(0, 9, (t-0.75)*4)))}
                <span style="display:inline-block;width:2px;height:28px;background:#ec4899;margin-left:2px;opacity:${Math.sin(t*30)>0?1:0};"></span>
              </div>
            </div>
          ` : ''}
        </div>
        <div class="cursor" style="left:${cursorX}px;top:${cursorY}px;${t>0.6?'transform:scale(0.6);opacity:0.5;':''}"></div>
      `;
    }
  },
  // Scene 2: Template selection with cursor clicking (2.5s = 75 frames)  
  {
    frames: 75,
    render: (t) => {
      const selIdx = t < 0.3 ? -1 : t < 0.6 ? 0 : 1; // none → simple → trendy
      const cursorX = lerp(200, selIdx===0?240:540, easeOut(t*2));
      const cursorY = lerp(300, 580, easeOut(Math.min(1,t*1.5)));
      
      const templates = [
        {emoji:'◻️',name:'심플'},
        {emoji:'🔥',name:'트렌디'},
        {emoji:'💎',name:'고급'}
      ];
      
      return `
        <style>${baseStyle}</style>
        <div style="padding:100px 60px;">
          <div class="grad" style="font-size:40px;font-weight:800;margin-bottom:50px;">SnapClip</div>
          <h2 style="font-size:44px;font-weight:800;color:#111;margin-bottom:36px;">템플릿 선택</h2>
          
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:50px;">
            ${templates.map((tp, i) => `
              <div style="background:${i===selIdx?'linear-gradient(135deg,#f97316,#ec4899,#9333ea)':'white'};border-radius:20px;padding:28px;text-align:center;border:${i===selIdx?'none':'1px solid #e5e7eb'};transform:${i===selIdx?'scale(1.05)':'scale(1)'};transition:all 0.2s;">
                <div style="font-size:48px;margin-bottom:10px;">${tp.emoji}</div>
                <div style="font-size:22px;font-weight:700;color:${i===selIdx?'white':'#111'};">${tp.name}</div>
              </div>
            `).join('')}
          </div>
          
          <h2 style="font-size:44px;font-weight:800;color:#111;margin-bottom:36px;">화면 비율</h2>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:50px;">
            ${[{l:'9:16',d:'릴스/숏츠',s:t>0.5},{l:'1:1',d:'피드',s:false},{l:'16:9',d:'유튜브',s:false}].map(r => `
              <div style="background:${r.s?'linear-gradient(135deg,#f97316,#ec4899,#9333ea)':'white'};border-radius:20px;padding:24px;text-align:center;border:${r.s?'none':'1px solid #e5e7eb'};">
                <div style="font-size:26px;font-weight:800;color:${r.s?'white':'#111'};margin-bottom:2px;">${r.l}</div>
                <div style="font-size:16px;color:${r.s?'rgba(255,255,255,0.8)':'#666'};">${r.d}</div>
              </div>
            `).join('')}
          </div>
          
          <button style="width:100%;padding:26px;border-radius:20px;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);color:white;font-size:26px;font-weight:700;border:none;box-shadow:${t>0.8?'0 12px 40px rgba(236,72,153,0.4)':'0 8px 30px rgba(236,72,153,0.2)'};transform:${t>0.85?'scale(0.97)':'scale(1)'};">
            🎬 영상 생성하기
          </button>
        </div>
        <div class="cursor" style="left:${cursorX}px;top:${cursorY}px;"></div>
      `;
    }
  },
  // Scene 3: AI generating with progress bar (3s = 90 frames)
  {
    frames: 90,
    render: (t) => {
      const progress = Math.floor(lerp(0, 100, easeOut(t)));
      const stages = ['배경 제거', '씬 이미지 생성', '영상 렌더링', '음악 합성'];
      const stageIdx = Math.min(3, Math.floor(t * 4));
      const stageEmojis = ['✂️', '🎨', '🎬', '🎵'];
      
      return `
        <style>${baseStyle}
          @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.5;}}
          .pulsing{animation:pulse 1.5s ease-in-out infinite;}
        </style>
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:60px;text-align:center;">
          <div style="font-size:120px;margin-bottom:40px;">${stageEmojis[stageIdx]}</div>
          <h2 style="font-size:48px;font-weight:800;color:#111;margin-bottom:16px;">AI가 영상을 만들고 있어요</h2>
          <p style="font-size:24px;color:#666;margin-bottom:60px;">잠시만 기다려주세요...</p>
          
          <div style="width:100%;max-width:600px;">
            <div style="background:#e5e7eb;border-radius:100px;height:20px;overflow:hidden;margin-bottom:20px;">
              <div style="width:${progress}%;height:100%;border-radius:100px;background:linear-gradient(90deg,#f97316,#ec4899,#9333ea);transition:width 0.1s;"></div>
            </div>
            <p style="font-size:22px;color:#9333ea;font-weight:600;">${stageEmojis[stageIdx]} ${stages[stageIdx]} 중... ${progress}%</p>
          </div>
          
          <div style="display:flex;gap:12px;margin-top:50px;flex-wrap:wrap;justify-content:center;">
            ${stages.map((s, i) => `
              <div style="padding:12px 20px;border-radius:12px;font-size:18px;font-weight:${i===stageIdx?'600':'400'};
                background:${i<stageIdx?'#ecfdf5':i===stageIdx?'linear-gradient(135deg,#fef3c7,#fce7f3)':'#f3f4f6'};
                color:${i<stageIdx?'#059669':i===stageIdx?'#9333ea':'#9ca3af'};">
                ${i<stageIdx?'✓ ':i===stageIdx?'● ':'○ '}${s}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  },
  // Scene 4: Complete! (3s = 90 frames)
  {
    frames: 90,
    render: (t) => {
      const scale = t < 0.15 ? lerp(0.8, 1.05, easeOut(t/0.15)) : t < 0.25 ? lerp(1.05, 1, (t-0.15)/0.1) : 1;
      const opacity = Math.min(1, t * 3);
      
      return `
        <style>${baseStyle}
          @keyframes confetti{0%{transform:translateY(0) rotate(0deg);opacity:1;}100%{transform:translateY(200px) rotate(720deg);opacity:0;}}
        </style>
        <div style="display:flex;flex-direction:column;align-items:center;padding:140px 60px 0;opacity:${opacity};transform:scale(${scale});">
          <div style="font-size:100px;margin-bottom:30px;">🎉</div>
          <h2 style="font-size:48px;font-weight:800;color:#111;margin-bottom:16px;">영상이 완성되었어요!</h2>
          <p style="font-size:24px;color:#666;margin-bottom:50px;">SNS에 바로 업로드하세요</p>
          
          <div style="width:320px;height:568px;border-radius:24px;background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);margin-bottom:40px;display:flex;align-items:center;justify-content:center;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden;">
            <div style="text-align:center;color:white;">
              <div style="font-size:72px;margin-bottom:16px;">▶️</div>
              <div style="font-size:22px;opacity:0.9;font-weight:600;">올리브 니트 스웨터</div>
              <div style="font-size:17px;opacity:0.5;margin-top:6px;">15초 • 1080p • AI 생성</div>
            </div>
          </div>
          
          <div style="display:flex;gap:16px;">
            <button style="padding:18px 44px;border-radius:16px;background:linear-gradient(135deg,#f97316,#ec4899,#9333ea);color:white;font-size:22px;font-weight:700;border:none;box-shadow:0 8px 30px rgba(236,72,153,0.3);">
              📥 다운로드
            </button>
            <button style="padding:18px 44px;border-radius:16px;background:white;color:#374151;font-size:22px;font-weight:700;border:1px solid #e5e7eb;">
              🔗 공유
            </button>
          </div>
        </div>
      `;
    }
  }
];

async function main() {
  // Clean old frames
  const existing = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.png'));
  existing.forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));
  
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H });
  
  let frameNum = 0;
  
  for (let si = 0; si < scenes.length; si++) {
    const scene = scenes[si];
    console.log(`Scene ${si+1}/${scenes.length} (${scene.frames} frames)`);
    
    for (let f = 0; f < scene.frames; f++) {
      const t = f / (scene.frames - 1);
      const html = scene.render(t);
      
      await page.setContent(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`, {
        waitUntil: 'domcontentloaded'
      });
      
      const padded = String(frameNum).padStart(5, '0');
      await page.screenshot({ path: path.join(FRAMES_DIR, `f_${padded}.png`) });
      frameNum++;
    }
  }
  
  console.log(`Total: ${frameNum} frames (${(frameNum/FPS).toFixed(1)}s at ${FPS}fps)`);
  await browser.close();
}

main().catch(console.error);
