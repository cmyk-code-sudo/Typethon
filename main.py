#!/usr/bin/env python3
# tython.py
import re
import subprocess
import tempfile
import json
from pathlib import Path

class TythonCore:
    def __init__(self):
        self.vars = {}
        self.cwd = Path.cwd()
    
    def parse_blocks(self, code):
        pattern = r'<<(\w+)>>(.*?)<</\1>>'
        return re.findall(pattern, code, re.DOTALL)
    
    def execute(self, lang, code):
        executors = {
            'python': self.exec_python,
            'php': self.exec_php,
            'kotlin': self.exec_kotlin,
            'java': self.exec_java,
            'typescript': self.exec_typescript,
            'javascript': self.exec_javascript,
        }
        return executors.get(lang, self.exec_default)(code)
    
    def exec_python(self, code):
        f = tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False)
        f.write(code)
        f.close()
        result = subprocess.run(['python3', f.name], capture_output=True, text=True)
        return result.stdout, result.stderr
    
    def run(self, source):
        blocks = self.parse_blocks(source)
        for lang, code in blocks:
            out, err = self.execute(lang, code)
            if out: print(out)
            if err: print(err, file=sys.stderr)

if __name__ == '__main__':
    ty = TythonCore()
    ty.run(open(sys.argv[1]).read())
