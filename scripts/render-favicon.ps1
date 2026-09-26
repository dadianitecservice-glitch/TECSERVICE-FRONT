# Render the code-native SVG paths into transparent PNG fallbacks on Windows.
# The production build consumes the checked-in assets and does not need WPF.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName PresentationCore, WindowsBase
$faviconRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../public/assets/brand'))
[xml]$faviconSvg = Get-Content -LiteralPath (Join-Path $faviconRoot 'ts-monogram-v2.svg') -Raw
$faviconPaths = $faviconSvg.SelectNodes("//*[local-name()='path']")
foreach ($faviconSize in @(96, 180)) {
    $faviconVisual = [System.Windows.Media.DrawingVisual]::new()
    $faviconDrawing = $faviconVisual.RenderOpen()
    $faviconDrawing.PushTransform([System.Windows.Media.ScaleTransform]::new($faviconSize / 64.0, $faviconSize / 64.0))
    foreach ($faviconPath in $faviconPaths) {
        $faviconColor = [System.Windows.Media.ColorConverter]::ConvertFromString($faviconPath.GetAttribute('fill'))
        $faviconBrush = [System.Windows.Media.SolidColorBrush]::new($faviconColor)
        $faviconGeometry = [System.Windows.Media.Geometry]::Parse($faviconPath.GetAttribute('d'))
        $faviconDrawing.DrawGeometry($faviconBrush, $null, $faviconGeometry)
    }
    $faviconDrawing.Pop()
    $faviconDrawing.Close()
    $faviconBitmap = [System.Windows.Media.Imaging.RenderTargetBitmap]::new($faviconSize, $faviconSize, 96, 96, [System.Windows.Media.PixelFormats]::Pbgra32)
    $faviconBitmap.Render($faviconVisual)
    $faviconEncoder = [System.Windows.Media.Imaging.PngBitmapEncoder]::new()
    $faviconEncoder.Frames.Add([System.Windows.Media.Imaging.BitmapFrame]::Create($faviconBitmap))
    $faviconOutput = Join-Path $faviconRoot "ts-monogram-v2-$faviconSize.png"
    $faviconStream = [System.IO.File]::Open($faviconOutput, [System.IO.FileMode]::Create)
    try { $faviconEncoder.Save($faviconStream) } finally { $faviconStream.Dispose() }
    Write-Output "Rendered transparent TS icon: $faviconOutput"
}
