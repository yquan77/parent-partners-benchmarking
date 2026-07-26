# 示意图（MOCK ONLY）

这资料夹里的图**不是我们的照片**，是从 loremflickr（Flickr 授权图库）抓来的临时素材，
只为了让排版能先看到「全屏照片」的实际效果。

## 正式使用前必须做的事
1. 把真实照片放进 `assets/img/`（不是这个 mock 资料夹）。
2. 到 `index.html`，把对应那一页的这一行路径改掉：
   ```html
   <div class="bg-layer" style="background-image:url('assets/img/mock/lf-xxx.jpg')"></div>
   →
   <div class="bg-layer" style="background-image:url('assets/img/信心皇冠.jpg')"></div>
   ```
   同一个 `<section>` 上的 `--focal:50% 45%` 控制裁切焦点（等同 background-position），
   例如 `50% 30%` 会保住画面上方的人脸。
3. 顺手把该页那张小卡（`.photo-await`）删掉——它只是提醒「这里还是示意图」。
4. 六张全换完之后，整个 `assets/img/mock/` 资料夹可以直接删除。

## 目前对应关系
| 页 | mock 档案 | 要换成 |
|---|---|---|
| 2 | lf-classroom.jpg | 2023-07-20「信心皇冠」现场照（乱中有序） |
| 10 | lf-craft.jpg | 叶子鸟筹备——家长剪字卡 / 收集叶子 |
| 17 | lf-school.jpg | 教育合伙人团队合照 |
| 18 | lf-field.jpg | 「郊游趣」户外教学（稻田 / 灯塔 / 陶瓷工作坊） |
| 19 | lf-glow.jpg | 荧光盾牌暗室现场照，UV 灯亮起那一瞬间 |
| 28 | lf-group.jpg | 并置两张：2023 首场（5 人） vs 2026 大扫除（11 人） |
