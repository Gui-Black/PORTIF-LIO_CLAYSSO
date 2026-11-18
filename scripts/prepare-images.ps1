# Creates responsive copies with Windows' built-in JPEG encoder. Originals stay untouched.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$imagesDirectory = Join-Path (Split-Path -Parent $PSScriptRoot) 'public/images'
$destination = Join-Path $imagesDirectory 'responsive'
New-Item -ItemType Directory -Path $destination -Force | Out-Null
$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }

Get-ChildItem -LiteralPath $imagesDirectory -Filter '*.jpeg' -File | ForEach-Object {
  $original = [System.Drawing.Image]::FromFile($_.FullName)
  try {
    foreach ($width in @(480, 800, 1206)) {
      $targetWidth = [Math]::Min($width, $original.Width)
      $height = [int][Math]::Round($original.Height * $targetWidth / $original.Width)
      $bitmap = [System.Drawing.Bitmap]::new($targetWidth, $height)
      $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
      $parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
      try {
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $graphics.DrawImage($original, 0, 0, $targetWidth, $height)
        $parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
          [System.Drawing.Imaging.Encoder]::Quality, [long]85)
        $output = Join-Path $destination ('{0}-{1}.jpg' -f $_.BaseName, $width)
        $bitmap.Save($output, $encoder, $parameters)
        Write-Output ('{0}: {1} bytes' -f (Split-Path -Leaf $output), (Get-Item -LiteralPath $output).Length)
      } finally {
        $parameters.Dispose()
        $graphics.Dispose()
        $bitmap.Dispose()
      }
    }
  } finally {
    $original.Dispose()
  }
}
