#!/bin/bash
# AmDb官网部署脚本 - 部署到GitHub Pages并绑定域名getamdb.com

set -e

echo "=== AmDb官网部署脚本 ==="
echo ""

# 检查是否在website目录
if [ ! -f "index.html" ]; then
    echo "错误: 请在website目录下运行此脚本"
    exit 1
fi

# 检查git是否初始化
if [ ! -d ".git" ]; then
    echo "初始化Git仓库..."
    git init
    git branch -M main
fi

# 添加所有文件
echo "添加文件到Git..."
git add .

# 提交更改
echo "提交更改..."
git commit -m "Update website" || echo "没有更改需要提交"

# 检查远程仓库
if ! git remote | grep -q origin; then
    echo ""
    echo "请先添加GitHub远程仓库:"
    echo "  git remote add origin https://github.com/coretrusts/amdb-website.git"
    echo "  或"
    echo "  git remote add origin git@github.com:coretrusts/amdb-website.git"
    echo ""
    read -p "是否现在添加远程仓库? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "请输入GitHub仓库URL: " repo_url
        git remote add origin "$repo_url"
    else
        echo "请手动添加远程仓库后重新运行此脚本"
        exit 1
    fi
fi

# 推送到GitHub
echo "推送到GitHub..."
git push -u origin main || git push

echo ""
echo "=== 部署完成 ==="
echo ""
echo "下一步操作:"
echo "1. 在GitHub仓库设置中启用Pages功能"
echo "2. 选择main分支和/ (root) 目录"
echo "3. 在Pages设置中添加自定义域名: getamdb.com"
echo "4. 在域名DNS中添加CNAME记录:"
echo "   类型: CNAME"
echo "   名称: @ 或 www"
echo "   值: coretrusts.github.io (或您的GitHub Pages域名)"
echo ""
echo "或者使用GitHub Actions自动部署（推荐）"

