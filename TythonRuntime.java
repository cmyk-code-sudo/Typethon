import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

public class TythonRuntime {
    private Map<String, Object> sharedVars = new HashMap<>();
    
    public List<Map<String, String>> parseBlocks(String source) {
        List<Map<String, String>> blocks = new ArrayList<>();
        Pattern pattern = Pattern.compile("<<(\\w+)>>(.*?)<</\\1>>", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(source);
        
        while (matcher.find()) {
            Map<String, String> block = new HashMap<>();
            block.put("lang", matcher.group(1));
            block.put("code", matcher.group(2));
            blocks.add(block);
        }
        return blocks;
    }
    
    public ProcessResult execute(String lang, String code) throws Exception {
        switch (lang) {
            case "python": return runPython(code);
            case "javascript": return runNode(code);
            case "java": return runJava(code);
            default: return new ProcessResult("", "Unknown language: " + lang);
        }
    }
    
    private ProcessResult runPython(String code) throws Exception {
        File temp = File.createTempFile("tython", ".py");
        Files.write(temp.toPath(), code.getBytes());
        Process process = new ProcessBuilder("python3", temp.getAbsolutePath()).start();
        String output = new String(process.getInputStream().readAllBytes());
        String error = new String(process.getErrorStream().readAllBytes());
        temp.delete();
        return new ProcessResult(output, error);
    }
    
    private ProcessResult runNode(String code) throws Exception {
        File temp = File.createTempFile("tython", ".js");
        Files.write(temp.toPath(), code.getBytes());
        Process process = new ProcessBuilder("node", temp.getAbsolutePath()).start();
        String output = new String(process.getInputStream().readAllBytes());
        String error = new String(process.getErrorStream().readAllBytes());
        temp.delete();
        return new ProcessResult(output, error);
    }
    
    private ProcessResult runJava(String code) throws Exception {
        File sourceFile = File.createTempFile("Tython", ".java");
        Files.write(sourceFile.toPath(), code.getBytes());
        Process compile = new ProcessBuilder("javac", sourceFile.getAbsolutePath()).start();
        compile.waitFor();
        String className = sourceFile.getName().replace(".java", "");
        Process run = new ProcessBuilder("java", className).start();
        String output = new String(run.getInputStream().readAllBytes());
        String error = new String(run.getErrorStream().readAllBytes());
        sourceFile.delete();
        new File(className + ".class").delete();
        return new ProcessResult(output, error);
    }
    
    class ProcessResult {
        String output, error;
        ProcessResult(String out, String err) { output = out; error = err; }
    }
          }
