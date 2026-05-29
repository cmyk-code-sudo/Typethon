interface CodeBlock {
    lang: string;
    code: string;
    lineNumber: number;
}

interface TypeDefinition {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    nullable: boolean;
}

class TythonTypeChecker {
    private typeMap: Map<string, TypeDefinition> = new Map();
    
    parseBlocks(source: string): CodeBlock[] {
        const regex = /<<(\w+)>>(.*?)<</\1>>/gs;
        const blocks: CodeBlock[] = [];
        let match;
        while ((match = regex.exec(source)) !== null) {
            blocks.push({
                lang: match[1],
                code: match[2],
                lineNumber: source.substr(0, match.index).split('\n').length
            });
        }
        return blocks;
    }
    
    inferType(value: any): TypeDefinition['type'] {
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return 'number';
        if (typeof value === 'boolean') return 'boolean';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        return 'string';
    }
    
    validateBlock(block: CodeBlock): boolean {
        const validators: Record<string, RegExp> = {
            python: /^(\s*def\s+\w+|import|from|class|\w+\s*=)/m,
            javascript: /^(function|const|let|var|\w+\s*=)/m,
            typescript: /^(\w+:\s*(string|number)|interface|type)/m,
            json: /^[\{\[].*[\}\]]$/s,
            xml: /^<\?xml|<[\w]+/,
            yaml: /^(\w+:\s+\S+|-\s+\w+)/
        };
        
        const validator = validators[block.lang];
        return validator ? validator.test(block.code) : false;
    }
    
    extractVariables(code: string): TypeDefinition[] {
        const varRegex = /(?:let|const|var|def)\s+(\w+)(?:\s*:\s*(\w+))?/g;
        const vars: TypeDefinition[] = [];
        let match;
        while ((match = varRegex.exec(code)) !== null) {
            vars.push({
                name: match[1],
                type: (match[2] as any) || 'string',
                nullable: false
            });
        }
        return vars;
    }
}

export { TythonTypeChecker, CodeBlock, TypeDefinition };
