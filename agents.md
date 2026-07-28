# agents.md — parent-partners-benchmarking 专案蓝图

## 这是什么
Yong Quan（1I班主任、UTM课程与教学博士生）要在泰丰华小 lawatan penanda aras（benchmarking观摩活动）做一场约10分钟的分享，主题「参与，不是家长的素质，是老师设计出来的系统——如何改变教学法，让家长走进课堂」。做成一份HTML/CSS/JS网页版slide deck（不是PPT/Keynote），部署在GitHub Pages，用真实照片/引言/数据讲三年来「让家长进课堂」的实践经验。

- **GitHub repo**：https://github.com/yquan77/parent-partners-benchmarking （public）
- **线上网址**：https://yquan77.github.io/parent-partners-benchmarking/
- **本地路径**：/Users/yquanloo/Documents/my-agent/parent-partners-benchmarking
- **讲稿定稿**（文字版，先于HTML定案，任何内容层面的疑问以这份为准）：/Users/yquanloo/Documents/my-agent/benchmarking-slot/讲稿要点.md

## 路线图 checklist

### 内容与文字
- [x] 主题、开场踩雷故事、结尾金句 定稿
- [x] 补上「为什么要让家长进课堂」这条学生自主性主线（v2定稿，师生比1:35→1:5）
- [x] **v4 结构性改写（2026-07-28）**：讲稿定稿改为三招「邀·讲·融」（原「合法性先行/共同目标设定/重新命名/DSKP」四招精简）
  - 拿掉：「重新命名教育合伙人」整段（改称呼hand-term页、boundary-spanning学术引用页、5→12团队数据页、边界踩坑故事页）
  - 拿掉：「其实我在训练的不是家长」收束整段（退开一步页、3N吊饰梦工坊20人页、昱杰妈妈「担心一年级孩子做不完」quote、宇乐妈妈quote、GRR三层页）——这些内容摘要仍留在讲稿要点.md末尾「备用材料」区块
  - 原「方法一：合法性先行」四页→压缩成「这是有官方依据的」1-2页（SdK/SPI Bilangan 1/2018 + Sarana Ibu Bapa好处清单合并）
  - 新增「邀」（看·问两字诀，1-2页，讲者临场口述举例，slide正文不列举例）
  - 新增「邀·讲·融」三字总结页，放在结尾号召（翻开下星期那一课·问自己两句）之前，全场收尾前份量最重的一页
- [x] 学术引用逐条核对出处（Sarana Ibu Bapa MOE 2012、mutualistic goals/boundary-spanning Rudder et al.、Adams & Christenson信任研究、SPI Bilangan 1/2018），引用页与相关页面左下角小号来源脚注已补齐；Fisher & Frey (2013) GRR引用因对应内容被删除已从Reference List移除
- [x] 数据核实：7组×5人（非5组×7人，已用写字课逐字稿+家长心得核对修正）；三年累积44场278人次（已核对算术）

### HTML deck
- [x] 三级字体层级系统、暖色系设计token（米白/暖棕+荧光绿强调色+陶土橙+学术引用灰蓝）
- [x] 手写字体（Ma Shan Zheng）子集化自嵌，Noto Sans SC / Manrope 子集化自嵌，无CDN依赖
- [x] 全屏照片组件 + 组合式占位状态，真实照片已换上（信心皇冠/叶子鸟/写字课马蹄型/郊游趣稻田/荧光盾牌UV/2023首场+2026大扫除并置）——「教育合伙人合照」一张因对应slide被删，图档保留在assets/img/但目前未被引用
- [x] 文字位置变体：`.photo-bg.top`（靠上）、`.photo-bg.split-v`（上下分层），已用在照片主体被文字挡住的几张
- [x] 人形icon组件（`.people-icons`）：5位起点、7组×5人分身克隆动画（原地变灰+克隆体飞入）、278人次密集阵列；师生比页讲者按键后先显示7位家长与组框，再执行分组。v4拿掉「团队5→12」「3N吊饰梦工坊20位」两处icon用法
- [x] 新增 `.term-duo`（邀页 看/问两字并置）与 `.term-trio`（结尾邀讲融三字总结，glow渐层同 `.stat-hero` 数字量级）两个组件，见 `assets/css/style.css`
- [x] 荧光盾牌揭晓：讲者点击触发（非自动倒数），实测两次点击行为正常
- [x] 现场互动投票：Supabase即时星级评分（1-5分「你现在几分想回去试试看」），QR码用vendored qrcode.min.js生成，见下方Supabase章节
- [x] 全部39张slide（v4，以index.html实际slide数为准；v3是47张）
- [x] 马来文同步显示功能：讲者翻页写入Supabase，手机端自动跟页；`assets/js/malay-content.js` 已同步改成39条，其中4条（SdK/邀 intro/看问duo/邀讲融总结）是AI初稿，**Yong Quan需要校对再上线**
- [x] 叙事与版面细节：荧光盾牌页制作照→黑场→荧光成品照揭晓
- [ ] Yong Quan预计还会持续给视觉反馈微调（padding、文字位置、动画细节），属正常迭代，不是遗漏
- [ ] `assets/js/malay-content.js` 里标注「DRAF AI」的4条翻译需要Yong Quan本人校对

### 部署与基础设施
- [x] GitHub repo已建立，Pages已开通（main分支根目录）
- [x] Supabase project（独立、干净，非借用EduNeo/其他正式环境）：URL `https://fgpsnxdvdtimzowgrbxk.supabase.co`，anon key写在 `assets/js/supabase-config.js`（前端公开key，符合预期，因为只做匿名投票用途，见 `assets/img/../supabase_setup.sql` 的RLS政策：仅允许insert+select，不允许update/delete）
- [x] 表 `confidence_ratings`（星级评分用）已建立，⚠️ 上台前记得在Supabase SQL editor跑 `delete from confidence_ratings;` 清空测试数据

## 资料夹结构
```
parent-partners-benchmarking/
├── index.html              # 主deck，39张slide（v4），看顶部HTML注释了解排版规则
├── assets/
│   ├── css/style.css       # 设计token+全部组件样式
│   ├── js/
│   │   ├── deck.js         # 导航、动画触发、荧光盾牌点击揭晓逻辑
│   │   ├── ratings.js      # Supabase REST封装（星级评分）
│   │   ├── slide-sync.js   # 讲者端目前页码写入Supabase
│   │   ├── live-malay.js   # 手机端马来文重点跟页
│   │   ├── supabase-config.js  # Supabase URL/anon key
│   │   └── qrcode.min.js   # vendored QR码库（MIT授权）
│   ├── fonts/               # 子集化字体（.subset.woff2），原始.ttf不进git（见.gitignore）
│   └── img/                 # 真实照片（已全部到位，8张）
├── vote/index.html          # 手机端星级评分投票页
├── my/index.html            # 手机端马来文重点同步页
└── supabase_setup.sql       # 建表+RLS政策，供SQL editor执行
```

## 跟其他专案的关系
- **讲稿文字定稿**独立存放在 `/Users/yquanloo/Documents/my-agent/benchmarking-slot/`，不在这个git repo里，改文字内容去那边改，改完再回来同步进index.html
- 用到的全屏照片素材原图来自 Yong Quan 的 Desktop 相簿（按日期资料夹存放），已挑选、压缩、改名存进本专案 `assets/img/`
- **全局skill沿用并更新旧版**：`~/.claude/skills/html-slide-deck/`。通用原则写成默认规则；「制作照→黑场→成品照」等只在叙事需要时采用的手法，记录为条件式模式，不强制每份slide套用。**不要另建同功能skill。**
- 与博士研究（IBSDK）有关的延伸材料保留在 `/Users/yquanloo/Documents/UTM/IBSDK-Research/家长参与活动记录.md`、`家长心得回馈.md`，以及 `/Users/yquanloo/Documents/my-agent/benchmarking-slot/讲稿要点.md`；未来写研究时应一并参考。
