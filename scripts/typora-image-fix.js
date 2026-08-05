'use strict';

// 让 Typora 的图片路径在 Hexo 中正常显示
//
// 背景：
//   - Typora 设置 "Copy to ./${filename}" 时，粘贴图片会存到 文章同名子文件夹
//     并在 Markdown 里写 ![alt](./文章名/image.jpg) 或 ![alt](文章名/image.jpg)
//   - Hexo post_asset_folder + marked(postAsset+prependRoot) 只能识别裸文件名 ![alt](image.jpg)
//
// 本过滤器在渲染前把 Typora 风格的路径前缀去掉，转成裸文件名，
// 让 Hexo 正确重写为 /year/month/day/文章名/image.jpg
// 同时 Typora 预览（按相对路径找 ./文章名/image.jpg）也能正常显示

hexo.extend.filter.register('before_post_render', function (data) {
  if (!data.content) return data;

  // 文章对应的资源文件夹名 = .md 文件名（去掉扩展名）
  const path = require('path');
  const folder = path.basename(data.path, path.extname(data.path));
  if (!folder) return data;

  const escaped = folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 匹配 ![alt](./文件夹/图片) 或 ![alt](文件夹/图片)
  // 不匹配以 / 开头的绝对路径，也不匹配 http 链接
  const re = new RegExp(
    '!\\[([^\\]]*)\\]\\((\\./)?' + escaped + '/([^)]+)\\)',
    'g'
  );

  data.content = data.content.replace(re, '![$1]($3)');
  return data;
});
