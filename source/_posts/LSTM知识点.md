---
title: LSTM知识点
date: 2019-12-19 14:58:13
tags:
- LSTM
- deeplearning
categories:
- 技术
---

embedding 索引句子中的词在第几行，对用生产数据来说，没有词的概念，并不能索引第几行，会出现数组维度溢出的异常，直接参考静态embedding，将数据当做事先训练好的词向量。
