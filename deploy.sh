#!/bin/bash
# 部署:先清理旧的 hash 产物(避免历次部署的旧 chunk 堆积),再拷贝最新 dist
# 保留与 dist 无关的历史文件(如 _index.html)

set -e

HTML_DIR=/usr/share/nginx/html
DIST_DIR=/opt/starlink-dashboard/dist

# 仅删除由 vite 产物生成的文件/目录
sudo rm -rf "$HTML_DIR/assets" "$HTML_DIR/index.html" "$HTML_DIR/favicon.png"

sudo cp -rf "$DIST_DIR"/. "$HTML_DIR"/

echo "部署完成: $(ls "$HTML_DIR"/assets | wc -l) 个 asset 文件"
