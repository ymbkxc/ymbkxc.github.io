---
title: Pytorch知识点
date: 2019-12-19 14:58:13
tags:
- deeplearning
- pytorch
categories:
- 技术
---

1.Pytorch里面的torch.nn.Parameter()

​ 绑定到module里进行参数优化：

`self.W = nn.Parameter(torch.randn([n_hidden,1]).type(dtype))`
