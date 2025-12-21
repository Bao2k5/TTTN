$publicDir = "public"

if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir
}

$images = @(
    @{url = "https://cdn.pixabay.com/photo/2016/03/27/19/33/ring-1283753_1280.jpg"; name = "ring-1.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2015/07/02/10/40/gold-829148_1280.jpg"; name = "necklace-1.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2017/08/01/00/38/jewelry-2563307_1280.jpg"; name = "earring-1.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2017/12/30/13/25/jewelry-3050206_1280.jpg"; name = "bracelet-1.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2014/11/13/06/12/boy-529067_1280.jpg"; name = "ring-2.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2015/11/03/09/03/jewelry-1019858_1280.jpg"; name = "necklace-2.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2017/03/29/04/47/jewelry-2184138_1280.jpg"; name = "earring-2.jpg" },
    @{url = "https://cdn.pixabay.com/photo/2017/11/22/19/14/beads-2971458_1280.jpg"; name = "bracelet-2.jpg" }
)

Write-Host "Downloading images from Pixabay..." -ForegroundColor Green

foreach ($img in $images) {
    $outputPath = Join-Path $publicDir $img.name
    try {
        Invoke-WebRequest -Uri $img.url -OutFile $outputPath -UseBasicParsing
        Write-Host "Downloaded: $($img.name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error downloading: $($img.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nDone! Images saved to public/ folder" -ForegroundColor Cyan
Write-Host "Total images: $($images.Count)" -ForegroundColor Cyan
