import { parse, print, visit } from 'recast'
import parser from 'recast/parsers/babel'

export function extractComponentContent(code: string) {
  const ast = parse(code, { parser })

  let jsxElementNode: any

  visit(ast, {
    visitReturnStatement(path) {
      jsxElementNode = path.node.argument
      return false
    },
  })

  const result = print(jsxElementNode).code

  // Remove parenthesis
  return result.slice(1, -1)
}
