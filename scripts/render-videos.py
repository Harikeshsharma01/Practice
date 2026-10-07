"""Rebuild original captioned English explainers: python3 scripts/render-videos.py.
Requires FFmpeg with flite/libx264, Python Pillow, and DejaVu fonts. No API key.
Use --limit 1 for a preview. Completed source hashes are reused.
"""
import json, subprocess, pathlib, tempfile, textwrap, concurrent.futures, sys, math
from PIL import Image, ImageDraw, ImageFont
ROOT=pathlib.Path(__file__).resolve().parents[1]
subprocess.run(['node','scripts/video-input.mjs'],cwd=ROOT,check=True)
items=json.loads(pathlib.Path('/tmp/sewestian-video-input.json').read_text())
if '--limit' in sys.argv: items=items[:int(sys.argv[sys.argv.index('--limit')+1])]
out=ROOT/'public/videos'; out.mkdir(parents=True,exist_ok=True)
manifest_path=ROOT/'shared/generated-videos.json'
manifest=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
font_dir='/usr/share/fonts/truetype/dejavu/'
def font(size,bold=False): return ImageFont.truetype(font_dir+('DejaVuSans-Bold.ttf' if bold else 'DejaVuSans.ttf'),size)
def run(args): return subprocess.run(args,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
def stamp(n):
 ms=round(n*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02}.{ms%1000:03}'
def lines(text,f,width):
 rows=[]
 for paragraph in text.split('\n'):
  row=''
  for word in paragraph.split():
   if f.getlength(row+' '+word)>width and row: rows.append(row);row=word
   else: row=(row+' '+word).strip()
  rows.append(row)
 return rows

def render(item):
 id=item['id']; target=out/(id+'.mp4')
 if id in manifest and manifest[id]['hash']==item['hash'] and all((out/(id+suffix)).exists() for suffix in ['.mp4','.jpg','.en.vtt','.hi.vtt']):return id,manifest[id]
 with tempfile.TemporaryDirectory(prefix='sewestian-video-') as td:
  tmp=pathlib.Path(td); segments=[]; cues=[]; total=0
  for i,scene in enumerate(item['scenes']):
   text=scene['narration'].replace('…','.').replace('→',' to ').replace('`','')
   speech=tmp/f'speech{i}.txt';speech.write_text(text)
   wav=tmp/f'audio{i}.wav'
   run(['ffmpeg','-v','error','-f','lavfi','-i',f'flite=textfile={speech}:voice=slt','-y',str(wav)])
   duration=float(run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(wav)]).stdout)+1.0
   im=Image.new('RGB',(960,540),(10,13,28));d=ImageDraw.Draw(im)
   for x,y,r in [(860,115,105),(770,30,125),(945,355,120)]:d.ellipse((x-r,y-r,x+r,y+r),outline=(38,41,77),width=2)
   for k in range(48):
    x=(k*137+43)%960;y=(k*83+21)%540;d.ellipse((x,y,x+1,y+1),fill=(70,85,125))
   d.rounded_rectangle((35,32,925,505),radius=22,fill=(18,23,43),outline=(66,75,112),width=2)
   d.text((60,49),'SEWESTIAN  /  '+scene['heading'],font=font(15,True),fill=(186,235,139))
   y=86
   for row in lines(item['title'],font(27,True),825)[:2]:d.text((60,y),row,font=font(27,True),fill=(240,243,255));y+=35
   y+=12
   body_font=font(20)
   for row in lines(scene['text'],body_font,822)[:9 if not scene.get('code') else 5]:d.text((60,y),row,font=body_font,fill=(205,215,239));y+=29
   if scene.get('code'):
    y+=10
    for row in scene['code'].split('\n')[:max(0,min(6,(448-y)//21))]:d.text((66,y),row[:87],font=ImageFont.truetype(font_dir+'DejaVuSansMono.ttf',15),fill=(145,204,241));y+=21
   d.line((60,460,897,460),fill=(66,75,112),width=2)
   for j,label in enumerate(['Understand','Work through','Check & apply']):
    d.rounded_rectangle((60+j*280,478, 78+j*280,496),radius=9,fill=(186,235,139) if j==i else (67,77,110))
    d.text((87+j*280,478),label,font=font(13),fill=(220,228,249))
   png=tmp/f'slide{i}.png';im.save(png)
   if i==0:im.resize((480,270)).save(out/(id+'.jpg'),quality=82)
   segment=tmp/f'part{i}.mp4'
   vf=f"zoompan=z='min(zoom+0.00006,1.018)':d=1:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':s=960x540:fps=12,fade=t=in:st=0:d=0.3,fade=t=out:st={duration-0.3}:d=0.3,format=yuv420p"
   run(['ffmpeg','-v','error','-threads','1','-loop','1','-i',str(png),'-i',str(wav),'-vf',vf,'-t',str(duration),'-c:v','libx264','-preset','veryfast','-crf','30','-threads','1','-c:a','aac','-b:a','48k','-af','apad','-movflags','+faststart','-y',str(segment)])
   segments.append(segment)
   # Word-weighted sentence cues; narration is explicitly synthetic.
   sentences=[x.strip() for x in __import__('re').split(r'(?<=[.!?])\s+',text) if x.strip()]
   words=sum(len(x.split()) for x in sentences); start=total
   for sentence in sentences:
    end=start+(duration-1)*len(sentence.split())/max(words,1)
    cues.append(f'{stamp(start)} --> {stamp(end)}\n{sentence}\n');start=end
   total+=duration
  concat=tmp/'concat.txt';concat.write_text(''.join(f"file '{p}'\n" for p in segments))
  run(['ffmpeg','-v','error','-f','concat','-safe','0','-i',str(concat),'-c','copy','-movflags','+faststart','-y',str(target)])
  (out/(id+'.en.vtt')).write_text('WEBVTT\n\n'+'\n'.join(cues))
  hindi=item['hindi']; hs=[s.strip()+'।' for s in hindi.split('।') if s.strip()]
  (out/(id+'.hi.vtt')).write_text('WEBVTT\n\n'+'\n'.join(f'{stamp(j*total/len(hs))} --> {stamp((j+1)*total/len(hs))}\n{s}\n' for j,s in enumerate(hs)))
  transcript='\n\n'.join(s['narration'] for s in item['scenes'])
  return id,{'hash':item['hash'],'duration':round(total,2),'src':f'/videos/{id}.mp4','poster':f'/videos/{id}.jpg','english':f'/videos/{id}.en.vtt','hindiTrack':f'/videos/{id}.hi.vtt','hindi':hindi,'transcript':transcript,'voice':'Synthetic English (Flite SLT)','format':'Three-scene narrated study explainer'}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for n,(id,entry) in enumerate(pool.map(render,items),1):
  manifest[id]=entry
  manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
  print(f'{n}/{len(items)} {id}: {entry["duration"]}s',flush=True)
