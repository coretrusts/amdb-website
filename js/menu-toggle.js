// 全局菜单切换函数（确保在所有页面都可用）
function toggleMobileMenu(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const nav = document.querySelector('.header-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    
    if (!nav || !toggle) {
        console.warn('菜单元素未找到:', { nav: !!nav, toggle: !!toggle });
        return false;
    }
    
    const isActive = nav.classList.contains('active');
    
    if (isActive) {
        // 关闭菜单
        nav.classList.remove('active');
        toggle.classList.remove('active');
        nav.style.maxHeight = '0';
        nav.style.overflow = 'hidden';
        nav.style.opacity = '0';
        nav.style.visibility = 'hidden';
    } else {
        // 打开菜单
        nav.classList.add('active');
        toggle.classList.add('active');
        const height = nav.scrollHeight || 500;
        nav.style.maxHeight = height + 'px';
        nav.style.overflow = 'visible';
        nav.style.opacity = '1';
        nav.style.visibility = 'visible';
    }
    
    console.log('菜单切换完成:', nav.classList.contains('active'));
    return true;
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM加载完成，检查菜单元素');
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.header-nav');
        if (toggle && nav) {
            console.log('菜单元素已找到，可以正常使用');
            // 确保初始状态
            if (window.innerWidth <= 768) {
                nav.style.maxHeight = '0';
                nav.style.opacity = '0';
                nav.style.visibility = 'hidden';
            }
        }
    });
} else {
    console.log('页面已加载，检查菜单元素');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.header-nav');
    if (toggle && nav) {
        console.log('菜单元素已找到');
    }
}
