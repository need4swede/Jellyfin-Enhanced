#!/usr/bin/env bash
set -euo pipefail

# Build and package Jellyfin.Plugin.JellyfinEnhanced, then print checksum

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJ="$ROOT_DIR/Jellyfin.Plugin.JellyfinEnhanced/JellyfinEnhanced.csproj"
OUT_DIR="$ROOT_DIR/dist"
PUB_DIR="$ROOT_DIR/Jellyfin.Plugin.JellyfinEnhanced/bin/Release/net8.0/publish"

echo "==> Restoring and publishing (Release)…"
dotnet publish -c Release "$PROJ"

if [[ ! -d "$PUB_DIR" ]]; then
  echo "Publish output not found: $PUB_DIR" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Extract version from csproj
VERSION=$(grep -oE '<AssemblyVersion>[0-9.]+</AssemblyVersion>' "$PROJ" | sed -E 's#</?AssemblyVersion>##g')
ZIP_BASENAME="Jellyfin.Plugin.JellyfinEnhanced"
ZIP_FILE="$OUT_DIR/${ZIP_BASENAME}.zip"
ZIP_FILE_VER="$OUT_DIR/${ZIP_BASENAME}_$VERSION.zip"

echo "==> Creating zips in $OUT_DIR"
rm -f "$ZIP_FILE" "$ZIP_FILE_VER"
(
  cd "$PUB_DIR"
  zip -qr "$ZIP_FILE" .
  cp "$ZIP_FILE" "$ZIP_FILE_VER"
)

echo "==> Calculating MD5 checksums"
if command -v md5 >/dev/null 2>&1; then
  SUM=$(md5 -q "$ZIP_FILE")
  SUM_VER=$(md5 -q "$ZIP_FILE_VER")
elif command -v md5sum >/dev/null 2>&1; then
  SUM=$(md5sum "$ZIP_FILE" | awk '{print $1}')
  SUM_VER=$(md5sum "$ZIP_FILE_VER" | awk '{print $1}')
else
  echo "No md5 or md5sum found; skipping checksum." >&2
  SUM=""; SUM_VER=""
fi

echo
echo "==> Package ready"
echo "Version:        $VERSION"
echo "Zip (no ver):   $ZIP_FILE"
echo "MD5 (no ver):   ${SUM:-<n/a>}"
echo "Zip (versioned):$ZIP_FILE_VER"
echo "MD5 (versioned):${SUM_VER:-<n/a>}"
echo
echo "Next steps:"
cat <<EOS
1) Create a GitHub release/tag in your fork (need4swede/jellyfin-enhanced), e.g.: 7.1.0.1
2) Upload one of the zip files above as a release asset.
   - Recommended name: ${ZIP_BASENAME}.zip
3) Copy the MD5 into manifest.json for the new version entry.
4) Set sourceUrl in manifest.json to:
   https://github.com/need4swede/jellyfin-enhanced/releases/download/$VERSION/${ZIP_BASENAME}.zip
5) Push manifest.json. In Jellyfin, Check for Updates and install $VERSION.
EOS

