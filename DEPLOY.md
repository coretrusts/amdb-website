# AmDb官网部署指南

## 部署到GitHub Pages

### 方法一：使用部署脚本（推荐）

```bash
cd website
./deploy.sh
```

### 方法二：手动部署

```bash
cd website

# 初始化Git（如果未初始化）
git init
git branch -M main

# 添加文件
git add .

# 提交
git commit -m "Initial website deployment"

# 添加远程仓库
git remote add origin https://github.com/coretrusts/amdb-website.git

# 推送代码
git push -u origin main
```

## 配置GitHub Pages

1. **启用Pages功能**
   - 访问：https://github.com/coretrusts/amdb-website/settings/pages
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 "main" 和 "/ (root)"
   - 点击 "Save"

2. **配置自定义域名**
   - 在Pages设置页面，找到 "Custom domain"
   - 输入：`getamdb.com`
   - 勾选 "Enforce HTTPS"
   - 点击 "Save"
   - GitHub会自动创建/更新CNAME文件

## 配置DNS

在域名注册商（如GoDaddy、Namecheap等）配置DNS记录：

### 方法一：使用A记录（推荐）

```
类型: A
名称: @
值: 185.199.108.153
值: 185.199.109.153
值: 185.199.110.153
值: 185.199.111.153
```

### 方法二：使用CNAME记录

```
类型: CNAME
名称: @
值: coretrusts.github.io
```

**注意**：如果使用CNAME，还需要添加www子域名：
```
类型: CNAME
名称: www
值: coretrusts.github.io
```

## 验证部署

1. 等待DNS生效（通常几分钟到几小时）
2. 访问 https://getamdb.com 验证网站是否正常
3. 检查HTTPS证书是否自动配置

## 自动部署

仓库已配置GitHub Actions工作流（`.github/workflows/deploy.yml`），每次推送到main分支会自动部署。

## 更新网站

```bash
cd website
# 修改文件后
git add .
git commit -m "Update website"
git push
```

GitHub Actions会自动部署更新。

## 故障排查

1. **DNS未生效**
   - 使用 `dig getamdb.com` 或 `nslookup getamdb.com` 检查DNS记录
   - 等待DNS传播（最长48小时）

2. **HTTPS证书问题**
   - 在GitHub Pages设置中重新保存自定义域名
   - 等待证书自动生成（通常几分钟）

3. **网站无法访问**
   - 检查GitHub Pages是否已启用
   - 检查仓库设置中的Pages配置
   - 查看GitHub Actions部署日志

## 联系支持

如有问题，请在GitHub仓库提交Issue：
https://github.com/coretrusts/amdb-website/issues

