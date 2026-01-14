# AmDb 官网

AmDb数据库系统的官方网站，域名为 getamdb.com

## 目录结构

```
website/
├── index.html          # 首页
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── main.js        # JavaScript文件
├── images/            # 图片资源
├── docs/              # 文档页面
├── downloads/         # 下载文件
└── README.md          # 说明文件
```

## 功能特性

- 响应式设计，支持移动端和桌面端
- 现代化的UI设计，参考常用数据库官网风格
- 平滑滚动和动画效果
- SEO优化
- 多语言支持准备

## 部署说明

### 本地预览

直接在浏览器中打开 `index.html` 文件即可预览。

### 部署到服务器

1. 将整个 `website` 目录上传到服务器
2. 配置域名 `getamdb.com` 指向网站目录
3. 确保服务器支持静态文件服务

### 使用静态网站托管服务

可以部署到以下服务：
- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## 自定义配置

### 修改域名

在 `index.html` 中搜索 `getamdb.com` 并替换为您的域名。

### 修改颜色主题

在 `css/style.css` 的 `:root` 变量中修改颜色值。

### 添加新页面

1. 在 `website` 目录下创建新的 HTML 文件
2. 在 `index.html` 的导航栏中添加链接
3. 使用相同的 CSS 和 JS 文件

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

与 AmDb 项目使用相同的许可证。

