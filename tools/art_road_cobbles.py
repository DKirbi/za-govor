#!/usr/bin/env python3
"""Create the 1:1 Ptuj cobble masters and three-copy seam previews."""
from pathlib import Path
import math, random, struct, subprocess, zlib
ROOT=Path(__file__).resolve().parents[1]; W,H=1672,240

def canvas(w,h,c): return bytearray(bytes(c)*(w*h))
def put(b,w,h,x,y,c):
    if 0<=x<w and 0<=y<h:
        i=(y*w+x)*4; b[i:i+4]=bytes(c)
def poly(b,w,h,pts,c):
    for y in range(max(0,int(min(q[1] for q in pts))),min(h,int(max(q[1] for q in pts))+1)):
        xs=[]
        for i,(x1,y1) in enumerate(pts):
            x2,y2=pts[(i+1)%len(pts)]
            if y1!=y2 and min(y1,y2)<=y<max(y1,y2): xs.append(x1+(y-y1)*(x2-x1)/(y2-y1))
        xs.sort()
        for a,z in zip(xs[::2],xs[1::2]):
            for x in range(max(0,math.ceil(a)),min(w,math.floor(z)+1)): put(b,w,h,x,y,c)
def line(b,w,h,x0,y0,x1,y1,c):
    dx,sx=abs(x1-x0),1 if x0<x1 else -1; dy,sy=-abs(y1-y0),1 if y0<y1 else -1; e=dx+dy
    while True:
        put(b,w,h,x0,y0,c)
        if x0==x1 and y0==y1: break
        e2=2*e
        if e2>=dy: e+=dy; x0+=sx
        if e2<=dx: e+=dx; y0+=sy
def pngwrite(path,w,h,p):
    def ch(t,d): return struct.pack(">I",len(d))+t+d+struct.pack(">I",zlib.crc32(t+d)&0xffffffff)
    raw=b"".join(b"\0"+p[y*w*4:(y+1)*w*4] for y in range(h))
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(b"\x89PNG\r\n\x1a\n"+ch(b"IHDR",struct.pack(">IIBBBBB",w,h,8,6,0,0,0))+ch(b"IDAT",zlib.compress(raw,9))+ch(b"IEND",b""))
def period(rng,n,lo,hi):
    a=[]
    while sum(a)<n: a.append(rng.randint(lo,hi))
    old=sum(a); a=[max(lo,min(hi,round(x*n/old))) for x in a]
    d=n-sum(a); ids=list(range(len(a))); rng.shuffle(ids)
    while d:
        for i in ids:
            step=1 if d>0 else -1
            if lo<=a[i]+step<=hi: a[i]+=step; d-=step
            if d==0: break
    return a
def shift(c,d): return tuple(max(0,min(255,x+d)) for x in c[:3])+(255,)
def stone(b,x0,x1,y0,y1,r,winter):
    dark=(43,29,42,255) if not winter else (54,49,73,255)
    base=((180+r.randrange(-20,21),93+r.randrange(-18,19),88+r.randrange(-16,17)) if not winter else (164+r.randrange(-16,17),105+r.randrange(-14,15),108+r.randrange(-12,13)))+(255,)
    pts=[(x0+4,y0+4),(x0+9,y0+1),(x0+(x1-x0)*.30,y0),(x0+(x1-x0)*.60,y0+1),(x1-7,y0+3),(x1-2,y0+7),(x1,y0+13),(x1-4,y1-1),(x1-10,y1),(x0+(x1-x0)*.52,y1),(x0+8,y1-1),(x0+2,y0+15),(x0,y0+10)]
    poly(b,W,H,pts,dark)
    inner=[(x+(1 if x<(x0+x1)/2 else -1),y+(1 if y<(y0+y1)/2 else -1)) for x,y in pts]
    poly(b,W,H,inner,base)
    mid=y0+(y1-y0)//2
    poly(b,W,H,[(x0+4,y0+4),(x0+(x1-x0)*.37,y0+3),(x1-6,y0+5),(x1-6,mid),(x0+5,mid)],shift(base,13))
    poly(b,W,H,[(x0+5,mid),(x1-6,mid),(x1-5,y1-3),(x0+6,y1-3)],shift(base,-13))
    line(b,W,H,x0+5,y0+4,x0+int((x1-x0)*.27),y0+3,shift(base,25))
    if x1-x0>31: line(b,W,H,x0+int((x1-x0)*.48),y0+5,x0+int((x1-x0)*.63),y0+5,shift(base,18))
    if winter and r.random()<0.78:
        sh=r.randint(7,10); nx=x0+r.randint(1,5); ex=x1-r.randint(4,8)
        poly(b,W,H,[(nx,y0+3),(nx+6,y0+2),(nx+13,y0+4),(nx+21,y0+2),(ex,y0+4),(ex-1,y0+sh),(nx+2,y0+sh+1)],(229,226,245,255))
        line(b,W,H,nx+3,y0+4,min(ex-2,nx+11),y0+4,(255,250,246,255))
        if r.random()<0.32:
            sx=nx+r.randint(4,12); sy=y0+r.randint(10,13); ew=r.randint(10,22)
            poly(b,W,H,[(sx,sy+2),(sx+4,sy),(sx+9,sy+1),(sx+ew,sy+2),(sx+ew-2,sy+4),(sx+2,sy+4)],(216,217,239,255))
def build(winter):
    r=random.Random(240119 if winter else 240118)
    mort=(49,32,45,255) if not winter else (61,55,76,255); b=canvas(W,H,mort)
    # 22 px curb course, with warm sandstone caps and winter snow.
    x=0
    for bw in period(r,W,72,96):
        for dx in (-W,0,W):
            poly(b,W,H,[(x+2+dx,1),(x+bw-3+dx,1),(x+bw-1+dx,4),(x+bw-2+dx,16),(x+bw-5+dx,20),(x+4+dx,21)],(47,29,42,255) if not winter else (54,50,73,255))
            poly(b,W,H,[(x+5+dx,3),(x+bw-6+dx,3),(x+bw-4+dx,15),(x+bw-7+dx,18),(x+5+dx,18)],(173,86,68,255) if not winter else (172,118,95,255))
            poly(b,W,H,[(x+7+dx,4),(x+bw-8+dx,4),(x+bw-9+dx,8),(x+8+dx,8)],(211,125,78,255) if not winter else (197,150,128,255))
            line(b,W,H,x+8+dx,4,x+bw-12+dx,4,(245,166,91,255) if not winter else (245,226,235,255))
            if winter:
                poly(b,W,H,[(x+3+dx,1),(x+11+dx,0),(x+22+dx,1),(x+31+dx,0),(x+bw-4+dx,2),(x+bw-5+dx,6),(x+5+dx,6)],(235,233,247,255))
        x+=bw
    y=22
    for row,rh in enumerate([22]*9+[20]):
        rr=random.Random((0xBEEF if winter else 0x5EED)+row*7919)
        widths=period(rr,W,25,45); x=rr.randrange(W)-W
        for bw in widths:
            jy0=y+rr.randint(-5,4); jy1=y+rh-1+rr.randint(-4,5)
            for dx in (-W,0,W): stone(b,x+dx,x+bw+dx,jy0,jy1,rr,winter)
            x+=bw
        if winter:
            phase=rr.randrange(W)-W
            sx=phase
            while sx<phase+W:
                sw=rr.randint(26,62); cy=y+rr.randint(-4,3)
                for dx in (-W,0,W):
                    poly(b,W,H,[(sx+dx,cy+3),(sx+6+dx,cy),(sx+14+dx,cy+1),(sx+22+dx,cy-1),(sx+sw+dx,cy+1),(sx+sw-3+dx,cy+7),(sx+5+dx,cy+8)],(228,226,244,255))
                sx+=rr.randint(72,126)
        y+=rh
    for x in range(0,W,97 if winter else 83): put(b,W,H,x,0,(0,0,0,0))
    return b
def readrgba(path):
    d=path.read_bytes(); p=8; ids=[]; w=h=bd=ct=None
    while p<len(d):
        n=struct.unpack(">I",d[p:p+4])[0]; t=d[p+4:p+8]; q=d[p+8:p+8+n]; p+=n+12
        if t==b"IHDR": w,h,bd,ct,_,_,_=struct.unpack(">IIBBBBB",q)
        elif t==b"IDAT": ids.append(q)
    raw=zlib.decompress(b"".join(ids)); stride=w*4; out=bytearray(w*h*4); prev=bytearray(stride); p=0
    for y in range(h):
        m=raw[p]; p+=1; row=bytearray(raw[p:p+stride]); p+=stride
        for i in range(stride):
            a=row[i-4] if i>=4 else 0; u=prev[i]; c=prev[i-4] if i>=4 else 0
            if m==1: row[i]=(row[i]+a)&255
            elif m==2: row[i]=(row[i]+u)&255
            elif m==3: row[i]=(row[i]+(a+u)//2)&255
            elif m==4:
                qv=a+u-c; pa,pb,pc=abs(qv-a),abs(qv-u),abs(qv-c); pred=a if pa<=pb and pa<=pc else u if pb<=pc else c; row[i]=(row[i]+pred)&255
        out[y*stride:(y+1)*stride]=row; prev=row
    return w,h,out
def main():
    for winter in (False,True):
        season="winter" if winter else "summer"; pixels=build(winter)
        master=ROOT/f"art/source/environments/ptuj/{'winter-' if winter else ''}road-cobbles.png"
        export=ROOT/f"art/exports/environments/ptuj/{'winter/' if winter else ''}road-cobbles.png"
        pngwrite(master,W,H,pixels); pngwrite(export,W,H,pixels)
        w,h,p=readrgba(export)
        assert (w,h)==(W,H)
        assert len(p)==w*h*4, f"{season}: malformed raster buffer"
        # Only the top contact edge may be transparent; the ground itself stays opaque.
        assert all(p[(y*w+x)*4+3]==255 for y in range(1,h) for x in range(w)), f"{season}: unexpected transparency below curb"
        # Test both repeat joins against each other, and check there is no uninterrupted mortar band.
        triple=bytearray().join([p[y*w*4:(y+1)*w*4]*3 for y in range(h)])
        for y in range(h):
            a=triple[(y*w*3*4+(w-8)*4):(y*w*3*4+(w+8)*4)]
            b=triple[(y*w*3*4+(2*w-8)*4):(y*w*3*4+(2*w+8)*4)]
            assert a==b, f"{season}: repeated seam differs at row {y}"
        for y in range(25,h):
            row=[bytes(p[(y*w+x)*4:(y*w+x)*4+3]) for x in range(w)]
            assert len(set(row))>1, f"{season}: flat horizontal row at y={y}"
        triple=bytearray().join([p[y*w*4:(y+1)*w*4]*3 for y in range(h)]); temp=ROOT/f"art/previews/environments/ptuj/.{season}-road-cobbles-3x.png"
        jpg=ROOT/f"art/previews/environments/ptuj/{season}-road-cobbles-3x.jpg"
        pngwrite(temp,W*3,H,triple)
        subprocess.run(["sips","-s","format","jpeg","-s","formatOptions","92",str(temp),"--out",str(jpg)],check=True,stdout=subprocess.DEVNULL)
        temp.unlink()
        print(f"{season}: {w}x{h}; periodic layout and three-copy seam preview generated")
if __name__=="__main__": main()
