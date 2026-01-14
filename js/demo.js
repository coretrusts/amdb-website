// AmDb在线演示 - Python代码编辑器和运行器
// 支持WebAssembly版本的AmDb

let pyodide = null;
let editor = null;
let isPyodideReady = false;
let amdbWASM = null;

// 示例代码
const examples = {
    basic: `# AmDb 基础使用示例（WebAssembly版本）
from amdb import Database

print("=== AmDb 基础使用示例 ===\\n")

# 创建数据库实例（WebAssembly版本，使用内存存储）
print("1. 创建数据库实例...")
db = Database(data_dir='./data/demo')
print("   ✓ 数据库创建成功")

print("\\n2. 写入数据...")
success, root_hash = db.put(b'key1', b'value1')
print(f"   ✓ 写入 key1: {success}, 根哈希: {root_hash.hex()[:16]}...")
db.put(b'key2', b'value2')
print("   ✓ 写入 key2")

print("\\n3. 读取数据...")
value = db.get(b'key1')
print(f"   ✓ 读取 key1: {value}")

print("\\n4. 批量写入...")
items = [(b'key3', b'value3'), (b'key4', b'value4')]
success, root_hash = db.batch_put(items)
print(f"   ✓ 批量写入成功: {success}")

print("\\n5. 获取统计信息...")
stats = db.get_stats()
print(f"   ✓ 总键数: {stats['total_keys']}")
print(f"   ✓ 当前版本: {stats['current_version']}")

print("\\n=== 示例完成 ===")
print("\\n💡 这是WebAssembly版本，数据存储在内存中")`,

    batch: `# 批量写入示例（WebAssembly版本）
from amdb import Database

print("=== 批量写入示例 ===\\n")

db = Database()

print("1. 准备批量数据...")
items = [
    (b'key1', b'value1'),
    (b'key2', b'value2'),
    (b'key3', b'value3'),
    (b'key4', b'value4'),
    (b'key5', b'value5'),
]
print(f"   ✓ 准备了 {len(items)} 条数据")

print("\\n2. 批量写入（高性能）...")
import time
start = time.time()
success, root_hash = db.batch_put(items)
elapsed = time.time() - start
print(f"   ✓ 批量写入成功: {success}")
print(f"   ✓ 耗时: {elapsed*1000:.2f}ms")
print(f"   ✓ 根哈希: {root_hash.hex()[:16]}...")

print("\\n3. 验证数据...")
for key, _ in items:
    value = db.get(key)
    print(f"   ✓ {key}: {value}")

print("\\n💡 批量写入比单个写入性能高数倍！")`,

    blockchain: `# 区块链应用示例（WebAssembly版本）
from amdb import Database
import json

print("=== 区块链应用示例 ===\\n")

db = Database(data_dir='./data/blockchain')

print("1. 存储区块数据...")
block_hash = b'block_001'
block_data = json.dumps({
    'height': 1,
    'transactions': ['tx1', 'tx2'],
    'timestamp': 1234567890
}).encode()
success, root_hash = db.put(block_hash, block_data)
print(f"   ✓ 区块存储成功: {success}")
print(f"   ✓ 根哈希: {root_hash.hex()[:16]}...")

print("\\n2. 存储账户状态...")
account_key = b'account:0x1234'
account_data = json.dumps({
    'balance': 1000,
    'nonce': 5
}).encode()
db.put(account_key, account_data)
print("   ✓ 账户状态存储成功")

print("\\n3. 批量存储交易...")
transactions = [
    (b'tx:001', json.dumps({'from': '0x1234', 'to': '0x5678', 'value': 100}).encode()),
    (b'tx:002', json.dumps({'from': '0x5678', 'to': '0x9abc', 'value': 50}).encode()),
]
success, root_hash = db.batch_put(transactions)
print(f"   ✓ 批量交易存储成功: {success}")

print("\\n4. 读取区块数据...")
block = db.get(block_hash)
if block:
    block_json = json.loads(block.decode())
    print(f"   ✓ 区块高度: {block_json['height']}")
    print(f"   ✓ 交易数: {len(block_json['transactions'])}")

print("\\n💡 AmDb专为区块链场景优化！")`,

    version: `# 版本管理示例（WebAssembly版本）
from amdb import Database

print("=== 版本管理示例 ===\\n")

db = Database()

print("1. 写入多个版本...")
key = b'account:0x1234'
db.put(key, b'balance:100')  # 版本1
db.put(key, b'balance:200')  # 版本2
db.put(key, b'balance:300')  # 版本3
print("   ✓ 已创建3个版本")

print("\\n2. 获取版本历史...")
history = db.get_history(key)
print(f"   ✓ 版本历史数量: {len(history)}")
for h in history:
    print(f"     版本 {h['version']}: {h['value']}")

print("\\n3. 读取特定版本...")
value_v1 = db.get(key, version=1)
value_v2 = db.get(key, version=2)
value_current = db.get(key)
print(f"   ✓ 版本1: {value_v1}")
print(f"   ✓ 版本2: {value_v2}")
print(f"   ✓ 当前版本: {value_current}")

print("\\n4. 获取统计信息...")
stats = db.get_stats()
print(f"   ✓ 当前版本号: {stats['current_version']}")
print(f"   ✓ 总键数: {stats['total_keys']}")

print("\\n💡 版本管理支持完整的区块链状态历史！")`
};

// 初始化CodeMirror编辑器
function initEditor() {
    const editorElement = document.getElementById('codeEditor');
    if (!editorElement) {
        console.error('Code editor element not found');
        return;
    }
    
    editor = CodeMirror(editorElement, {
        value: examples.basic,
        mode: 'python',
        theme: 'monokai',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        lineWrapping: true,
        autofocus: true,
        // 配置以改善性能警告
        inputStyle: 'contenteditable',
        spellcheck: false
    });
    
    // 尝试修复被动事件监听器警告（CodeMirror内部问题，只能缓解）
    try {
        const wrapper = editor.getWrapperElement();
        if (wrapper) {
            // 为触摸事件添加被动监听器
            ['touchstart', 'touchmove'].forEach(eventType => {
                wrapper.addEventListener(eventType, () => {}, { passive: true });
            });
        }
    } catch (e) {
        // 忽略错误
    }
}

// 初始化Pyodide和AmDb WASM
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
        
        // 加载AmDb WebAssembly模块
        outputPanel.innerHTML = '<div class="output-line output-info">正在加载AmDb数据库模块... <span class="loading"></span></div>';
        await loadAmDbWASM();
        
        isPyodideReady = true;
        outputPanel.innerHTML = '<div class="output-line output-success">✓ Python环境和AmDb模块加载完成！可以运行代码了。</div>';
    } catch (error) {
        outputPanel.innerHTML = `<div class="output-line output-error">✗ 加载失败: ${error.message}</div>`;
    }
}

// 加载AmDb WebAssembly模块
async function loadAmDbWASM() {
    try {
        // 从GitHub加载AmDb WASM代码
        const response = await fetch('https://raw.githubusercontent.com/coretrusts/amdb/main/build/wasm/amdb_wasm.py');
        let amdbCode;
        
        if (response.ok) {
            amdbCode = await response.text();
        } else {
            // 使用内置版本
            amdbCode = `
# AmDb WebAssembly版本（简化实现）
import json
import hashlib

class DatabaseWASM:
    """AmDb数据库的WebAssembly版本（内存实现）"""
    
    def __init__(self, data_dir=None):
        self.data = {}
        self.versions = {}
        self.current_version = 0
        
    def put(self, key, value):
        """写入键值对"""
        key_bytes = key if isinstance(key, bytes) else key.encode()
        value_bytes = value if isinstance(value, bytes) else value.encode()
        
        self.data[key_bytes] = value_bytes
        self.current_version += 1
        
        if key_bytes not in self.versions:
            self.versions[key_bytes] = []
        self.versions[key_bytes].append({
            'version': self.current_version,
            'value': value_bytes,
            'timestamp': 0
        })
        
        root_hash = hashlib.sha256(f"{key_bytes}:{value_bytes}".encode()).digest()
        return True, root_hash
    
    def get(self, key, version=None):
        """读取键值"""
        key_bytes = key if isinstance(key, bytes) else key.encode()
        
        if version is not None:
            if key_bytes in self.versions:
                for v in reversed(self.versions[key_bytes]):
                    if v['version'] <= version:
                        return v['value']
            return None
        return self.data.get(key_bytes)
    
    def batch_put(self, items):
        """批量写入"""
        for key, value in items:
            self.put(key, value)
        
        combined = b''.join([(k if isinstance(k, bytes) else k.encode()) + 
                            (v if isinstance(v, bytes) else v.encode()) 
                            for k, v in items])
        root_hash = hashlib.sha256(combined).digest()
        return True, root_hash
    
    def delete(self, key):
        """删除键"""
        key_bytes = key if isinstance(key, bytes) else key.encode()
        if key_bytes in self.data:
            self.data[key_bytes] = b'__DELETED__'
            return True
        return False
    
    def flush(self, force_sync=False):
        """刷新"""
        return True
    
    def get_history(self, key):
        """获取版本历史"""
        key_bytes = key if isinstance(key, bytes) else key.encode()
        return self.versions.get(key_bytes, [])
    
    def get_stats(self):
        """获取统计信息"""
        return {
            'total_keys': len(self.data),
            'current_version': self.current_version,
            'merkle_root': b'0' * 32
        }

# 创建别名以便兼容
Database = DatabaseWASM
            `;
        }
        
        // 执行AmDb代码
        pyodide.runPython(amdbCode);
        
        // 创建amdb模块和Database引用
        pyodide.runPython(`
# 创建amdb模块
import sys
import types

# 创建amdb模块
amdb_module = types.ModuleType('amdb')
amdb_module.DatabaseWASM = DatabaseWASM
amdb_module.Database = DatabaseWASM
amdb_module.__all__ = ['DatabaseWASM', 'Database']
sys.modules['amdb'] = amdb_module

# 为了兼容性，创建全局Database引用
Database = DatabaseWASM

# 验证模块创建成功
assert 'amdb' in sys.modules
assert hasattr(sys.modules['amdb'], 'Database')
        `);
        
    } catch (error) {
        console.warn('加载AmDb WASM失败，使用模拟实现:', error);
        // 创建模拟的Database类和amdb模块
        pyodide.runPython(`
import sys
import types

class Database:
    def __init__(self, data_dir=None):
        self.data = {}
        self.versions = {}
        self.current_version = 0
    
    def put(self, key, value):
        key_bytes = key if isinstance(key, bytes) else key.encode()
        value_bytes = value if isinstance(value, bytes) else value.encode()
        self.data[key_bytes] = value_bytes
        self.current_version += 1
        return True, b'0' * 32
    
    def get(self, key, version=None):
        key_bytes = key if isinstance(key, bytes) else key.encode()
        return self.data.get(key_bytes)
    
    def batch_put(self, items):
        for k, v in items:
            self.put(k, v)
        return True, b'0' * 32
    
    def flush(self, force_sync=False):
        return True
    
    def get_history(self, key):
        key_bytes = key if isinstance(key, bytes) else key.encode()
        return self.versions.get(key_bytes, [])
    
    def get_stats(self):
        return {
            'total_keys': len(self.data),
            'current_version': self.current_version,
            'merkle_root': b'0' * 32
        }

# 创建amdb模块
amdb_module = types.ModuleType('amdb')
amdb_module.Database = Database
amdb_module.DatabaseWASM = Database
amdb_module.__all__ = ['Database', 'DatabaseWASM']
sys.modules['amdb'] = amdb_module
        `);
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

