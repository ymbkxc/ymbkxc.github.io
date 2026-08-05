#!/usr/bin/env bash
# 新建博客文章
# 用法: ./new.sh 文章标题
set -e
cd "$(dirname "$0")"

if [ -z "$1" ]; then
  echo "用法: ./new.sh 文章标题"
  echo "示例: ./new.sh 我的第一篇博客"
  exit 1
fi

hexo new "$1"
echo ""
echo "==> 已创建文章: source/_posts/$1.md"
echo "==> 编辑该文件写入正文后，运行 ./deploy.sh 发布"
