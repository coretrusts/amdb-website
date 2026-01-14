// 移动端兼容性脚本

(function() {
    'use strict';
    
    // 检测移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 添加移动端类名
    if (isMobile) {
        document.documentElement.classList.add('is-mobile');
    }
    
    if (isTouch) {
        document.documentElement.classList.add('is-touch');
    }
    
    // 移动端菜单切换
    function initMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('.header-nav');
        const navList = document.querySelector('.nav-list');
        
        if (!toggle || !nav) return;
        
        // 确保菜单初始状态是隐藏的
        if (window.innerWidth <= 768) {
            nav.style.maxHeight = '0';
        }
        
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            nav.classList.toggle('active');
            toggle.classList.toggle('active');
            
            if (nav.classList.contains('active')) {
                nav.style.maxHeight = nav.scrollHeight + 'px';
            } else {
                nav.style.maxHeight = '0';
            }
        });
        
        // 点击菜单项后关闭菜单
        if (navList) {
            navList.addEventListener('click', function(e) {
                if (e.target.classList.contains('nav-link') && window.innerWidth <= 768) {
                    nav.classList.remove('active');
                    toggle.classList.remove('active');
                    nav.style.maxHeight = '0';
                }
            });
        }
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && 
                nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !toggle.contains(e.target)) {
                nav.classList.remove('active');
                toggle.classList.remove('active');
                nav.style.maxHeight = '0';
            }
        });
        
        // 窗口大小改变时调整菜单
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768) {
                    nav.classList.remove('active');
                    toggle.classList.remove('active');
                    nav.style.maxHeight = '';
                } else {
                    if (!nav.classList.contains('active')) {
                        nav.style.maxHeight = '0';
                    }
                }
            }, 250);
        });
    }
    
    // 优化触摸滚动
    function optimizeTouchScroll() {
        if (!isTouch) return;
        
        // 为可滚动容器添加平滑滚动
        const scrollableElements = document.querySelectorAll('.output-panel, .code-editor, pre, code');
        scrollableElements.forEach(function(el) {
            el.style.webkitOverflowScrolling = 'touch';
            el.style.overflowScrolling = 'touch';
        });
    }
    
    // 优化CodeMirror在移动端的显示
    function optimizeCodeMirror() {
        if (!window.CodeMirror || !isMobile) return;
        
        // 等待CodeMirror初始化
        setTimeout(function() {
            const editors = document.querySelectorAll('.CodeMirror');
            editors.forEach(function(editor) {
                const cm = editor.CodeMirror;
                if (cm) {
                    // 禁用移动端的某些功能以提高性能
                    cm.setOption('lineWrapping', true);
                    cm.setOption('scrollbarStyle', 'native');
                    
                    // 优化触摸事件
                    const wrapper = cm.getWrapperElement();
                    if (wrapper) {
                        wrapper.style.touchAction = 'pan-y';
                    }
                }
            });
        }, 1000);
    }
    
    // 防止双击缩放
    function preventDoubleTapZoom() {
        if (!isTouch) return;
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(event) {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    // 优化表单输入
    function optimizeFormInputs() {
        if (!isMobile) return;
        
        const inputs = document.querySelectorAll('input, textarea, select');
        inputs.forEach(function(input) {
            // 防止iOS自动缩放
            if (input.type === 'text' || input.type === 'email' || input.type === 'search') {
                input.style.fontSize = '16px';
            }
        });
    }
    
    // 初始化所有移动端功能
    function init() {
        initMobileMenu();
        optimizeTouchScroll();
        optimizeCodeMirror();
        preventDoubleTapZoom();
        optimizeFormInputs();
        
        // 添加加载完成标记
        document.documentElement.classList.add('mobile-ready');
    }
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 监听CodeMirror初始化（用于演示页面）
    if (window.initEditor) {
        const originalInitEditor = window.initEditor;
        window.initEditor = function() {
            originalInitEditor();
            setTimeout(optimizeCodeMirror, 500);
        };
    }
})();

