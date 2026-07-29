# handoff.md — parent-partners-benchmarking

## ⏯️ 目前做到哪

HTML slide deck目前共40页，主要内容、真实照片、马来文实时跟页、来源脚注与参考文献页都已完成。2026-07-29新增「邀」三图蒙太奇后，马来文内容已全套校对并恢复40页逐页同步。

## 🚦 目前状态

- ✅ 主deck可运行；第10页手动揭示、动画期间防误跳、完成后翻页、返回重置均通过Playwright测试
- ✅ JavaScript语法检查、40页马来文映射、手机端逐页溢出检查及 `git diff --check` 通过
- ✅ GitHub Pages现有版本已包含此前完成的马来文同步、引用设计与其他页面修正
- ✅ 本次第10页动画变动已commit并push至 `main`
- ⚠️ 上台前必须到Supabase SQL editor执行 `delete from confidence_ratings;`，清除测试投票
- ℹ️ repo根目录有未追踪的 `讲稿要点.md`，属于使用者文件，本次不修改、不纳入commit

## ➡️ 下一步

1. 在实际投影设备完整彩排一次，重点检查第10页按键节奏、第28页照片揭晓与马来文手机跟页。
2. 上台前清空Supabase测试投票，并用现场手机网络测试投票及马来文同步。
3. 若再收到视觉反馈，只处理被点名页面，避免重新大幅改动已确认内容。

## ⚠️ 注意事项

- 第10页与第28页都是讲者手动触发：第一次「下一页」执行页面内动画，完成后再按才翻页，不可改回自动倒数。
- 第10页上排35位学生原身必须留在原位，只能褪色；移动的是克隆体，否则会被读成「学生减少」。
- 改HTML/CSS前先读 `index.html` 顶部排版规则注释。
- 这台电脑可能同时运行其他本地server；启动前先检查端口，Playwright测试使用独立页面。
- 全局 `~/.claude/skills/html-slide-deck/` 本次曾更新；若该目录由chezmoi管理，需另行执行chezmoi同步。

## 🕐 最后更新

2026-07-28 15:00 +08｜Codex @ mr007s-Macbook-Air.local｜Git push：✅ 已推
