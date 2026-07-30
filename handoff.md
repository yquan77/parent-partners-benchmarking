# handoff.md — parent-partners-benchmarking

## ⏯️ 目前做到哪

HTML slide deck目前共40页，主要内容、真实照片、马来文实时跟页、来源脚注与参考文献页都已完成，讲稿(v4「邀·讲·融」)与deck已完全同步。2026-07-30这轮补上悬浮QR徽章、修正马来文QR链接bug、调整互动评分问句措辞，并把v1初版讲稿从最早commit还原归档。

## 🚦 目前状态

- ✅ 主deck可运行；第10页手动揭示、动画期间防误跳、完成后翻页、返回重置均通过Playwright测试
- ✅ 「邀」三图蒙太奇（第18页）布局bug（class name撞名 `.trio-cell`）已修复，改名 `.montage-cell`；40页马来文映射已核实一致
- ✅ 左下角常驻悬浮QR徽章（点击展开马来文对照大QR）已上线，不用再靠按M键才能发现
- ✅ 马来文QR链接bug已修复：改用 `location.pathname` 而非 `location.href`，不再带上当前slide的#页数
- ✅ 互动评分页问句改为「如果满分5分，你现在有多想回去试试看？」，语句更自然
- ✅ v1初版讲稿（19页四招式版本）已从最早commit `80387e6` 还原，归档在 `archive/讲稿要点_v1_2026-07-27.md`；v3归档在 `benchmarking-slot/archive/`
- ✅ 原始素材（3年活动记录、家长心得全文）确认完整无缺，存放在 `~/Documents/UTM/IBSDK-Research/`，与slide deck各自独立
- ✅ 全部改动已commit并push至 `main`
- ⚠️ 上台前必须到Supabase SQL editor执行 `delete from confidence_ratings;`，清除测试投票

## ➡️ 下一步

1. 在实际投影设备完整彩排一次，重点检查第10页按键节奏、第18页照片蒙太奇、马来文手机跟页与新的悬浮QR徽章。
2. 上台前清空Supabase测试投票，并用现场手机网络测试投票及马来文同步。
3. 若再收到视觉反馈，只处理被点名页面，避免重新大幅改动已确认内容。

## ⚠️ 注意事项

- 第10页与荧光盾牌页都是讲者手动触发：第一次「下一页」执行页面内动画，完成后再按才翻页，不可改回自动倒数。
- 第10页上排35位学生原身必须留在原位，只能褪色；移动的是克隆体，否则会被读成「学生减少」。
- 改HTML/CSS前先读 `index.html` 顶部排版规则注释。
- CSS组件命名要注意避免跟已有class撞名（如`.trio-cell`曾撞名导致布局bug），新组件宁可取更具体的名字。
- 这台电脑可能同时运行其他本地server；启动前先检查端口，Playwright测试使用独立页面。

## 🕐 最后更新

2026-07-30 ｜ Claude Sonnet 5｜Git push：✅ 已推，工作树clean
