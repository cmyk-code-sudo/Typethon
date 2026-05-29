<?php
class TythonParser {
    private $vars = [];
    
    public function parseBlocks($code) {
        preg_match_all('/<<(\w+)>>(.*?)<</\1>>/s', $code, $matches);
        $blocks = [];
        for ($i = 0; $i < count($matches[0]); $i++) {
            $blocks[] = ['lang' => $matches[1][$i], 'code' => $matches[2][$i]];
        }
        return $blocks;
    }
    
    public function extractVariables($code) {
        preg_match_all('/(?:let|var|const)\s+(\w+)\s*=/', $code, $matches);
        return $matches[1];
    }
    
    public function validateSyntax($lang, $code) {
        $validators = [
            'python' => '/def\s+\w+\s*\(.*\):/',
            'javascript' => '/function\s+\w+\s*\(.*\)\s*{/',
            'typescript' => '/:\s*(string|number|boolean)\s*=/'
        ];
        return isset($validators[$lang]) && preg_match($validators[$lang], $code);
    }
}
?>
