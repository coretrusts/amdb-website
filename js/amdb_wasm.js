// AmDb WebAssembly版本 - JavaScript包装器
// 使用Pyodide加载和运行AmDb Python代码

class AmDbWASM {
    constructor() {
        this.pyodide = null;
        this.isReady = false;
        this.db = null;
    }

    async init() {
        if (this.isReady) return;
        
        try {
            // 加载Pyodide
            this.pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            
            // 加载AmDb WebAssembly模块
            await this.loadAmDbModule();
            
            this.isReady = true;
            return true;
        } catch (error) {
            console.error('AmDb WASM初始化失败:', error);
            throw error;
        }
    }

    async loadAmDbModule() {
        // 从GitHub加载AmDb核心代码
        const amdbCode = await this.fetchAmDbCode();
        
        // 执行AmDb代码
        this.pyodide.runPython(amdbCode);
        
        // 创建数据库类引用
        this.Database = this.pyodide.globals.get('DatabaseWASM');
    }

    async fetchAmDbCode() {
        // 方案1: 从GitHub加载
        try {
            const response = await fetch('https://raw.githubusercontent.com/coretrusts/amdb/main/build/wasm/amdb_wasm.py');
            if (response.ok) {
                return await response.text();
            }
        } catch (error) {
            console.warn('无法从GitHub加载，使用内置版本');
        }
        
        // 方案2: 使用内置的简化版本
        return `
# AmDb WebAssembly版本（简化实现）
import json
from typing import Dict, List, Tuple, Optional, Any

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
        
        import hashlib
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
        
        import hashlib
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
        `;
    }

    createDatabase(dataDir = null) {
        if (!this.isReady) {
            throw new Error('AmDb WASM尚未初始化');
        }
        
        this.db = this.Database(dataDir);
        return this.db;
    }

    // 便捷方法
    async put(key, value) {
        if (!this.db) {
            this.createDatabase();
        }
        const result = this.db.put(key, value);
        return {
            success: result[0],
            rootHash: result[1]
        };
    }

    async get(key, version = null) {
        if (!this.db) {
            this.createDatabase();
        }
        return this.db.get(key, version);
    }

    async batchPut(items) {
        if (!this.db) {
            this.createDatabase();
        }
        const result = this.db.batch_put(items);
        return {
            success: result[0],
            rootHash: result[1]
        };
    }

    async delete(key) {
        if (!this.db) {
            this.createDatabase();
        }
        return this.db.delete(key);
    }

    async getHistory(key) {
        if (!this.db) {
            this.createDatabase();
        }
        return this.db.get_history(key);
    }

    async getStats() {
        if (!this.db) {
            this.createDatabase();
        }
        return this.db.get_stats();
    }
}

// 导出全局实例
window.AmDbWASM = new AmDbWASM();

