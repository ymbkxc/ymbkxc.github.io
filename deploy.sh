#!/usr/bin/env bash
# 一键发布博客到 GitHub Pages
# 用法: ./deploy.sh
set -e
cd "$(dirname "$0")"

echo "==> [1/3] 清理旧文件"
hexo clean

echo "==> [2/3] 生成静态文件"
hexo generate

echo "==> [3/3] 部署到 GitHub Pages（hexosub 分支）"
hexo deploy

echo ""
echo "==> 发布完成！稍等片刻即可在 https://ymbkxc.github.io/ 看到"
