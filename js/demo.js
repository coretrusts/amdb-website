// AmDb在线演示 - Python代码编辑器和运行器

let pyodide = null;
let editor = null;
let isPyodideReady = false;

// 示例代码
const examples = {
    basic: `# AmDb 基础使用示例
from amdb import Database

# 创建数据库实例（演示模式，使用内存存储）
print("=== AmDb 基础使用示例 ===\\n")

# 注意：在线演示使用模拟实现
# 实际使用需要安装: pip install amdb

# 模拟数据库操作
print("1. 创建数据库实例...")
print("   Database(data_dir='./data/demo')")

print("\\n2. 写入数据...")
print("   db.put(b'key1', b'value1')")
print("   db.put(b'key2', b'value2')")

print("\\n3. 读取数据...")
print("   value = db.get(b'key1')")
print("   结果: b'value1'")

print("\\n4. 批量写入...")
print("   items = [(b'key3', b'value3'), (b'key4', b'value4')]")
print("   db.batch_put(items)")

print("\\n5. 刷新到磁盘...")
print("   db.flush()")

print("\\n=== 示例完成 ===")
print("\\n💡 提示：完整功能请下载桌面版或查看GitHub示例代码")`,

    batch: `# 批量写入示例
print("=== 批量写入示例 ===\\n")

print("批量写入可以显著提升性能：")
print("\\n1. 准备批量数据...")
print("   items = [")
print("       (b'key1', b'value1'),")
print("       (b'key2', b'value2'),")
print("       (b'key3', b'value3'),")
print("       # ... 更多数据")
print("   ]")

print("\\n2. 批量写入（高性能）...")
print("   success, root_hash = db.batch_put(items)")
print("   性能: 100,000+ ops/s")

print("\\n3. 同步刷新...")
print("   db.flush(force_sync=True)")

print("\\n💡 批量写入比单个写入性能高数倍！")`,

    blockchain: `# 区块链应用示例
print("=== 区块链应用示例 ===\\n")

print("1. 存储区块数据...")
print("   block_hash = b'block_001'")
print("   block_data = b'{\"height\": 1, \"transactions\": [...]}'")
print("   db.put(block_hash, block_data)")

print("\\n2. 存储账户状态...")
print("   account_key = b'account:0x1234'")
print("   account_data = b'{\"balance\": 1000, \"nonce\": 5}'")
print("   db.put(account_key, account_data)")

print("\\n3. 批量存储交易...")
print("   transactions = [")
print("       (b'tx:001', tx_data1),")
print("       (b'tx:002', tx_data2),")
print("   ]")
print("   db.batch_put(transactions)")

print("\\n4. 获取Merkle根哈希...")
print("   root_hash = db.get_root_hash()")
print("   用于区块链状态验证")

print("\\n💡 AmDb专为区块链场景优化！")`,

    version: `# 版本管理示例
print("=== 版本管理示例 ===\\n")

print("1. 获取版本历史...")
print("   history = db.version_manager.get_history(b'account:0x1234')")
print("   返回所有历史版本")

print("\\n2. 获取特定版本...")
print("   value = db.get_version(b'account:0x1234', version=5)")
print("   获取版本5的数据")

print("\\n3. 时间点查询...")
print("   state = db.get_at_time(")
print("       b'account:0x1234',")
print("       timestamp=1234567890")
print("   )")
print("   获取指定时间点的状态")

print("\\n4. 状态回滚...")
print("   db.rollback_to_version(version=10)")
print("   回滚到指定版本")

print("\\n💡 版本管理支持完整的区块链状态历史！")`
};

// 初始化CodeMirror编辑器
function initEditor() {
    editor = CodeMirror(document.getElementById('codeEditor'), {
        value: examples.basic,
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        lineWrapping: true,
        autofocus: true
    });
}

// 初始化Pyodide
async function initPyodide() {
    const outputPanel = document.getElementById('outputPanel');
    outputPanel.innerHTML = '<div class="output-line output-info">正在加载Python运行环境... <span class="loading"></span></div>';
    
    try {
        pyodide = await loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
        });
        
        // 设置输出重定向
        pyodide.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.buffer = []
    
    def write(self, text):
        self.buffer.append(text)
    
    def flush(self):
        pass
    
    def get_output(self):
        return ''.join(self.buffer)
    
    def clear(self):
        self.buffer = []

stdout_capture = OutputCapture()
stderr_capture = OutputCapture()
sys.stdout = stdout_capture
sys.stderr = stderr_capture
        `);
        
        isPyodideReady = true;
        outputPanel.innerHTML = '<div class="output-line output-success">✓ Python环境加载完成！可以运行代码了。</div>';
    } catch (error) {
        outputPanel.innerHTML = `<div class="output-line output-error">✗ 加载失败: ${error.message}</div>`;
    }
}

// 运行代码
async function runCode() {
    if (!isPyodideReady) {
        alert('Python环境尚未加载完成，请稍候...');
        return;
    }
    
    const code = editor.getValue();
    const outputPanel = document.getElementById('outputPanel');
    const runBtn = document.getElementById('runBtn');
    
    // 清空输出
    outputPanel.innerHTML = '';
    runBtn.disabled = true;
    runBtn.textContent = '运行中...';
    
    try {
        // 清空之前的输出
        pyodide.runPython('stdout_capture.clear(); stderr_capture.clear()');
        
        // 运行代码
        pyodide.runPython(code);
        
        // 获取输出
        const stdout = pyodide.runPython('stdout_capture.get_output()');
        const stderr = pyodide.runPython('stderr_capture.get_output()');
        
        // 显示输出
        if (stdout) {
            const lines = stdout.split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    const div = document.createElement('div');
                    div.className = 'output-line';
                    div.textContent = line;
                    outputPanel.appendChild(div);
                }
            });
        }
        
        if (stderr) {
            const lines = stderr.split('\n');
            lines.forEach(line => {
                if (line.trim()) {
                    const div = document.createElement('div');
                    div.className = 'output-line output-error';
                    div.textContent = line;
                    outputPanel.appendChild(div);
                }
            });
        }
        
        if (!stdout && !stderr) {
            outputPanel.innerHTML = '<div class="output-line output-info">代码执行完成（无输出）</div>';
        }
        
    } catch (error) {
        const div = document.createElement('div');
        div.className = 'output-line output-error';
        div.textContent = `错误: ${error.message}`;
        outputPanel.appendChild(div);
    } finally {
        runBtn.disabled = false;
        runBtn.textContent = '运行';
        outputPanel.scrollTop = outputPanel.scrollHeight;
    }
}

// 清空代码
function clearCode() {
    if (confirm('确定要清空代码吗？')) {
        editor.setValue('');
        editor.focus();
    }
}

// 清空输出
function clearOutput() {
    document.getElementById('outputPanel').innerHTML = '<div class="output-line output-info">等待运行代码...</div>';
}

// 加载示例
function loadExample(exampleName) {
    if (examples[exampleName]) {
        editor.setValue(examples[exampleName]);
        editor.focus();
        
        // 更新标签状态
        document.querySelectorAll('.example-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-example="${exampleName}"]`).classList.add('active');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    initPyodide();
    
    // 绑定事件
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('clearBtn').addEventListener('click', clearCode);
    document.getElementById('clearOutputBtn').addEventListener('click', clearOutput);
    
    // 示例标签
    document.querySelectorAll('.example-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            loadExample(tab.dataset.example);
        });
    });
    
    // 快捷键：Ctrl+Enter 运行
    editor.on('keydown', (cm, event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            event.preventDefault();
            runCode();
        }
    });
});

