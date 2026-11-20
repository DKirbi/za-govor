#!/usr/bin/env python3
"""Build Krpan's horse-free Kmečka moč R2 materialization frames and sheet row."""
from pathlib import Path
import base64, json, struct, zlib

ROOT=Path(__file__).resolve().parents[1]
FRAME=48
SOURCE=ROOT/'art/exports/characters/martin-krpan/animations/idle/frame-01.png'
ATLAS=ROOT/'art/source/characters/martin-krpan/atlases/kmecka-moc-r2-materialize-4f.png'
OUT=ROOT/'art/exports/characters/martin-krpan/animations/kmecka-moc-r2-materialize'
SHEET=ROOT/'art/exports/characters/martin-krpan/martin-krpan-sheet.png'
SHEET_INDEX=ROOT/'art/exports/characters/martin-krpan/martin-krpan-sheet.json'
PREVIEW=ROOT/'art/previews/characters/martin-krpan/kmecka-moc-r2-materialize.png'
HTML=ROOT/'art/previews/characters/martin-krpan/kmecka-moc-r2-materialize.html'

def read_png(path):
    d=path.read_bytes(); p=8; ids=[]; w=h=bd=ct=None
    while p<len(d):
        n=struct.unpack('>I',d[p:p+4])[0]; t=d[p+4:p+8]; q=d[p+8:p+8+n]; p+=n+12
        if t==b'IHDR': w,h,bd,ct,_,_,_=struct.unpack('>IIBBBBB',q)
        elif t==b'IDAT': ids.append(q)
    if (bd,ct)!=(8,6): raise ValueError(f'Expected RGBA PNG: {path}')
    raw=zlib.decompress(b''.join(ids)); stride=w*4; out=bytearray(w*h*4); prev=bytearray(stride); p=0
    for y in range(h):
        m=raw[p]; p+=1; row=bytearray(raw[p:p+stride]); p+=stride
        for i in range(stride):
            a=row[i-4] if i>=4 else 0; u=prev[i]; c=prev[i-4] if i>=4 else 0
            if m==1: row[i]=(row[i]+a)&255
            elif m==2: row[i]=(row[i]+u)&255
            elif m==3: row[i]=(row[i]+(a+u)//2)&255
            elif m==4:
                qv=a+u-c; pa,pb,pc=abs(qv-a),abs(qv-u),abs(qv-c); pred=a if pa<=pb and pa<=pc else u if pb<=pc else c; row[i]=(row[i]+pred)&255
            elif m!=0: raise ValueError(f'Unknown PNG filter {m}')
        out[y*stride:(y+1)*stride]=row; prev=row
    return w,h,out

def write_png(path,w,h,p):
    def ch(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    raw=b''.join(b'\0'+p[y*w*4:(y+1)*w*4] for y in range(h))
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+ch(b'IDAT',zlib.compress(raw,9))+ch(b'IEND',b''))

def pixel(buf,x,y): return tuple(buf[(y*FRAME+x)*4:(y*FRAME+x)*4+4])
def setpx(buf,x,y,c): buf[(y*FRAME+x)*4:(y*FRAME+x)*4+4]=bytes(c)
def build_frames():
    w,h,base=read_png(SOURCE)
    if (w,h)!=(FRAME,FRAME): raise ValueError(f'Expected {FRAME}x{FRAME} idle frame')
    opaque=[(x,y) for y in range(h) for x in range(w) if pixel(base,x,y)[3]>=128]
    ymin=min(y for _,y in opaque); ymax=max(y for _,y in opaque)
    frames=[]
    # Reveal from boots upward, then full color, then settle to the unchanged idle drawing.
    for cutoff in (ymin+int((ymax-ymin)*.62), ymin+int((ymax-ymin)*.30)):
        fr=bytearray(FRAME*FRAME*4)
        for x,y in opaque:
            if y>=cutoff: setpx(fr,x,y,pixel(base,x,y))
        frames.append(fr)
    glow=bytearray(base)
    for x,y in opaque:
        # Warm gold on the left-facing silhouette edges catches the emergence without adding a larger effect.
        edge=any(not (0<=x+dx<FRAME and 0<=y+dy<FRAME and pixel(base,x+dx,y+dy)[3]>=128)
                 for dx,dy in ((-1,0),(1,0),(0,-1),(0,1)))
        if edge and ((x+y)%3!=0):
            setpx(glow,x,y,(240,168,78,255))
    frames.append(glow)
    frames.append(bytearray(base))
    return frames

def repeat_sheet(frames):
    iw,ih,old=read_png(SHEET)
    idx=json.loads(SHEET_INDEX.read_text())
    oldrows=idx['rows']; cols=idx['cols']
    if (iw,ih)!=(cols*FRAME,oldrows*FRAME): raise ValueError('Unexpected Krpan sheet dimensions')
    # Replace only the former rank-2 runtime row; preserve every other animation row byte-for-byte.
    target=idx['seqs'].get('kmecka-moc-r2-materialize',idx['seqs'].get('kmecka-moc-r2-salt-sacks'))['row']
    out=bytearray(cols*FRAME*(oldrows*FRAME))
    rowbytes=iw*FRAME*4
    for row in range(oldrows):
        dest=target if row==target else row
        srcrow=target if row==target else row
        out[dest*rowbytes:(dest+1)*rowbytes]=old[srcrow*rowbytes:(srcrow+1)*rowbytes]
    for c,fr in enumerate(frames):
        for y in range(FRAME):
            si=y*FRAME*4; di=(target*FRAME*iw+c*FRAME+y*iw)*4
            out[di:di+FRAME*4]=fr[si:si+FRAME*4]
    write_png(SHEET,iw,ih,out)
    idx['seqs'].pop('kmecka-moc-r2-salt-sacks',None)
    idx['seqs']['kmecka-moc-r2-materialize']={'row':target,'frames':4}
    idx['seqs']={k:v for k,v in sorted(idx['seqs'].items(),key=lambda kv:kv[1]['row'])}
    SHEET_INDEX.write_text(json.dumps(idx,indent=1)+'\n')
    return target

def main():
    frames=build_frames()
    atlas=bytearray(4*FRAME*FRAME*4)
    for n,fr in enumerate(frames):
        (OUT/f'frame-{n+1:02d}.png').parent.mkdir(parents=True,exist_ok=True)
        write_png(OUT/f'frame-{n+1:02d}.png',FRAME,FRAME,fr)
        for y in range(FRAME):
            atlas[y*4*FRAME*4+n*FRAME*4:y*4*FRAME*4+(n+1)*FRAME*4]=fr[y*FRAME*4:(y+1)*FRAME*4]
    write_png(ATLAS,4*FRAME,FRAME,atlas)
    target=repeat_sheet(frames)
    # A large, dark-backed contact image keeps the original 48px scale visible for review.
    bg=(25,30,42,255); scale=4; gap=20; margin=24; cw=4*FRAME*scale+3*gap+2*margin; ch=FRAME*scale+2*margin
    preview=bytearray(bytes(bg)*(cw*ch))
    for n,fr in enumerate(frames):
        ox=margin+n*(FRAME*scale+gap)
        for y in range(FRAME):
            for x in range(FRAME):
                c=pixel(fr,x,y)
                if c[3]:
                    for sy in range(scale):
                        for sx in range(scale):
                            j=((margin+y*scale+sy)*cw+ox+x*scale+sx)*4; preview[j:j+4]=bytes(c)
    write_png(PREVIEW,cw,ch,preview)
    imgs=[]
    for n in range(1,5):
        p=OUT/f'frame-{n:02d}.png'; imgs.append('data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode())
    HTML.write_text('<!doctype html><meta charset="utf-8"><title>Kmečka moč R2 · Krpan materialization</title><style>body{margin:0;background:#191e2a;color:#f4cd80;font:16px system-ui;padding:24px}main{display:flex;gap:20px;align-items:center}img{width:192px;height:192px;image-rendering:pixelated;background:#20202b}p{color:#eee9da}</style><h1>Kmečka moč R2 — Martin Krpan materializes</h1><p>Four 48×48 frames. The same spirit scale as the existing sequence; no horse or companion appears.</p><main>'+''.join(f'<img alt="Frame {i+1}" src="{data}">' for i,data in enumerate(imgs))+'</main>\n',encoding='utf-8')
    print(f'Wrote 4 horse-free 48x48 frames; sheet row {target}; no horse source was read.')

if __name__=='__main__': main()
