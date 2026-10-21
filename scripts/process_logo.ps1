Add-Type -AssemblyName System.Drawing

$src = "C:\Users\SRI SAKTHI\.gemini\antigravity-ide\brain\cfc676bb-af82-4f50-8350-cf340a8749e1\.user_uploaded\media_1792583950937.png"
$outDir = "w:\DOCUMENT\in&out\finScore\public"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}
$dst = "$outDir\logo.png"

$orig = [System.Drawing.Bitmap]::FromFile($src)
$w = $orig.Width
$h = $orig.Height
Write-Host "Original dimensions: $w x $h"

# Create new 32-bit ARGB bitmap
$bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# Bounding box coordinates for trimming
$minX = $w
$maxX = 0
$minY = $h
$maxY = 0

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $orig.GetPixel($x, $y)
        # Check if pixel is white / near white (background)
        # RGB brightness
        $brightness = [Math]::Min([Math]::Min($c.R, $c.G), $c.B)
        $diff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.R - $c.B), [Math]::Abs($c.G - $c.B)))
        
        # If very light grey/white and low saturation
        if ($c.R -gt 238 -and $c.G -gt 238 -and $c.B -gt 238 -and $diff -lt 15) {
            # Fully transparent
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } elseif ($c.R -gt 220 -and $c.G -gt 220 -and $c.B -gt 220 -and $diff -lt 15) {
            # Smooth anti-aliasing edge alpha
            $avg = ($c.R + $c.G + $c.B) / 3.0
            $alpha = [int]([Math]::Max(0, [Math]::Min(255, (240 - $avg) / 20.0 * 255)))
            $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $c.R, $c.G, $c.B))
            if ($alpha -gt 20) {
                if ($x -lt $minX) { $minX = $x }
                if ($x -gt $maxX) { $maxX = $x }
                if ($y -lt $minY) { $minY = $y }
                if ($y -gt $maxY) { $maxY = $y }
            }
        } else {
            $bmp.SetPixel($x, $y, $c)
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$orig.Dispose()

# Now crop to bounding box + small padding
$pad = 12
$cropX = [Math]::Max(0, $minX - $pad)
$cropY = [Math]::Max(0, $minY - $pad)
$cropW = [Math]::Min($w - $cropX, ($maxX - $minX) + ($pad * 2))
$cropH = [Math]::Min($h - $cropY, ($maxY - $minY) + ($pad * 2))

Write-Host "Cropping to: $cropX, $cropY, $cropW x $cropH"

$rect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$croppedBmp = $bmp.Clone($rect, $bmp.PixelFormat)
$bmp.Dispose()

# Save as PNG
$croppedBmp.Save($dst, [System.Drawing.Imaging.ImageFormat]::Png)
$croppedBmp.Dispose()

Write-Host "Saved transparent logo to $dst"
