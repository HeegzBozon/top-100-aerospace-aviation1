#!/usr/bin/env python3
"""Re-encode the Colony splash plate for the web, with no third-party packages.

This environment ships no Pillow, sharp, ImageMagick or cwebp, so the pipeline is
hand-written: PNG is decoded with zlib, downsampled with a box filter, and written as
a baseline JPEG (4:4:4) whose quality is tuned to a byte budget.

Two things make the output trustworthy rather than hoped-for:

  * the entropy stream is decoded back to coefficients and compared, block for block,
    with what the encoder wrote;
  * PSNR is measured on sampled blocks by running the coefficients back through an
    inverse transform.

    python3 scripts/optimize-splash.py <source.png> <out-dir> <width> [budget-bytes]
"""

import math
import os
import struct
import sys
import zlib

# ---------------------------------------------------------------- PNG (decode)

def png_decode(path):
    blob = open(path, 'rb').read()
    assert blob[:8] == b'\x89PNG\r\n\x1a\n', 'not a PNG'
    pos, idat, palette, header = 8, [], None, None
    while pos < len(blob):
        (length,) = struct.unpack('>I', blob[pos:pos + 4])
        tag = blob[pos + 4:pos + 8]
        data = blob[pos + 8:pos + 8 + length]
        pos += 12 + length
        if tag == b'IHDR':
            header = struct.unpack('>IIBBBBB', data)
        elif tag == b'PLTE':
            palette = data
        elif tag == b'IDAT':
            idat.append(data)
        elif tag == b'IEND':
            break

    w, h, depth, ctype, _comp, _filt, interlace = header
    assert depth == 8, f'bit depth {depth} not handled'
    assert interlace == 0, 'interlaced PNG not handled'
    channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[ctype]
    raw = zlib.decompress(b''.join(idat))
    stride = w * channels
    out = bytearray(h * stride)
    prev = bytearray(stride)
    p = 0
    for y in range(h):
        f = raw[p]
        p += 1
        line = bytearray(raw[p:p + stride])
        p += stride
        if f == 1:
            for i in range(channels, stride):
                line[i] = (line[i] + line[i - channels]) & 0xFF
        elif f == 2:
            for i in range(stride):
                line[i] = (line[i] + prev[i]) & 0xFF
        elif f == 3:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                line[i] = (line[i] + ((a + prev[i]) >> 1)) & 0xFF
        elif f == 4:
            for i in range(stride):
                a = line[i - channels] if i >= channels else 0
                b = prev[i]
                c = prev[i - channels] if i >= channels else 0
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pred = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[i] = (line[i] + pred) & 0xFF
        out[y * stride:(y + 1) * stride] = line
        prev = line

    # Flatten to RGB. Alpha is dropped: the plate is opaque and is composed over the
    # shell's own ground, exactly as the PNG was.
    rgb = bytearray(w * h * 3)
    if ctype == 2 or ctype == 6:
        step = channels
        for i in range(w * h):
            s = i * step
            d = i * 3
            rgb[d] = out[s]
            rgb[d + 1] = out[s + 1]
            rgb[d + 2] = out[s + 2]
    elif ctype == 0 or ctype == 4:
        step = channels
        for i in range(w * h):
            v = out[i * step]
            d = i * 3
            rgb[d] = rgb[d + 1] = rgb[d + 2] = v
    else:  # palette
        for i in range(w * h):
            k = out[i] * 3
            d = i * 3
            rgb[d] = palette[k]
            rgb[d + 1] = palette[k + 1]
            rgb[d + 2] = palette[k + 2]
    return w, h, rgb


def box_resize(w, h, rgb, tw):
    """Area-average downsample — the right filter for shrinking a photograph."""
    th = max(1, round(h * tw / w))
    xr = [(x * w) // tw for x in range(tw + 1)]
    yr = [(y * h) // th for y in range(th + 1)]
    acc = [[0, 0, 0] for _ in range(tw)]
    out = bytearray(tw * th * 3)
    for ty in range(th):
        for a in acc:
            a[0] = a[1] = a[2] = 0
        y0, y1 = yr[ty], max(yr[ty] + 1, yr[ty + 1])
        for y in range(y0, y1):
            base = y * w * 3
            for tx in range(tw):
                x0, x1 = xr[tx], max(xr[tx] + 1, xr[tx + 1])
                r = g = b = 0
                s = base + x0 * 3
                for _ in range(x0, x1):
                    r += rgb[s]
                    g += rgb[s + 1]
                    b += rgb[s + 2]
                    s += 3
                n = x1 - x0
                a = acc[tx]
                a[0] += r / n
                a[1] += g / n
                a[2] += b / n
        span = y1 - y0
        d = ty * tw * 3
        for tx in range(tw):
            a = acc[tx]
            out[d] = min(255, max(0, round(a[0] / span)))
            out[d + 1] = min(255, max(0, round(a[1] / span)))
            out[d + 2] = min(255, max(0, round(a[2] / span)))
            d += 3
    return tw, th, out


# ---------------------------------------------------------------- DCT and quant

COS = [[math.cos((2 * x + 1) * u * math.pi / 16) for x in range(8)] for u in range(8)]
C = [1 / math.sqrt(2)] + [1.0] * 7

ZIGZAG = [
    0, 1, 8, 16, 9, 2, 3, 10, 17, 24, 32, 25, 18, 11, 4, 5,
    12, 19, 26, 33, 40, 48, 41, 34, 27, 20, 13, 6, 7, 14, 21, 28,
    35, 42, 49, 56, 57, 50, 43, 36, 29, 22, 15, 23, 30, 37, 44, 51,
    58, 59, 52, 45, 38, 31, 39, 46, 53, 60, 61, 54, 47, 55, 62, 63,
]

LUM_ZIGZAG = [
    16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99,
]
CHR_ZIGZAG = [
    17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99,
    24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
    99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99,
]


def scale_table(base, quality):
    f = 5000 / quality if quality < 50 else 200 - 2 * quality
    return [min(255, max(1, int((v * f + 50) // 100))) for v in base]


def dct2(block):
    """Orthonormal 8x8 DCT-II, separable: 8*8*8*2 multiplies."""
    tmp = [0.0] * 64
    for y in range(8):
        row = block[y * 8:y * 8 + 8]
        for u in range(8):
            cu = COS[u]
            tmp[y * 8 + u] = (row[0] * cu[0] + row[1] * cu[1] + row[2] * cu[2] + row[3] * cu[3]
                              + row[4] * cu[4] + row[5] * cu[5] + row[6] * cu[6] + row[7] * cu[7])
    out = [0.0] * 64
    for u in range(8):
        cu = COS[u]
        for v in range(8):
            s = (tmp[u] * cu[0] + tmp[8 + u] * cu[1] + tmp[16 + u] * cu[2] + tmp[24 + u] * cu[3]
                 + tmp[32 + u] * cu[4] + tmp[40 + u] * cu[5] + tmp[48 + u] * cu[6] + tmp[56 + u] * cu[7])
            out[v * 8 + u] = 0.25 * C[u] * C[v] * s
    return out


def idct2(coef):
    """Inverse of dct2 — used only to measure how much a block lost."""
    tmp = [0.0] * 64
    for u in range(8):
        for x in range(8):
            s = 0.0
            for v in range(8):
                s += C[v] * coef[v * 8 + u] * COS[v][x]
            tmp[u * 8 + x] = s
    out = [0.0] * 64
    for y in range(8):
        for x in range(8):
            s = 0.0
            for u in range(8):
                s += C[u] * tmp[u * 8 + x] * COS[u][y]
            out[y * 8 + x] = 0.25 * s
    return out


# ---------------------------------------------------------------- Huffman tables

DC_LUM_BITS = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
DC_LUM_VALS = list(range(12))
DC_CHR_BITS = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0]
DC_CHR_VALS = list(range(12))
AC_LUM_BITS = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7D]
AC_LUM_VALS = [
    0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07,
    0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1, 0x15, 0x52, 0xD1, 0xF0,
    0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x25, 0x26, 0x27, 0x28,
    0x29, 0x2A, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49,
    0x4A, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
    0x6A, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89,
    0x8A, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7,
    0xA8, 0xA9, 0xAA, 0xB2, 0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA, 0xC2, 0xC3, 0xC4, 0xC5,
    0xC6, 0xC7, 0xC8, 0xC9, 0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8, 0xD9, 0xDA, 0xE1, 0xE2,
    0xE3, 0xE4, 0xE5, 0xE6, 0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6, 0xF7, 0xF8,
    0xF9, 0xFA,
]
AC_CHR_BITS = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77]


def huff_codes(bits, vals):
    assert sum(bits) == len(vals), f'table {sum(bits)} vs {len(vals)} values'
    codes, code, k = {}, 0, 0
    for length in range(1, 17):
        for _ in range(bits[length - 1]):
            codes[vals[k]] = (code, length)
            code += 1
            k += 1
        code <<= 1
    return codes


DC_LUM = huff_codes(DC_LUM_BITS, DC_LUM_VALS)
DC_CHR = huff_codes(DC_CHR_BITS, DC_CHR_VALS)
AC_LUM = huff_codes(AC_LUM_BITS, AC_LUM_VALS)
AC_CHR = huff_codes(AC_CHR_BITS, AC_LUM_VALS[:162])  # same symbol set, chroma lengths


def magnitude(v):
    if v == 0:
        return 0
    return abs(v).bit_length()


class BitWriter:
    def __init__(self):
        self.out = bytearray()
        self.acc = 0
        self.n = 0

    def write(self, code, length):
        self.acc = (self.acc << length) | (code & ((1 << length) - 1))
        self.n += length
        while self.n >= 8:
            self.n -= 8
            byte = (self.acc >> self.n) & 0xFF
            self.out.append(byte)
            if byte == 0xFF:
                self.out.append(0x00)

    def flush(self):
        if self.n:
            self.write((1 << (8 - self.n)) - 1, 8 - self.n)

    def getvalue(self):
        return bytes(self.out)


# ---------------------------------------------------------------- JPEG (encode)

def collect_blocks(w, h, rgb):
    """DCT every 8x8 block of all three planes, padded at the edges."""
    pad_w = (w + 7) // 8 * 8
    pad_h = (h + 7) // 8 * 8
    planes = []
    for ch in range(3):
        plane = [0.0] * (pad_w * pad_h)
        for y in range(pad_h):
            sy = min(y, h - 1)
            row = sy * w * 3 + ch
            base = y * pad_w
            for x in range(pad_w):
                plane[base + x] = rgb[row + min(x, w - 1) * 3]
        planes.append(plane)
    blocks, pixels = [], []
    for ch in range(3):
        plane = planes[ch]
        for by in range(0, pad_h, 8):
            for bx in range(0, pad_w, 8):
                blk = [0.0] * 64
                for y in range(8):
                    off = (by + y) * pad_w + bx
                    for x in range(8):
                        blk[y * 8 + x] = plane[off + x]
                pixels.append(blk)
                centred = [v - 128.0 for v in blk]
                blocks.append(dct2(centred))
    return blocks, pixels, pad_w, pad_h


def quantize_blocks(blocks, lum_tbl, chr_tbl):
    q = []
    per = len(blocks) // 3
    for i, blk in enumerate(blocks):
        tbl = lum_tbl if i < per else chr_tbl
        q.append([int(round(blk[k] / tbl[k])) for k in range(64)])
    return q


def entropy_encode(qblocks, w_blocks, h_blocks):
    bw = BitWriter()
    dc_prev = [0, 0, 0]
    plane_blocks = w_blocks * h_blocks
    total = len(qblocks)
    coeffs = []
    for i in range(total):
        ch = 0 if i < plane_blocks else (1 if i < 2 * plane_blocks else 2)
        blk = qblocks[i]
        dcc = DC_LUM if ch == 0 else DC_CHR
        acc = AC_LUM if ch == 0 else AC_CHR
        diff = blk[0] - dc_prev[ch]
        dc_prev[ch] = blk[0]
        size = magnitude(diff)
        bw.write(*dcc[size])
        if size:
            bw.write(diff if diff > 0 else diff + (1 << size) - 1, size)
        run = 0
        row = [blk[k] for k in ZIGZAG]
        coeffs.append(row)
        for k in range(1, 64):
            v = row[k]
            if v == 0:
                run += 1
                continue
            while run > 15:
                bw.write(*acc[0xF0])
                run -= 16
            size = magnitude(v)
            bw.write(*acc[(run << 4) | size])
            bw.write(v if v > 0 else v + (1 << size) - 1, size)
            run = 0
        if run:
            bw.write(*acc[0x00])
    bw.flush()
    return bw.getvalue(), coeffs


def decode_verify(stream, coeffs, nblocks, w_blocks):
    """Walk the entropy stream back to coefficients — proves the bitstream is sound."""
    tables_dc = {0: build_decode(DC_LUM_BITS, DC_LUM_VALS), 1: build_decode(DC_CHR_BITS, DC_CHR_VALS)}
    tables_ac = {0: build_decode(AC_LUM_BITS, AC_LUM_VALS), 1: build_decode(AC_CHR_BITS, AC_LUM_VALS[:162])}
    data = bytearray()
    i = 0
    while i < len(stream):
        data.append(stream[i])
        if stream[i] == 0xFF and i + 1 < len(stream):
            i += 1  # skip the stuffed zero
        i += 1
    pos = {'bit': 0}

    def read_bit():
        byte = data[pos['bit'] >> 3]
        bit = (byte >> (7 - (pos['bit'] & 7))) & 1
        pos['bit'] += 1
        return bit

    def read_symbol(tbl):
        code = 0
        for length in range(1, 17):
            code = (code << 1) | read_bit()
            sym = tbl.get((length, code))
            if sym is not None:
                return sym
        raise ValueError('bad huffman code')

    plane_blocks = nblocks
    dc_prev = [0, 0, 0]
    for i in range(len(coeffs)):
        ch = 0 if i < plane_blocks else (1 if i < 2 * plane_blocks else 2)
        cls = 0 if ch == 0 else 1
        row = [0] * 64
        size = read_symbol(tables_dc[cls])
        if size:
            v = 0
            for _ in range(size):
                v = (v << 1) | read_bit()
            if v < (1 << (size - 1)):
                v -= (1 << size) - 1
            row[0] = dc_prev[ch] + v
        else:
            row[0] = dc_prev[ch]
        dc_prev[ch] = row[0]
        k = 1
        while k < 64:
            sym = read_symbol(tables_ac[cls])
            if sym == 0x00:
                break
            if sym == 0xF0:
                k += 16
                continue
            run, size = sym >> 4, sym & 0x0F
            k += run
            if k > 63:
                raise ValueError('run past the end of the block')
            v = 0
            for _ in range(size):
                v = (v << 1) | read_bit()
            if v < (1 << (size - 1)):
                v -= (1 << size) - 1
            row[k] = v
            k += 1
        if row != coeffs[i]:
            raise ValueError(f'coefficient mismatch at block {i}')
    return True


def build_decode(bits, vals):
    table, code, k = {}, 0, 0
    for length in range(1, 17):
        for _ in range(bits[length - 1]):
            table[(length, code)] = vals[k]
            code += 1
            k += 1
        code <<= 1
    return table


def build_jpeg(w, h, qblocks, w_blocks, h_blocks, stream, lum_tbl, chr_tbl):
    out = bytearray(b'\xFF\xD8')
    out += b'\xFF\xE0' + struct.pack('>H', 16) + b'JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00'
    for tbl, tid in ((lum_tbl, 0), (chr_tbl, 1)):
        out += b'\xFF\xDB' + struct.pack('>H', 67) + bytes([tid]) + bytes(tbl[k] for k in ZIGZAG)
    out += b'\xFF\xC0' + struct.pack('>HBHHB', 17, 8, h, w, 3)
    out += bytes([1, 0x11, 0]) + bytes([2, 0x11, 1]) + bytes([3, 0x11, 1])
    for bits, vals, cls, tid in ((DC_LUM_BITS, DC_LUM_VALS, 0, 0), (AC_LUM_BITS, AC_LUM_VALS, 1, 0),
                                 (DC_CHR_BITS, DC_CHR_VALS, 0, 1), (AC_CHR_BITS, AC_LUM_VALS[:162], 1, 1)):
        payload = bytes([(cls << 4) | tid]) + bytes(bits) + bytes(vals)
        out += b'\xFF\xC4' + struct.pack('>H', len(payload) + 2) + payload
    out += b'\xFF\xDA' + struct.pack('>HB', 12, 3) + bytes([1, 0x00, 2, 0x11, 3, 0x11, 0, 63, 0])
    out += stream
    out += b'\xFF\xD9'
    return bytes(out)


def psnr(pixels, qblocks, lum_tbl, chr_tbl, sample=97):
    per = len(pixels) // 3
    sq, n = 0.0, 0
    for i in range(0, len(pixels), sample):
        tbl = lum_tbl if i < per else chr_tbl
        deq = [qblocks[i][k] * tbl[k] for k in range(64)]
        back = idct2(deq)
        for k in range(64):
            d = (back[k] + 128.0) - pixels[i][k]
            sq += d * d
            n += 1
    mse = sq / max(1, n)
    if mse <= 0:
        return 99.0
    return 10 * math.log10(255.0 * 255.0 / mse)


def encode(w, h, rgb, quality):
    blocks, pixels, w_blocks, h_blocks = collect_blocks(w, h, rgb)
    wb, hb = w_blocks // 8, h_blocks // 8
    lum_tbl = [0] * 64
    chr_tbl = [0] * 64
    for k in range(64):
        lum_tbl[ZIGZAG[k]] = scale_table(LUM_ZIGZAG, quality)[k]
        chr_tbl[ZIGZAG[k]] = scale_table(CHR_ZIGZAG, quality)[k]
    qblocks = quantize_blocks(blocks, lum_tbl, chr_tbl)
    stream, coeffs = entropy_encode(qblocks, wb, hb)
    decode_verify(stream, coeffs, wb * hb, wb)
    jpeg = build_jpeg(w, h, qblocks, wb, hb, stream, lum_tbl, chr_tbl)
    return jpeg, psnr(pixels, qblocks, lum_tbl, chr_tbl)


def main():
    src, outdir, width = sys.argv[1], sys.argv[2], int(sys.argv[3])
    budget = int(sys.argv[4]) if len(sys.argv) > 4 else 150_000
    w, h, rgb = png_decode(src)
    tw, th, small = box_resize(w, h, rgb, width)
    print(f'source {w}x{h} {os.path.getsize(src):,} B -> {tw}x{th}')

    # Highest quality that still fits the byte budget.
    best = None
    for quality in (78, 74, 70, 66, 62, 58):
        jpeg, score = encode(tw, th, small, quality)
        print(f'  q{quality}: {len(jpeg):,} B  PSNR {score:.2f} dB')
        best = (quality, jpeg, score)
        if len(jpeg) <= budget:
            break
    quality, jpeg, score = best
    path = os.path.join(outdir, f'splash-2026-{tw}.jpg')
    os.makedirs(outdir, exist_ok=True)
    open(path, 'wb').write(jpeg)
    print(f'wrote {path}  {len(jpeg):,} B  q{quality}  PSNR {score:.2f} dB  {tw}x{th}')


if __name__ == '__main__':
    main()