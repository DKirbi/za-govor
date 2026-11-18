#!/usr/bin/env python3
"""Export Martin Krpan's approved running, victory and downed sprite states.

Uses only Python's standard library so the approved source atlases can be
re-exported without adding an image-processing dependency.
"""
from pathlib import Path
import struct
import zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "art/source/characters/martin-krpan/atlases"
EXPORT = ROOT / "art/exports/characters/martin-krpan/animations"
PREVIEW = ROOT / "art/previews/characters/martin-krpan/martin-krpan-sprite-preview.png"

PALETTE = [
    "1d1410", "171522", "24202e", "393447", "514b5b", "756a78",
    "f2ecdc", "dbcfb8", "c0aa8e", "e9b98f", "c98f66", "a76848",
    "b8322f", "e24832", "f0a84e", "e9b93f", "fff0ad", "3f2923",
    "65402a", "88552f", "a66a35", "c58b4e", "5e493c", "7e6651",
    "9a8061", "4a382e", "d9b678",
]
PALETTE = [tuple(bytes.fromhex(c)) for c in PALETTE]


def png_read(path):
    data = path.read_bytes()
    if data[:8] != b"\x89PNG\r\n\x1a\n":
        raise ValueError(f"Not a PNG: {path}")
    pos, chunks, width, height, bit_depth, color_type, interlace = 8, [], None, None, None, None, None
    while pos < len(data):
        length = struct.unpack(">I", data[pos:pos + 4])[0]
        kind = data[pos + 4:pos + 8]
        chunk = data[pos + 8:pos + 8 + length]
        pos += length + 12
        if kind == b"IHDR":
            width, height, bit_depth, color_type, comp, filt, interlace = struct.unpack(">IIBBBBB", chunk)
        elif kind == b"IDAT":
            chunks.append(chunk)
        elif kind == b"IEND":
            break
    if bit_depth != 8 or color_type != 6 or interlace != 0:
        raise ValueError(f"Expected non-interlaced 8-bit RGBA PNG, got {bit_depth}/{color_type}/{interlace}: {path}")
    raw = zlib.decompress(b"".join(chunks))
    stride, offset, previous = width * 4, 0, bytearray(width * 4)
    pixels = bytearray(height * stride)
    for y in range(height):
        mode = raw[offset]
        offset += 1
        row = bytearray(raw[offset:offset + stride])
        offset += stride
        for i in range(stride):
            left = row[i - 4] if i >= 4 else 0
            up = previous[i]
            upper_left = previous[i - 4] if i >= 4 else 0
            if mode == 1:
                row[i] = (row[i] + left) & 255
            elif mode == 2:
                row[i] = (row[i] + up) & 255
            elif mode == 3:
                row[i] = (row[i] + ((left + up) // 2)) & 255
            elif mode == 4:
                p = left + up - upper_left
                pa, pb, pc = abs(p - left), abs(p - up), abs(p - upper_left)
                predictor = left if pa <= pb and pa <= pc else up if pb <= pc else upper_left
                row[i] = (row[i] + predictor) & 255
            elif mode != 0:
                raise ValueError(f"Unsupported PNG filter {mode}: {path}")
        pixels[y * stride:(y + 1) * stride] = row
        previous = row
    return width, height, pixels


def png_write(path, width, height, pixels):
    def chunk(kind, payload):
        return struct.pack(">I", len(payload)) + kind + payload + struct.pack(">I", zlib.crc32(kind + payload) & 0xffffffff)
    raw = b"".join(b"\0" + pixels[y * width * 4:(y + 1) * width * 4] for y in range(height))
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
           + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)


def bounds(pixels, width, height):
    xs, ys = [], []
    for y in range(height):
        for x in range(width):
            if pixels[(y * width + x) * 4 + 3] >= 128:
                xs.append(x)
                ys.append(y)
    if not xs:
        raise ValueError("Source frame is fully transparent")
    return min(xs), min(ys), max(xs) + 1, max(ys) + 1


def nearest_color(rgb):
    return min(PALETTE, key=lambda c: sum((rgb[i] - c[i]) ** 2 for i in range(3)))


def export_cell(src, cell, output):
    sw, sh, pixels = src
    x0, y0, x1, y1 = cell
    cw, ch = x1 - x0, y1 - y0
    bx0, by0, bx1, by1 = bounds(pixels, sw, sh)
    # Restrict transparency scan to this cell and find its opaque bounds.
    bx0, by0, bx1, by1 = max(bx0, x0), max(by0, y0), min(bx1, x1), min(by1, y1)
    local = []
    for y in range(by0, by1):
        for x in range(bx0, bx1):
            if pixels[(y * sw + x) * 4 + 3] >= 128:
                local.append((x, y))
    if not local:
        raise ValueError(f"Frame is empty: {output}")
    ax0, ax1 = min(x for x, _ in local), max(x for x, _ in local) + 1
    ay0, ay1 = min(y for _, y in local), max(y for _, y in local) + 1
    art_w, art_h = ax1 - ax0, ay1 - ay0
    scale = min(44 / art_w, 44 / art_h)
    out_w, out_h = max(1, round(art_w * scale)), max(1, round(art_h * scale))
    ox, oy = (48 - out_w) // 2, 47 - out_h + 1
    frame = bytearray(48 * 48 * 4)
    for dy in range(out_h):
        sy = ay0 + min(art_h - 1, int(dy / scale))
        for dx in range(out_w):
            sx = ax0 + min(art_w - 1, int(dx / scale))
            index = (sy * sw + sx) * 4
            if pixels[index + 3] < 128:
                continue
            color = nearest_color(pixels[index:index + 3])
            target = ((oy + dy) * 48 + ox + dx) * 4
            frame[target:target + 4] = bytes((*color, 255))
    png_write(output, 48, 48, frame)


def frame_rects(path, cols, rows):
    src = png_read(path)
    w, h, _ = src
    cw, ch = w // cols, h // rows
    return src, [(c * cw, r * ch, (c + 1) * cw, (r + 1) * ch)
                 for r in range(rows) for c in range(cols)]


def add_glyph(canvas, canvas_w, x, y, glyph, scale, color):
    font = {
        "A": ("01110", "10001", "10001", "11111", "10001", "10001", "10001"),
        "B": ("11110", "10001", "10001", "11110", "10001", "10001", "11110"),
        "C": ("01111", "10000", "10000", "10000", "10000", "10000", "01111"),
        "D": ("11110", "10001", "10001", "10001", "10001", "10001", "11110"),
        "E": ("11111", "10000", "10000", "11110", "10000", "10000", "11111"),
        "F": ("11111", "10000", "10000", "11110", "10000", "10000", "10000"),
        "G": ("01111", "10000", "10000", "10111", "10001", "10001", "01111"),
        "H": ("10001", "10001", "10001", "11111", "10001", "10001", "10001"),
        "I": ("11111", "00100", "00100", "00100", "00100", "00100", "11111"),
        "J": ("00111", "00010", "00010", "00010", "10010", "10010", "01100"),
        "K": ("10001", "10010", "10100", "11000", "10100", "10010", "10001"),
        "L": ("10000", "10000", "10000", "10000", "10000", "10000", "11111"),
        "M": ("10001", "11011", "10101", "10101", "10001", "10001", "10001"),
        "N": ("10001", "11001", "10101", "10011", "10001", "10001", "10001"),
        "O": ("01110", "10001", "10001", "10001", "10001", "10001", "01110"),
        "P": ("11110", "10001", "10001", "11110", "10000", "10000", "10000"),
        "Q": ("01110", "10001", "10001", "10001", "10101", "10010", "01101"),
        "R": ("11110", "10001", "10001", "11110", "10100", "10010", "10001"),
        "S": ("01111", "10000", "10000", "01110", "00001", "00001", "11110"),
        "T": ("11111", "00100", "00100", "00100", "00100", "00100", "00100"),
        "U": ("10001", "10001", "10001", "10001", "10001", "10001", "01110"),
        "V": ("10001", "10001", "10001", "10001", "10001", "01010", "00100"),
        "W": ("10001", "10001", "10001", "10101", "10101", "10101", "01010"),
        "X": ("10001", "10001", "01010", "00100", "01010", "10001", "10001"),
        "Y": ("10001", "10001", "01010", "00100", "00100", "00100", "00100"),
        "Z": ("11111", "00001", "00010", "00100", "01000", "10000", "11111"),
        "0": ("01110", "10001", "10011", "10101", "11001", "10001", "01110"),
        "1": ("00100", "01100", "00100", "00100", "00100", "00100", "01110"),
        "2": ("01110", "10001", "00001", "00010", "00100", "01000", "11111"),
        "3": ("11110", "00001", "00001", "01110", "00001", "00001", "11110"),
        "4": ("00010", "00110", "01010", "10010", "11111", "00010", "00010"),
        "8": ("01110", "10001", "10001", "01110", "10001", "10001", "01110"),
        "-": ("00000", "00000", "00000", "11111", "00000", "00000", "00000"),
        ":": ("00000", "00100", "00100", "00000", "00100", "00100", "00000"),
        "!": ("00100", "00100", "00100", "00100", "00100", "00000", "00100"),
        " ": ("00000",) * 7,
    }.get(glyph, ("00000",) * 7)
    for gy, line in enumerate(font):
        for gx, bit in enumerate(line):
            if bit == "1":
                for yy in range(scale):
                    for xx in range(scale):
                        p = ((y + gy * scale + yy) * canvas_w + x + gx * scale + xx) * 4
                        canvas[p:p + 4] = bytes((*color, 255))


def draw_text(canvas, width, x, y, text, scale, color):
    step = 6 * scale
    for char in text.upper():
        add_glyph(canvas, width, x, y, char, scale, color)
        x += step


def draw_image(canvas, cw, ch, src, x, y, target_size):
    sw, sh, pixels = src
    for dy in range(target_size):
        sy = min(sh - 1, int(dy * sh / target_size))
        for dx in range(target_size):
            sx = min(sw - 1, int(dx * sw / target_size))
            i = (sy * sw + sx) * 4
            if pixels[i + 3] == 0:
                continue
            j = ((y + dy) * cw + x + dx) * 4
            canvas[j:j + 4] = pixels[i:i + 4]


def make_preview():
    states = [
        ("IDLE: SUBTLE BREATHING", "idle", 4),
        ("LIPOV KIJ: CUDGEL STRIKE", "cudgel-strike", 4),
        ("KMECKA MOC R1: TWO PUNCHES", "double-punch", 4),
        ("KMECKA MOC R2: SALT SACKS + MARE", "salt-sacks", 4),
        ("KMECKA MOC R3: BOULDER THROW", "boulder-throw", 4),
        ("MESARICA: PRECISE SLASH", "mesarica-slash", 4),
        ("RUNNING: FOUR-FRAME LOOP", "running", 4),
        ("VICTORY: BARE-FIST SALUTE", "victory", 4),
        ("DOWNED: STATIC KNEEL", "downed", 1),
    ]
    width, height, row_h = 1320, 105 + len(states) * 260, 260
    bg = (25, 30, 42, 255)
    canvas = bytearray(bytes(bg) * (width * height))
    gold, cream = (244, 205, 128), (238, 233, 218)
    draw_text(canvas, width, 30, 24, "MARTIN KRPAN - GAMEPLAY SPRITE REVIEW", 3, gold)
    draw_text(canvas, width, 32, 55, "48X48 RGBA - TRANSPARENT - BASELINE ROW 47", 2, cream)
    for row, (title, sequence, count) in enumerate(states):
        y = 105 + row * row_h
        draw_text(canvas, width, 32, y + 20, title, 3, gold)
        for frame in range(count):
            path = EXPORT / sequence / f"frame-{frame + 1:02d}.png"
            source = png_read(path)
            draw_image(canvas, width, height, source, 340 + frame * 220, y + 50, 188)
            draw_text(canvas, width, 415 + frame * 220, y + 242, f"F{frame + 1}", 2, cream)
    png_write(PREVIEW, width, height, canvas)


def validate_exports():
    expected = {"running": 4, "victory": 4, "downed": 1}
    for sequence, count in expected.items():
        for frame_no in range(1, count + 1):
            path = EXPORT / sequence / f"frame-{frame_no:02d}.png"
            width, height, pixels = png_read(path)
            if (width, height) != (48, 48):
                raise ValueError(f"Wrong dimensions: {path} is {width}x{height}")
            alpha = pixels[3::4]
            if not (0 in alpha and 255 in alpha) or any(a not in (0, 255) for a in alpha):
                raise ValueError(f"Expected genuine binary transparency: {path}")
            opaque_y = [i // 48 for i, a in enumerate(alpha) if a == 255]
            if not opaque_y or max(opaque_y) != 47:
                raise ValueError(f"Baseline is not row 47: {path}")
            colors = {tuple(pixels[i * 4:i * 4 + 3]) for i, a in enumerate(alpha) if a == 255}
            if len(colors) > len(PALETTE):
                raise ValueError(f"Palette has {len(colors)} colors: {path}")
            print(f"Validated {path.relative_to(ROOT)}: 48x48 RGBA, {len(colors)} colors, baseline 47")


def main():
    layouts = [
        ("running", "running-4f.png", 4, 1, 4),
        ("victory", "victory-4f.png", 4, 1, 4),
        ("downed", "downed.png", 1, 1, 1),
    ]
    for sequence, filename, cols, rows, count in layouts:
        src, cells = frame_rects(SOURCE / filename, cols, rows)
        for i in range(count):
            output = EXPORT / sequence / f"frame-{i + 1:02d}.png"
            export_cell(src, cells[i], output)
            print(f"{output.relative_to(ROOT)}")
    make_preview()
    validate_exports()
    print(f"Updated {PREVIEW.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
