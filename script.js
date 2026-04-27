(async () => {
  let result = new Map()
  let container = document.querySelector('.minutes-module-list')

  if (!container) {
    console.error('未找到滚动容器，请检查类名是否正确')
    return
  }

  console.log('🚀 开始深度抓取，请保持窗口激活状态...')

  while (true) {
    let prevTop = container.scrollTop

    // 抓取当前 DOM 中所有的行
    document.querySelectorAll('.minutes-module-row').forEach(row => {
      let pid = row
        .querySelector('.paragraph-module_paragraph__79pMd')
        ?.getAttribute('data-pid')
      let name = row.querySelector('.paragraph-module_speaker-name__afSbd')?.innerText || '未知'
      let time = row.querySelector('.minutes-module-p-start-time')?.innerText || ''
      let content = row.querySelector('.minutes-module-sentences')?.innerText || ''

      // 使用 pid 作为 key 自动去重，确保内容完整
      if (pid && !result.has(pid)) {
        result.set(pid, `[${time}] ${name}: ${content}`)
      }
    })

    container.scrollTop += 600 // 滚动跨度
    await new Promise(r => setTimeout(r, 200)) // 给页面一点渲染时间

    if (container.scrollTop === prevTop) {
      // 尝试再滚一次，防止因为加载慢导致的误判
      container.scrollTop += 5
      await new Promise(r => setTimeout(r, 200))
      if (container.scrollTop === prevTop) break
    }
  }

  const finalData = Array.from(result.values()).join('\n')

  // 打印到控制台，防止复制失败你也能手动复制
  console.log('✅ 抓取完成！总条数：', result.size)
  console.log('----------------内容开始----------------')
  console.log(finalData)
  console.log('----------------内容结束----------------')

  // 尝试用标准 API 复制
  try {
    await navigator.clipboard.writeText(finalData)
    console.log('✨ 内容已成功写入剪贴板！可以直接去粘贴了。')
  } catch (err) {
    console.log('❌ 自动写入剪贴板失败（浏览器安全限制），请手动从上方控制台输出内容中复制。')
  }
})()
