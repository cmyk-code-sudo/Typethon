import java.io.File
import java.lang.ProcessBuilder

class TythonEngine {
    private val vars = mutableMapOf<String, Any>()
    
    fun executeBlock(lang: String, code: String): Pair<String, String> {
        return when (lang) {
            "python" -> runPython(code)
            "javascript" -> runNode(code)
            "typescript" -> runTypeScript(code)
            else -> Pair("", "Unsupported: $lang")
        }
    }
    
    private fun runPython(code: String): Pair<String, String> {
        val tempFile = File.createTempFile("tython", ".py")
        tempFile.writeText(code)
        val process = ProcessBuilder("python3", tempFile.absolutePath).start()
        val output = process.inputStream.bufferedReader().readText()
        val error = process.errorStream.bufferedReader().readText()
        tempFile.delete()
        return Pair(output, error)
    }
    
    private fun runNode(code: String): Pair<String, String> {
        val tempFile = File.createTempFile("tython", ".js")
        tempFile.writeText(code)
        val process = ProcessBuilder("node", tempFile.absolutePath).start()
        val output = process.inputStream.bufferedReader().readText()
        val error = process.errorStream.bufferedReader().readText()
        tempFile.delete()
        return Pair(output, error)
    }
    
    private fun runTypeScript(code: String): Pair<String, String> {
        val tsFile = File.createTempFile("tython", ".ts")
        tsFile.writeText(code)
        val jsFile = File.createTempFile("tython", ".js")
        val compile = ProcessBuilder("npx", "tsc", "--outFile", jsFile.absolutePath, tsFile.absolutePath).start()
        compile.waitFor()
        val process = ProcessBuilder("node", jsFile.absolutePath).start()
        val output = process.inputStream.bufferedReader().readText()
        val error = process.errorStream.bufferedReader().readText()
        listOf(tsFile, jsFile).forEach { it.delete() }
        return Pair(output, error)
    }
}

fun main(args: Array<String>) {
    val engine = TythonEngine()
    val code = File(args[0]).readText()
    val blocks = Regex("<<(\\w+)>>(.*?)<</\\1>>", RegexOption.DOT_MATCHES_ALL).findAll(code)
    blocks.forEach { match ->
        val (_, lang, blockCode) = match.groupValues
        val (output, error) = engine.executeBlock(lang, blockCode)
        println(output)
        if (error.isNotEmpty()) System.err.println(error)
    }
}
