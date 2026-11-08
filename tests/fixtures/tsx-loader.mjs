// Apenas para renderização de componentes nos testes Node, sem alterar o build.
import { readFile } from 'node:fs/promises'
import ts from 'typescript'

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context)
  } catch (error) {
    if (error.code !== 'ERR_MODULE_NOT_FOUND' || !specifier.startsWith('.'))
      throw error
    for (const extension of ['.ts', '.tsx']) {
      try {
        return await nextResolve(specifier + extension, context)
      } catch (failure) {
        if (failure.code !== 'ERR_MODULE_NOT_FOUND') throw failure
      }
    }
    throw error
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.css'))
    return { format: 'module', shortCircuit: true, source: 'export default {}' }
  if (!/\.tsx?$/.test(url)) return nextLoad(url, context)
  const source = await readFile(new URL(url), 'utf8')
  return {
    format: 'module',
    shortCircuit: true,
    source: ts.transpileModule(source, {
      fileName: new URL(url).pathname,
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
    }).outputText,
  }
}
