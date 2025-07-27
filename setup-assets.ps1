# PowerShell script to set up assets for Slovenian Football App
# Run this in your project root directory

Write-Host "Setting up assets for Slovenian Football App..." -ForegroundColor Green

# Create assets directory
$assetsDir = "electron\assets"
if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Force -Path $assetsDir
    Write-Host "Created directory: $assetsDir" -ForegroundColor Yellow
}

# Create a simple PNG icon using PowerShell and .NET
Add-Type -AssemblyName System.Drawing

# Create a 512x512 bitmap
$bitmap = New-Object System.Drawing.Bitmap(512, 512)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Fill background with purple
$purpleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(139, 92, 246))
$graphics.FillEllipse($purpleBrush, 16, 16, 480, 480)

# Draw white football
$whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$graphics.FillEllipse($whiteBrush, 136, 136, 240, 240)

# Draw football pattern
$blackPen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 3)

# Pentagon in center
$pentagonPoints = @(
    New-Object System.Drawing.Point(256, 200),
    New-Object System.Drawing.Point(290, 230),
    New-Object System.Drawing.Point(274, 270),
    New-Object System.Drawing.Point(238, 270),
    New-Object System.Drawing.Point(222, 230)
)
$blackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$graphics.FillPolygon($blackBrush, $pentagonPoints)

# Draw some hexagon lines
$graphics.DrawLine($blackPen, 256, 200, 222, 230)
$graphics.DrawLine($blackPen, 290, 230, 274, 270)
$graphics.DrawLine($blackPen, 238, 270, 222, 230)

# Add Slovenia flag colors at bottom
$whiteRect = New-Object System.Drawing.Rectangle(150, 400, 212, 40)
$graphics.FillRectangle($whiteBrush, $whiteRect)

$blueBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(0, 82, 204))
$blueRect = New-Object System.Drawing.Rectangle(221, 400, 70, 40)
$graphics.FillRectangle($blueBrush, $blueRect)

$redBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(204, 0, 0))
$redRect = New-Object System.Drawing.Rectangle(292, 400, 70, 40)
$graphics.FillRectangle($redBrush, $redRect)

# Save as PNG
$iconPath = "$assetsDir\icon.png"
$bitmap.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Clean up
$graphics.Dispose()
$bitmap.Dispose()
$purpleBrush.Dispose()
$whiteBrush.Dispose()
$blackBrush.Dispose()
$blueBrush.Dispose()
$redBrush.Dispose()
$blackPen.Dispose()

Write-Host "Created icon: $iconPath" -ForegroundColor Green

# Create a smaller version for taskbar/etc (256x256)
$smallBitmap = New-Object System.Drawing.Bitmap(256, 256)
$smallGraphics = [System.Drawing.Graphics]::FromImage($smallBitmap)
$smallGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Draw scaled down version
$smallPurpleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(139, 92, 246))
$smallGraphics.FillEllipse($smallPurpleBrush, 8, 8, 240, 240)

$smallWhiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$smallGraphics.FillEllipse($smallWhiteBrush, 68, 68, 120, 120)

$smallBlackBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
$smallPentagonPoints = @(
    New-Object System.Drawing.Point(128, 100),
    New-Object System.Drawing.Point(145, 115),
    New-Object System.Drawing.Point(137, 135),
    New-Object System.Drawing.Point(119, 135),
    New-Object System.Drawing.Point(111, 115)
)
$smallGraphics.FillPolygon($smallBlackBrush, $smallPentagonPoints)

$smallIconPath = "$assetsDir\icon-256.png"
$smallBitmap.Save($smallIconPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Clean up small icon resources
$smallGraphics.Dispose()
$smallBitmap.Dispose()
$smallPurpleBrush.Dispose()
$smallWhiteBrush.Dispose()
$smallBlackBrush.Dispose()

Write-Host "Created small icon: $smallIconPath" -ForegroundColor Green

# Create an ico file (Windows icon format) - simplified version
$icoPath = "$assetsDir\icon.ico"
try {
    # Try to create a simple ICO file
    Copy-Item $iconPath $icoPath
    Write-Host "Created Windows icon: $icoPath" -ForegroundColor Green
} catch {
    Write-Host "Could not create ICO file, PNG will work fine for Electron" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Assets setup complete!" -ForegroundColor Green
Write-Host "Created files:" -ForegroundColor Cyan
Write-Host "  - $iconPath (512x512 main icon)" -ForegroundColor White
Write-Host "  - $smallIconPath (256x256 small icon)" -ForegroundColor White
if (Test-Path $icoPath) {
    Write-Host "  - $icoPath (Windows icon)" -ForegroundColor White
}
Write-Host ""
Write-Host "You can now run: npm run dev" -ForegroundColor Green