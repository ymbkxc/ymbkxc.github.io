---
title: LSTM理解
date: 2019-12-19 14:58:13
tags:
- LSTM
- deeplearning
categories:
- 技术
---

\\begin{array}{ll} \\\\ i\_t = \\sigma(W\_{ii} x\_t + b\_{ii} + W\_{hi} h\_{(t-1)} + b\_{hi}) \\\\ f\_t = \\sigma(W\_{if} x\_t + b\_{if} + W\_{hf} h\_{(t-1)} + b\_{hf}) \\\\ g\_t = \\tanh(W\_{ig} x\_t + b\_{ig} + W\_{hg} h\_{(t-1)} + b\_{hg}) \\\\ o\_t = \\sigma(W\_{io} x\_t + b\_{io} + W\_{ho} h\_{(t-1)} + b\_{ho}) \\\\ c\_t = f\_t c\_{(t-1)} + i\_t g\_t \\\\ h\_t = o\_t \\tanh(c\_t) \\\\ \\end{array}

### [](#LSTM-参数维度： "LSTM 参数维度：")LSTM 参数维度：

##### [](#Inputs-input-h-0-c-0 "Inputs: input, (h_0, c_0)")Inputs: input, (h\_0, c\_0)

-   **input** of shape `(seq_len, batch, input_size)`对应到工业数据（时间步，批大小，特征数）tensor containing the features of the input sequence.
    
-   **h\_0** shape `(num_layers * num_directions, batch, hidden_size)` tensor containing the initial hidden state for each element in the batch.
    
-   **c\_0** of shape `(num_layers * num_directions, batch, hidden_size)`: tensor containing the initial cell state for each element in the batch.
    

##### [](#Outputs-output-h-n-c-n "Outputs: output, (h_n, c_n)")Outputs: output, (h\_n, c\_n)

```
- **output** of shape `(seq_len, batch, num_directions * hidden_size)`: tensor
  containing the output features `(h_t)` from the last layer of the LSTM,

- **h_n** of shape `(num_layers * num_directions, batch, hidden_size)`: tensor
  containing the hidden state for `t = seq_len`. Like *output*, the layers can be separated using ``h_n.view(num_layers, num_directions, batch, hidden_size)`` and similarly for *c_n*.

- **c_n** (num_layers * num_directions, batch, hidden_size): tensor containing the cell state for `t = seq_len`
```

### [](#Attributes "Attributes:")Attributes:

​ weight\_ih\_l\[k\] : the learnable input-hidden weights of the :math$\\text{k}^{th}$ layer  
$(W\_ii|W\_if|W\_ig|W\_io)$, of shape `(4*hidden_size x input_size)`  
weight\_hh\_l\[k\] : the learnable hidden-hidden weights of the :math:$\\text{k}^{th}$ layer  
$(W\_hi|W\_hf|W\_hg|W\_ho)$, of shape `(4*hidden_size x hidden_size)`  
bias\_ih\_l\[k\] : the learnable input-hidden bias of the :math:$\\text{k}^{th}$ layer  
$(b\_ii|b\_if|b\_ig|b\_io)$, of shape `(4*hidden_size)`  
bias\_hh\_l\[k\] : the learnable hidden-hidden bias of the :math:$\\text{k}^{th}$ layer  
$(b\_hi|b\_hf|b\_hg|b\_ho)$, of shape `(4*hidden_size)`
