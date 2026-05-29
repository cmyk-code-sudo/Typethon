const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class TythonExecutor {
    constructor() {
        this.variables = {};
        this.tempDir = path.join(process.cwd(), '.tython_temp');
        if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir);
    }
    
    parseBlocks(source) {
        const regex = /<<(\w+)>>(.*?)<</\1>>/gs;
        const blocks = [];
        let match;
        while ((match = regex.exec(source)) !== null) {
            blocks.push({ lang: match[1], code: match[2] });
        }
        return blocks;
    }
    
    async executeBlock(lang, code) {
        const executors = {
            'python': () => this.runPython(code),
            'php': () => this.runPHP(code),
            'kotlin': () => this.runKotlin(code),
            'java': () => this.runJava(code),
            'javascript': () => this.runNode(code),
            'typescript': () => this.runTypeScript(code),
            'json': () => this.parseJSON(code),
            'xml': () => this.parseXML(code),
            'yaml': () => this.parseYAML(code)
        };
        
        const executor = executors[lang];
        if (executor) return await executor();
        return { output: '', error: `Unsupported: ${lang}` };
    }
    
    runPython(code) {
        const tempFile = path.join(this.tempDir, `tython_${Date.now()}.py`);
        fs.writeFileSync(tempFile, code);
        try {
            const output = execSync(`python3 ${tempFile}`, { encoding: 'utf-8' });
            return { output, error: '' };
        } catch (err) {
            return { output: '', error: err.stderr };
        } finally {
            fs.unlinkSync(tempFile);
        }
    }
    
    runPHP(code) {
        const tempFile = path.join(this.tempDir, `tython_${Date.now()}.php`);
        fs.writeFileSync(tempFile, `<?php\n${code}`);
        try {
            const output = execSync(`php ${tempFile}`, { encoding: 'utf-8' });
            return { output, error: '' };
        } catch (err) {
            return { output: '', error: err.stderr };
        } finally {
            fs.unlinkSync(tempFile);
        }
    }
    
    runKotlin(code) {
        const tempFile = path.join(this.tempDir, `Tython_${Date.now()}.kt`);
        fs.writeFileSync(tempFile, code);
        try {
            execSync(`kotlinc ${tempFile} -include-runtime -d ${tempFile}.jar`, { encoding: 'utf-8' });
            const output = execSync(`java -jar ${tempFile}.jar`, { encoding: 'utf-8' });
            return { output, error: '' };
        } catch (err) {
            return { output: '', error: err.stderr };
        } finally {
            fs.unlinkSync(tempFile);
            if (fs.existsSync(`${tempFile}.jar`)) fs.unlinkSync(`${tempFile}.jar`);
        }
    }
    
    runJava(code) {
        const tempFile = path.join(this.tempDir, `Tython_${Date.now()}.java`);
        fs.writeFileSync(tempFile, code);
        const className = path.basename(tempFile, '.java');
        try {
            execSync(`javac ${tempFile}`, { encoding: 'utf-8' });
            const output = execSync(`java -cp ${this.tempDir} ${className}`, { encoding: 'utf-8' });
            return { output, error: '' };
        } catch (err) {
            return { output: '', error: err.stderr };
        } finally {
            fs.unlinkSync(tempFile);
            const classFile = path.join(this.tempDir, `${className}.class`);
            if (fs.existsSync(classFile)) fs.unlinkSync(classFile);
        }
    }
    
    runNode(code) {
        const tempFile = path.join(this.tempDir, `tython_${Date.now()}.js`);
        fs.writeFileSync(tempFile, code);
        try {
            const output = execSync(`node ${tempFile}`, { encoding: 'utf-8' });
            return { output, error: '' };
        } catch (err) {
            return { output: '', error: err.stderr };
        } finally {
            fs.unlinkSync(tempFile);
        }
    }
    
    runTypeScript(code) {
        const tempFile = path.join(this.tempDir, `tython_${Date.now()}.ts`);
        fs.writeFileSync(tempFile, code);
        const jsFile = tempFile.replace('.ts', '.js');
        try {
            execSync(`npx tsc ${tempFile} --outFile ${jsFile} --target ES2020`, { encoding: 'utf-8' });
            const output = execSync(`node ${jsFile}`, { encoding: 'utf-8' });
            return { output, error: '' };
        } catch (err) {
            return { output: '', error: err.stderr };
        } finally {
            fs.unlinkSync(tempFile);
            if (fs.existsSync(jsFile)) fs.unlinkSync(jsFile);
        }
    }
    
    parseJSON(code) {
        try {
            const data = JSON.parse(code);
            this.variables['json_data'] = data;
            return { output: JSON.stringify(data, null, 2), error: '' };
        } catch (err) {
            return { output: '', error: err.message };
        }
    }
    
    parseXML(code) {
        try {
            const xml = require('xml2js');
            let result;
            xml.parseString(code, (err, res) => {
                if (err) throw err;
                result = res;
            });
            return { output: JSON.stringify(result, null, 2), error: '' };
        } catch (err) {
            return { output: '', error: err.message };
        }
    }
    
    parseYAML(code) {
        try {
            const yaml = require('js-yaml');
            const data = yaml.load(code);
            this.variables['yaml_data'] = data;
            return { output: JSON.stringify(data, null, 2), error: '' };
        } catch (err) {
            return { output: '', error: err.message };
        }
    }
    
    async run(source) {
        const blocks = this.parseBlocks(source);
        for (const block of blocks) {
            const result = await this.executeBlock(block.lang, block.code);
            if (result.output) process.stdout.write(result.output);
            if (result.error) process.stderr.write(result.error);
        }
    }
}

module.exports = { TythonExecutor };
