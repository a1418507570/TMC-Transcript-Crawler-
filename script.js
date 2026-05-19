(async () => {
  let result = new Map()
  let container = document.querySelector('.minutes-module-list')

  if (!container) {
    // 增加一个备选容器查找，有的页面滚动容器可能在外层
    container = document.querySelector('.minutes-module-row')?.parentElement
    if (!container) {
      console.error('未找到滚动容器，请检查页面是否加载完成')
      return
    }
  }

  console.log('🚀 开始增强版抓取，请保持窗口激活状态...')

  while (true) {
    let prevTop = container.scrollTop

    document.querySelectorAll('.minutes-module-row').forEach(row => {
      // 1. 使用模糊匹配获取 pid，防止类名哈希变更失效
      let pid = row
        .querySelector('[class*="paragraph-module_paragraph"]')
        ?.getAttribute('data-pid')

      // 2. 优化后的名字提取逻辑：模糊匹配包含 'speaker-name' 的 class
      let nameElement = row.querySelector('[class*="speaker-name"]')
      let name = '未知'
      if (nameElement) {
        // 尝试直接取 span 里的文本，如果没有 span，取整个元素的 innerText
        name = nameElement.querySelector('span')?.innerText || nameElement.innerText
        name = name.trim()
      }

      // 3. 获取时间和内容（这两个看起来没有哈希后缀，相对稳定）
      let time = row.querySelector('.minutes-module-p-start-time')?.innerText || ''
      let content = row.querySelector('.minutes-module-sentences')?.innerText || ''

      if (pid && !result.has(pid)) {
        // 过滤空内容和换行噪声
        if (content.trim() !== '') {
          result.set(pid, `[${time}] ${name}: ${content.replace(/\n/g, ' ')}`)
        }
      }
    })

    container.scrollTop += 500 // 适当减小滚动跨度，防止跳过渲染不全的行
    await new Promise(r => setTimeout(r, 300)) // 略微增加延迟，保证加载稳定性

    if (container.scrollTop === prevTop) {
      container.scrollTop += 10
      await new Promise(r => setTimeout(r, 200))
      if (container.scrollTop === prevTop) break
    }
  }

  const finalData = Array.from(result.values()).join('\n')
  console.log('✅ 抓取完成！总条数：', result.size)
  console.log('----------------内容开始----------------')
  console.log(finalData)

  try {
    await navigator.clipboard.writeText(finalData)
    console.log('✨ 内容已成功写入剪贴板！')
  } catch (err) {
    console.log('❌ 复制失败，请手动从上方控制台复制。')
  }
})()
