Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $root 'art/source/characters/martin-krpan'
$exportRoot = Join-Path $root 'art/exports/characters/martin-krpan/animations'
$previewPath = Join-Path $root 'art/previews/characters/martin-krpan/martin-krpan-sprite-preview.png'

$sequences = @(
    @{ id = 'idle'; atlas = 'atlases/idle-4f.png'; title = 'IDLE - subtle breathing'; columns = 2; rows = 2; frames = 4; fitContent = $false },
    @{ id = 'cudgel-strike'; atlas = 'atlases/cudgel-strike-4f.png'; title = 'LIPOV KIJ - cudgel strike'; columns = 2; rows = 2; frames = 4; fitContent = $false },
    @{ id = 'double-punch'; atlas = 'atlases/double-punch-4f.png'; title = 'KMECKA MOC R1 - two punches'; columns = 2; rows = 2; frames = 4; fitContent = $false },
    @{ id = 'salt-sacks'; atlas = 'atlases/salt-sacks-4f.png'; title = 'KMECKA MOC R2 - salt sacks + mare'; columns = 2; rows = 2; frames = 4; fitContent = $false },
    @{ id = 'boulder-throw'; atlas = 'atlases/boulder-throw-4f.png'; title = 'KMECKA MOC R3 - boulder throw'; columns = 2; rows = 2; frames = 4; fitContent = $false },
    @{ id = 'mesarica-slash'; atlas = 'atlases/mesarica-slash-4f.png'; title = 'MESARICA - precise slash'; columns = 2; rows = 2; frames = 4; fitContent = $false },
    @{ id = 'running'; atlas = 'atlases/running-4f.png'; title = 'RUNNING - four-frame loop'; columns = 4; rows = 1; frames = 4; fitContent = $true },
    @{ id = 'victory'; atlas = 'atlases/victory-4f.png'; title = 'VICTORY - bare-fist salute'; columns = 4; rows = 1; frames = 4; fitContent = $true },
    @{ id = 'downed'; atlas = 'atlases/downed.png'; title = 'DOWNED - static kneel'; columns = 1; rows = 1; frames = 1; fitContent = $true }
)

$paletteHex = @(
    '1d1410','171522','24202e','393447','514b5b','756a78',
    'f2ecdc','dbcfb8','c0aa8e','e9b98f','c98f66','a76848',
    'b8322f','e24832','f0a84e','e9b93f','fff0ad',
    '3f2923','65402a','88552f','a66a35','c58b4e',
    '5e493c','7e6651','9a8061','4a382e','d9b678'
) | ForEach-Object { [System.Drawing.ColorTranslator]::FromHtml("#$_") }

function Get-NearestColor([System.Drawing.Color] $color) {
    $best = $paletteHex[0]
    $bestDistance = [double]::MaxValue
    foreach ($candidate in $paletteHex) {
        $dr = [int]$color.R - [int]$candidate.R
        $dg = [int]$color.G - [int]$candidate.G
        $db = [int]$color.B - [int]$candidate.B
        $distance = $dr * $dr + $dg * $dg + $db * $db
        if ($distance -lt $bestDistance) { $bestDistance = $distance; $best = $candidate }
    }
    return $best
}

function Export-Frame([System.Drawing.Bitmap] $atlas, [int] $column, [int] $row, [string] $path, [int] $columns, [int] $rows, [bool] $fitContent) {
    $cellWidth = [int][Math]::Floor($atlas.Width / $columns)
    $cellHeight = [int][Math]::Floor($atlas.Height / $rows)
    $source = [System.Drawing.Rectangle]::new($column * $cellWidth, $row * $cellHeight, $cellWidth, $cellHeight)
    $destination = [System.Drawing.Rectangle]::new(0, 0, 48, 48)
    if ($fitContent) {
        $minX = $source.Right; $minY = $source.Bottom; $maxX = -1; $maxY = -1
        for ($y = $source.Top; $y -lt $source.Bottom; $y++) { for ($x = $source.Left; $x -lt $source.Right; $x++) {
            if ($atlas.GetPixel($x, $y).A -ge 128) { $minX = [Math]::Min($minX, $x); $minY = [Math]::Min($minY, $y); $maxX = [Math]::Max($maxX, $x); $maxY = [Math]::Max($maxY, $y) }
        } }
        if ($maxX -lt $minX -or $maxY -lt $minY) { throw "Empty frame in $path" }
        $source = [System.Drawing.Rectangle]::new($minX, $minY, $maxX - $minX + 1, $maxY - $minY + 1)
        $scale = [Math]::Min(44.0 / $source.Width, 44.0 / $source.Height)
        $destWidth = [Math]::Max(1, [int][Math]::Round($source.Width * $scale))
        $destHeight = [Math]::Max(1, [int][Math]::Round($source.Height * $scale))
        $destination = [System.Drawing.Rectangle]::new([int][Math]::Floor((48 - $destWidth) / 2), 48 - $destHeight, $destWidth, $destHeight)
    }
    $small = [System.Drawing.Bitmap]::new(48, 48, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($small)
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::None
    $graphics.DrawImage($atlas, $destination, $source, [System.Drawing.GraphicsUnit]::Pixel)
    $graphics.Dispose()

    $maxY = -1
    for ($y = 0; $y -lt 48; $y++) { for ($x = 0; $x -lt 48; $x++) {
        $pixel = $small.GetPixel($x, $y)
        if ($pixel.A -ge 128) { $maxY = [Math]::Max($maxY, $y) }
    } }
    $shift = if ($maxY -ge 0) { 47 - $maxY } else { 0 }
    $aligned = [System.Drawing.Bitmap]::new(48, 48, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    for ($y = 0; $y -lt 48; $y++) { for ($x = 0; $x -lt 48; $x++) {
        $pixel = $small.GetPixel($x, $y)
        if ($pixel.A -lt 128 -or ($y + $shift) -ge 48) { continue }
        $nearest = Get-NearestColor $pixel
        $aligned.SetPixel($x, $y + $shift, [System.Drawing.Color]::FromArgb(255, $nearest.R, $nearest.G, $nearest.B))
    } }
    $small.Dispose()
    $folder = Split-Path -Parent $path
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
    $aligned.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $aligned.Dispose()
}

foreach ($sequence in $sequences) {
    $atlasPath = Join-Path $sourceRoot $sequence.atlas
    $atlas = [System.Drawing.Bitmap]::FromFile($atlasPath)
    try {
        for ($frame = 0; $frame -lt $sequence.frames; $frame++) {
            $column = $frame % $sequence.columns
            $row = [int][Math]::Floor($frame / $sequence.columns)
            $framePath = Join-Path (Join-Path $exportRoot $sequence.id) ('frame-{0:D2}.png' -f ($frame + 1))
            Export-Frame $atlas $column $row $framePath $sequence.columns $sequence.rows $sequence.fitContent
        }
    } finally { $atlas.Dispose() }
}

# Keep the existing game's compact 96×48 convention available: idle frame 1, then the cudgel impact frame.
$runtime = [System.Drawing.Bitmap]::new(96, 48, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($runtime)
$g.Clear([System.Drawing.Color]::Transparent)
$g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$idle = [System.Drawing.Bitmap]::FromFile((Join-Path $exportRoot 'idle/frame-01.png'))
$attack = [System.Drawing.Bitmap]::FromFile((Join-Path $exportRoot 'cudgel-strike/frame-03.png'))
$g.DrawImage($idle, 0, 0, 48, 48)
$g.DrawImage($attack, 48, 0, 48, 48)
$runtimePath = Join-Path $root 'art/exports/characters/martin-krpan/martin-krpan-v2.png'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $runtimePath) | Out-Null
$runtime.Save($runtimePath, [System.Drawing.Imaging.ImageFormat]::Png)
$idle.Dispose(); $attack.Dispose(); $g.Dispose(); $runtime.Dispose()

# Preview only: scaled frames and labels; never consumed as a production sprite sheet.
$preview = [System.Drawing.Bitmap]::new(1320, (105 + $sequences.Count * 245), [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$pg = [System.Drawing.Graphics]::FromImage($preview)
$pg.Clear([System.Drawing.Color]::FromArgb(255, 25, 30, 42))
$titleFont = [System.Drawing.Font]::new('Arial', 26, [System.Drawing.FontStyle]::Bold)
$labelFont = [System.Drawing.Font]::new('Arial', 17, [System.Drawing.FontStyle]::Bold)
$smallFont = [System.Drawing.Font]::new('Arial', 13, [System.Drawing.FontStyle]::Regular)
$gold = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 244, 205, 128))
$cream = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 238, 233, 218))
$pg.DrawString('MARTIN KRPAN - GAMEPLAY SPRITE REVIEW', $titleFont, $gold, 30, 24)
$pg.DrawString('48x48 frames - transparent - aligned baseline - art review candidate', $smallFont, $cream, 32, 61)
for ($row = 0; $row -lt $sequences.Count; $row++) {
    $sequence = $sequences[$row]
    $y = 105 + $row * 245
    $pg.DrawString($sequence.title, $labelFont, $gold, 32, $y + 24)
    for ($frame = 0; $frame -lt $sequence.frames; $frame++) {
        $bmp = [System.Drawing.Bitmap]::FromFile((Join-Path (Join-Path $exportRoot $sequence.id) ('frame-{0:D2}.png' -f ($frame + 1))))
        try { $pg.DrawImage($bmp, 340 + $frame * 220, $y, 192, 192) } finally { $bmp.Dispose() }
        $pg.DrawString(('F{0}' -f ($frame + 1)), $smallFont, $cream, 415 + $frame * 220, $y + 198)
    }
}
$pg.DrawString('Running, victory and downed are approved Krpan states; the shared roster convention remains proposed.', $smallFont, $cream, 32, ($preview.Height - 40))
$preview.Save($previewPath, [System.Drawing.Imaging.ImageFormat]::Png)
$titleFont.Dispose(); $labelFont.Dispose(); $smallFont.Dispose(); $gold.Dispose(); $cream.Dispose(); $pg.Dispose(); $preview.Dispose()

# The folk-art illustration is separate from all gameplay sprite exports.
$folkSource = Join-Path $sourceRoot 'folk-art/mare-lift.png'
$folkExport = Join-Path $root 'art/exports/characters/martin-krpan/folk-art/mare-lift.png'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $folkExport) | Out-Null
Copy-Item -LiteralPath $folkSource -Destination $folkExport -Force

Write-Output 'Exported 33 separate 48x48 frames, a 96x48 gameplay-convention sheet, and a review preview.'
