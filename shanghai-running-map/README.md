# 上海跑步路线交互地图

一个使用 MapLibre GL JS + OpenFreeMap 的纯静态交互地图。无需 API Key、Token、账号或构建步骤。

## Windows 本地启动

1. 在资源管理器中打开本项目文件夹。
2. 在文件夹地址栏输入 `cmd` 后按回车。
3. 运行：

   ```powershell
   python -m http.server 8000
   ```

4. 浏览器访问 [http://localhost:8000](http://localhost:8000)。

停止服务时，回到命令行按 `Ctrl+C`。

> 地图底图和 MapLibre GL JS 从公开 CDN 加载，使用时需要联网，但不需要任何 Key 或登录。

## 项目文件

- `index.html`：页面结构和 MapLibre CDN 引用
- `style.css`：地图、信息卡、控制面板和手机适配
- `route-data.js`：两段跑步路线的高密度 WGS-84 坐标
- `actual-activity-data.js`：从 2026-09-07 Garmin GPX 提取的实际轨迹、心率、配速、海拔和步频数据
- `app.js`：地铁路线、Marker、Popup、视图控制与距离计算
- `第一段_冠东苑到淞滨路.gpx`：第一跑步段的 Garmin 导航轨迹
- `第二段_长江南路到国际时尚中心.gpx`：第二跑步段的 Garmin 导航轨迹

## 数据与地图说明

- 底图优先使用 OpenFreeMap Liberty，不可用时自动尝试 OpenFreeMap Bright。
- 跑步轨迹基于公开 OpenStreetMap 可步行路网计算，保留 401 个道路/步道形状点，再固化到 `route-data.js`。页面运行时不调用地理编码或路径规划服务。
- 路线距离由页面按坐标逐段使用 Haversine 公式计算，不是手工写死。
- 橙色线是 2026-09-07 实际跑步轨迹。从 GPX 中检测到淞滨路至长江南路的 4.55 km 定位跳点，因此分成两段，不将地铁距离计入实跑。
- 实跑数据中的 20.14 km 为根据 GPS 计算的有效跑动估算，已排除地铁跳点、长时间停顿和明显静止漂移。
- 当前优化版取消了何家湾、新江湾城北部和松花江路东段的往返绕行，两段跑步合计约 20.6 km。
- 第二段不进入黄兴公园改造区，不沿军工路和周家嘴路施工段长距离跑。
- 路线为跑步查看和规划参考。出发前请结合实地施工、公园开放时间、人行道和交通管制情况判断。

## 导入 Garmin 手表

建议分别导入两个 GPX，因为中间乘坐地铁：

1. 在页面左侧下载两个 GPX 文件。
2. 登录 Garmin Connect 网页版，打开“训练与计划 → 路线 → 导入”，分别导入并保存。
3. 选择“发送到设备”，再用 Garmin Connect App 或 Garmin Express 同步手表。
4. 跑完第一段后结束该路线导航；到长江南路后再开启第二段。

手表需要支持 Garmin Courses/路线导航功能；具体入口名称会随型号不同。Garmin 官方说明：[导入第三方路线](https://support.garmin.com/en-US/?faq=wKuZXCaZRP4mWPX5aRz5h5)、[发送已保存路线到设备](https://support.garmin.com/en-US/?faq=C4mcn2I4cGAL7vkq3qTCMA)。
