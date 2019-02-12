const image_prefix = '/images'

function isUsedByRequired (src) {
  const { type, value, expression } = src.value

  /**
   * 字面量引入，形如：<img src='/images/test.png' />
   */
  if (type === 'Literal') {
    return !value.startsWith(image_prefix)
  }

  if (type === 'JSXExpressionContainer') {
    switch (expression.type) {
      case 'TemplateLiteral': {
        /**
         * 模板语法
         * 形如：<img src={`/images/test.png`} />
         * 形如：<img src={`/images/${test}.png`} />
         */
        if (expression.quasis[0].value.raw.startsWith(image_prefix)) return false

        break
      }
      case 'LogicalExpression': {
        /**
         * 或表达式
         * 形如：<img src={test || '/image/test.png'} />
         * 形如：<img src={test && '/image/test.png'} />
         */
        if (expression.right.type === 'Literal') {
          return !expression.right.value.startsWith(image_prefix)
        } else {
          return isUsedByRequired({
            value: {
              type: 'JSXExpressionContainer',
              expression: expression.right
            }
          })
        }

        break
      }
      case 'ConditionalExpression': {
        /**
         * 三元表达式
         * 形如：<img src={test ? test : '/images/test.png'} />
         */
        const { consequent, alternate } = expression

        if (consequent.type === 'Literal') {
          if (consequent.value.startsWith(image_prefix)) return false
        } else {
          const recursiveTest = isUsedByRequired({
            value: {
              type: 'JSXExpressionContainer',
              expression: consequent
            }
          })

          if (!recursiveTest) return false
        }

        if (alternate.type === 'Literal') {
          if (alternate.value.startsWith(image_prefix)) return false
        } else {
          const recursiveTest = isUsedByRequired({
            value: {
              type: 'JSXExpressionContainer',
              expression: alternate
            }
          })

          if (!recursiveTest) return false
        }

        break
      }
      default: {
        break
      }
    }
  }

  return true
}

module.exports = {
  meta: {
    docs: {
      description: '静态图片必须以 “require()” 的方式引入'
    }
  },
  create: function (context) {
    return {
      JSXElement: function (node) {
        const { name, attributes } = node.openingElement

        if (name.name === 'img') {
          const src = attributes.find(function (item) {
            return item.type === 'JSXAttribute' && item.name.name === 'src'
          })

          if (!isUsedByRequired(src)) {
            context.report({
              node: src,
              message: '静态图片必须以 “require()” 的方式引入',
              data: {
                str: node.name
              }
            })
          }
        }
      }
    }
  }
}
