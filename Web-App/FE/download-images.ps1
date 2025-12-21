$publicDir = "public"

if (-not (Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir
}

$images = @(
    @{url = "https://mocmienjewelry.com.vn/wp-content/uploads/2024/07/z5648913047576_8a9629c07f0de02f20ff2fab028dbf0f-300x300.jpg"; name = "nhan.jpg" },
    @{url = "https://mocmienjewelry.com.vn/wp-content/uploads/2024/07/z5648913090063_a3f1a8aa50bc05aeb27fa63f6cf5d6fc-300x300.jpg"; name = "day-chuyen.jpg" },
    @{url = "https://mocmienjewelry.com.vn/wp-content/uploads/2024/07/z5648913067590_24fcc7d1e0d94e0d20dad3ddb8c42bd8-300x300.jpg"; name = "bong-tai.jpg" },
    @{url = "https://mocmienjewelry.com.vn/wp-content/uploads/2024/07/z5648913119820_8c06fb8ac93fdcb0d7a5fea7c068b0f9-300x300.jpg"; name = "vong-tay.jpg" }
)

Write-Host "Downloading images..." -ForegroundColor Green

foreach ($img in $images) {
    $outputPath = Join-Path $publicDir $img.name
    try {
        Invoke-WebRequest -Uri $img.url -OutFile $outputPath
        Write-Host "Downloaded: $($img.name)" -ForegroundColor Green
    }
    catch {
        Write-Host "Error: $($img.name)" -ForegroundColor Red
    }
}

Write-Host "Done! Images saved to public/" -ForegroundColor Cyan
