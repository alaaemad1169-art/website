$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
try { $listener.Prefixes.Add("http://127.0.0.1:$port/") } catch {}
$listener.Start()
Write-Host "AgriCore server listening on http://localhost:$port/ and http://127.0.0.1:$port/"
$root = $PSScriptRoot

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        try {
            $localPath = $request.Url.LocalPath
            if ($localPath -eq "/" -or $localPath -eq "") { $localPath = "/index.html" }
            $filePath = Join-Path $root ($localPath.TrimStart('/').Replace('/', '\'))
            
            if (Test-Path $filePath -PathType Leaf) {
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                $contentType = "text/plain"
                switch ($ext) {
                    ".html" { $contentType = "text/html; charset=utf-8" }
                    ".css"  { $contentType = "text/css; charset=utf-8" }
                    ".js"   { $contentType = "application/javascript; charset=utf-8" }
                    ".json" { $contentType = "application/json; charset=utf-8" }
                    ".png"  { $contentType = "image/png" }
                    ".jpg"  { $contentType = "image/jpeg" }
                    ".jpeg" { $contentType = "image/jpeg" }
                    ".svg"  { $contentType = "image/svg+xml" }
                    ".sql"  { $contentType = "text/plain; charset=utf-8" }
                    ".ico"  { $contentType = "image/x-icon" }
                    ".webp" { $contentType = "image/webp" }
                    ".woff2" { $contentType = "font/woff2" }
                    ".woff" { $contentType = "font/woff" }
                }
                $response.ContentType = $contentType
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $response.ContentLength64 = $bytes.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
                Write-Host "200 $localPath ($contentType, $($bytes.Length) bytes)"
            } else {
                $response.StatusCode = 404
                $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
                $response.ContentLength64 = $bytes.Length
                $response.OutputStream.Write($bytes, 0, $bytes.Length)
                Write-Host "404 $localPath"
            }
        } catch {
            Write-Host "Error handling request: $_"
            try {
                $response.StatusCode = 500
                $errBytes = [System.Text.Encoding]::UTF8.GetBytes("500 Internal Server Error")
                $response.ContentLength64 = $errBytes.Length
                $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            } catch {}
        } finally {
            try { $response.OutputStream.Close() } catch {}
            try { $response.Close() } catch {}
        }
    }
} finally {
    $listener.Stop()
    Write-Host "Server stopped."
}
