#!/usr/bin/env python3
"""Build Krpan's solo Kmečka moč R2 salt-bag throw and compact downed export."""
from pathlib import Path
import json
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
FRAME = 48
SOURCE = ROOT / 'art/source/characters/martin-krpan/atlases/salt-sacks-4f.png'
OUT = ROOT / 'art/exports/characters/martin-krpan/animations/kmecka-moc-r2-salt-bag-throw'
ATLAS = ROOT / 'art/source/characters/martin-krpan/atlases/kmecka-moc-r2-salt-bag-throw-4f.png'
SHEET = ROOT / 'art/exports/characters/martin-krpan/martin-krpan-sheet.png'
INDEX = ROOT / 'art/exports/characters/martin-krpan/martin-krpan-sheet.json'
PREVIEW = ROOT / 'art/previews/characters/martin-krpan/kmecka-moc-r2-salt-bag-throw.png'
DOWNED_SOURCE = ROOT / 'art/source/characters/martin-krpan/atlases/downed.png'
DOWNED = ROOT / 'art/exports/characters/martin-krpan/animations/downed/frame-01.png'

PALETTE = [tuple(bytes.fromhex(c)) for c in (
    '1d1410','171522','24202e','393447','514b5b','756a78',
    'f2ecdc','dbcfb8','c0aa8e','e9b98f','c98f66','a76848',
    'b8322f','e24832','f0a84e','e9b93f','fff0ad',
    '3f2923','65402a','88552f','a66a35','c58b4e',
    '5e493c','7e6651','9a8061','4a382e','d9b678')]

def read_png(path):
    d = path.read_bytes(); pos = 8; chunks = []; width = height = depth = color = None
    while pos < len(d):
        n = struct.unpack('>I', d[pos:pos+4])[0]; typ = d[pos+4:pos+8]; data = d[pos+8:pos+8+n]; pos += n + 12
        if typ == b'IHDR': width, height, depth, color, _, _, _ = struct.unpack('>IIBBBBB', data)
        elif typ == b'IDAT': chunks.append(data)
    if (depth, color) != (8, 6): raise ValueError(f'Expected RGBA PNG: {path}')
    raw = zlib.decompress(b''.join(chunks)); stride = width * 4; pixels = bytearray(width*height*4); prev = bytearray(stride); pos = 0
    for y in range(height):
        mode = raw[pos]; pos += 1; row = bytearray(raw[pos:pos+stride]); pos += stride
        for i in range(stride):
            a = row[i-4] if i >= 4 else 0; up = prev[i]; ul = prev[i-4] if i >= 4 else 0
            if mode == 1: row[i] = (row[i] + a) & 255
            elif mode == 2: row[i] = (row[i] + up) & 255
            elif mode == 3: row[i] = (row[i] + (a+up)//2) & 255
            elif mode == 4:
                q = a + up - ul; pa,pb,pc = abs(q-a),abs(q-up),abs(q-ul); pred = a if pa <= pb and pa <= pc else up if pb <= pc else ul; row[i] = (row[i]+pred)&255
            elif mode != 0: raise ValueError(f'Unknown PNG filter {mode}')
        pixels[y*stride:(y+1)*stride] = row; prev = row
    return width,height,pixels

def write_png(path,w,h,pixels):
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    raw = b''.join(b'\0'+pixels[y*w*4:(y+1)*w*4] for y in range(h)); path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))

def nearest(rgb): return min(PALETTE,key=lambda c:sum((rgb[i]-c[i])**2 for i in range(3)))
def crop_resize(src,w,box,scale):
    x0,y0,x1,y1=box; ow=max(1,round((x1-x0)*scale)); oh=max(1,round((y1-y0)*scale)); out=bytearray(ow*oh*4)
    for y in range(oh):
        sy=y0+min(y1-y0-1,int((y+.5)/scale))
        for x in range(ow):
            sx=x0+min(x1-x0-1,int((x+.5)/scale)); i=(sy*w+sx)*4; c=src[i:i+4]
            if c[3]>=128: out[(y*ow+x)*4:(y*ow+x+1)*4]=bytes((*nearest(c[:3]),255))
    return ow,oh,out
def frame(): return bytearray(FRAME*FRAME*4)
def blit(dst,src,sw,sh,x,y):
    if x<0 or y<0 or x+sw>FRAME or y+sh>FRAME: raise ValueError('Sprite crop outside 48x48 frame')
    for yy in range(sh):
        for xx in range(sw):
            c=src[(yy*sw+xx)*4:(yy*sw+xx+1)*4]
            if c[3]: dst[((y+yy)*FRAME+x+xx)*4:((y+yy)*FRAME+x+xx+1)*4]=c
def centered(src,w,box,scale):
    sw,sh,p=crop_resize(src,w,box,scale); out=frame(); blit(out,p,sw,sh,(FRAME-sw)//2,47-sh); return out

def rank2_frames():
    w,h,src=read_png(SOURCE)
    if (w,h)!=(1263,1246): raise ValueError(f'Unexpected source atlas dimensions {(w,h)}')
    # Source crops remove the mare from every action. Krpan begins alone; the bags appear in his
    # hands in frame 2, then he winds up and releases them into flight in frame 4.
    f1=centered(src,w,(285,168,519,503),.105)
    return [f1,centered(src,w,(897,173,1148,503),.105),centered(src,w,(250,805,573,1123),.105),centered(src,w,(832,813,1243,1123),.105)]

def export_downed():
    w,h,src=read_png(DOWNED_SOURCE)
    pts=[(x,y) for y in range(h) for x in range(w) if src[(y*w+x)*4+3]>=128]
    x0=min(x for x,y in pts); x1=max(x for x,y in pts)+1; y0=min(y for x,y in pts); y1=max(y for x,y in pts)+1
    scale=.040; nw=round((x1-x0)*scale); nh=round((y1-y0)*scale); out=frame(); ox=(FRAME-nw)//2; oy=47-nh
    for y in range(nh):
        for x in range(nw):
            sx=x0+min(x1-x0-1,int((x+.5)/scale)); sy=y0+min(y1-y0-1,int((y+.5)/scale)); i=(sy*w+sx)*4; c=src[i:i+4]
            if c[3]>=128: out[((oy+y)*FRAME+ox+x)*4:((oy+y)*FRAME+ox+x+1)*4]=bytes((*nearest(c[:3]),255))
    write_png(DOWNED,FRAME,FRAME,out)
    return out

def main():
    frames=rank2_frames(); downed=export_downed(); atlas=bytearray(4*FRAME*FRAME*4)
    for n,fr in enumerate(frames):
        write_png(OUT/f'frame-{n+1:02d}.png',FRAME,FRAME,fr)
        for y in range(FRAME): atlas[(y*4*FRAME+n*FRAME)*4:(y*4*FRAME+(n+1)*FRAME)*4]=fr[y*FRAME*4:(y+1)*FRAME*4]
    write_png(ATLAS,4*FRAME,FRAME,atlas)
    wi,hi,pixels=read_png(SHEET); idx=json.loads(INDEX.read_text()); target=idx['seqs'].get('kmecka-moc-r2-salt-bag-throw',idx['seqs'].get('kmecka-moc-r2-materialize'))['row']; downedrow=idx['seqs']['downed']['row']; rowbytes=wi*FRAME*4
    for n,fr in enumerate(frames):
        for y in range(FRAME):
            di=(target*FRAME*wi+n*FRAME+y*wi)*4; pixels[di:di+FRAME*4]=fr[y*FRAME*4:(y+1)*FRAME*4]
    for y in range(FRAME):
        di=(downedrow*FRAME*wi+y*wi)*4; pixels[di:di+FRAME*4]=downed[y*FRAME*4:(y+1)*FRAME*4]
    write_png(SHEET,wi,hi,pixels)
    idx['seqs'].pop('kmecka-moc-r2-materialize',None); idx['seqs']['kmecka-moc-r2-salt-bag-throw']={'row':target,'frames':4}
    idx['seqs']={k:v for k,v in sorted(idx['seqs'].items(),key=lambda kv:kv[1]['row'])}; INDEX.write_text(json.dumps(idx,indent=1)+'\n')
    scale=4; gap=12; cw=4*FRAME*scale+3*gap; ch=FRAME*scale; bg=(25,30,42,255); preview=bytearray(bytes(bg)*(cw*ch))
    for j,fr in enumerate(frames):
        for y in range(FRAME):
            for x in range(FRAME):
                c=fr[(y*FRAME+x)*4:(y*FRAME+x+1)*4]
                if c[3]:
                    for yy in range(scale):
                        for xx in range(scale):
                            i=((y*scale+yy)*cw+(j*(FRAME*scale+gap)+x*scale+xx))*4; preview[i:i+4]=c
    write_png(PREVIEW,cw,ch,preview)
    print('Built four solo 48x48 salt-bag throw frames and re-exported the crouched downed pose at 0.040 from source, keeping its original baseline.')
if __name__=='__main__': main()
