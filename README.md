背景：公司项目需要一个能绘制流程图的功能，能绘制能保存，并且能够将每个节点和表单数据关联起来。决定使用jsPlumb，然后在github查阅资料看到[demo-jsPlumb](https://github.com/smile1828/demo-jsPlumb)，在这个基础上进行了修改完善，一些细节方面也进行了优化，非常感谢 smile1828。

功能：

- 按钮点击新增节点，或者拖拽新增节点

  > 项目上只需要用到一个图形，所以就做成新增按钮，需要多个节点拖动，html可以取消隐藏
  >
  > ```html
  > <div class="flow-body">
  >     <div class="flow-menu" style="display:none">
  >         <h5>节点类型列表</h5>
  >         <div id="flow-btns" class="flow-btns">
  >             <div class="flow-btn btn-base" data-type="base"></div>
  >             <div class="flow-btn btn-flow" data-type="flow"></div>
  >             <div class="flow-btn btn-node" data-type="node"></div>
  >             <div class="flow-btn btn-judge" data-type="judge"></div>
  >         </div>
  >     </div>
  >     <div class="flow-container">
  >         <div class="flow-main" id="flow-main"></div>
  >     </div>
  > </div>
  > ```

  ![新增节点](https://fangchenyong.oss-cn-hangzhou.aliyuncs.com/img/20191106161400.png)

- 单击节点，右上角出现删除角标点击删除，也可以按delete删除

  ![删除节点](https://fangchenyong.oss-cn-hangzhou.aliyuncs.com/img/20191106161444.png)

- 双击节点，可打开自定义窗口

- 节点支持连线

  ![连线节点](https://fangchenyong.oss-cn-hangzhou.aliyuncs.com/img/20191106161630.png)

- 连线单击选中后，按delete删除

- 连线双击可以添加label

- 点击保存按钮，可以将流程图存为json数据通过ajax传给后端保存

- 对于已经存在数据的可以直接调用draw方法绘制

- 支持清空画布

参考链接：

- [demo-jsPlumb](https://github.com/smile1828/demo-jsPlumb)
- [jsplumb 中文教程](https://www.cnblogs.com/xcj26/p/9870734.html)
- [jsPlumb应用指南（一）概念部分](https://blog.csdn.net/T_tq_bnsg_bs_ll/article/details/91380367)
