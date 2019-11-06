var main = "";
(function () {
    var delArray = [];
    main = {
        init: function () {
            this.addNode()
                .draggable()
                .documentClick()
                .clickLine()
                .dblclickLine()
                .saveFlow()
                .editFlow()
                .clearFlow()
                .saveToImg();
        },
        //新增节点
        addNode: function () {
            var that = this;
            $("#add").on("click", function () {
                clearTimeout(addTimes);
                addTimes = setTimeout(function () {

                    
                    if (!isNew) {
                        return;
                    }
                    _index++;
                    var id = that.CreateGUID();
                    var dom = $('<div class="node-common" id="' + id + '" data-type="flow"><span class="node-text"></span></div>')
                    $('#flow-main').append(dom);
                    dom.css("left", 5).css("top", 5);
                    dom.addClass('node-flow');
                    jsPlumb.addEndpoint(id, { anchors: "TopCenter" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "RightMiddle" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "BottomCenter" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "LeftMiddle" }, endpointStyle);
                    jsPlumb.draggable(id);
                    dom.draggable({ containment: "parent" });
                    that.nodeClick(id);
                }, 50);
            })
            return this;
        },
        /**
         * 实现拖拽
         *
         */
        draggable: function () {
            var that = this;
            $("#flow-btns").children().draggable({
                helper: "clone",
                scope: "ss",
            });
            container.droppable({
                scope: "ss",
                drop: function (event, ui) {
                    if (!isNew) {
                        return;
                    }
                    var left = parseInt(ui.offset.left - $(this).offset().left);
                    var top = parseInt(ui.offset.top - $(this).offset().top);
                    var type = ui.helper.context.dataset.type;

                    _index++;
                    //var id = that.judgeId(type,_index);
                    var id = that.CreateGUID();
                    var dom = $('<div class="node-common" id="' + id + '" data-type="' + type + '"><span class="node-text"></span></div>')
                    $(this).append(dom);
                    dom.css("left", left).css("top", top);

                    // 根据不同的类型，在画布中添加对应的节点
                    switch (type) {
                        case "base":
                            dom.addClass('node-base');
                            break;
                        case "flow":
                            dom.addClass('node-flow');
                            break;
                        case "node":
                            dom.addClass('node-node');
                            break;
                        case "judge":
                            dom.addClass('node-judge');
                            break;
                    }
                    jsPlumb.addEndpoint(id, { anchors: "TopCenter" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "RightMiddle" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "BottomCenter" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "LeftMiddle" }, endpointStyle);
                    jsPlumb.draggable(id);
                    dom.draggable({ containment: "parent" });
                    that.nodeClick(id);
                }
            });
            return this;
        },

        /**
         * 节点点击事件
         *
         */
        nodeClick: function (id) {
            var currentDom = $('#' + id);
            // 单击选中，可删除
            currentDom.click(function () {
                //右上角添加删除图标
                $(this).append('<img src="/Projects/Power.PIP.HZ.Standard/scripts/PlatForm//jsPlumb/images/close.png" style="position: absolute;" />');
                $("img").css("top", 0).css("right", 0);
                clearTimeout(nodeTimes);
                //执行延时，不使用延时无法绑定事件
                nodeTimes = setTimeout(function () {
                    $("img").click(function (event) {
                        
                        var parentId = $("#" + $(this).parent().attr('id'));
                        //节点删除同时删除前期任务表中数据
                        delArray.push({
                            MasterId: "",
                            BlockId: parentId[0].id
                        });
                        parentId.remove();
                        jsPlumb.removeAllEndpoints(parentId);
                        //如果连线有 label ，也得删除
                        var labelsDom = $('.line-label');
                        var paths = jsPlumb.getAllConnections();
                        if (labelsDom.length == 0) {
                            return false;
                        }
                        for (var i = 0; i < labelsDom.length; i++) {
                            var currentLabelDom = labelsDom.eq(i);
                            var pathId = currentLabelDom.data('path');
                            var pathIsHave = false;
                            for (var j = 0; j < paths.length; j++) {
                                var currentPath = paths[j];
                                if (currentPath.parentId == pathId) {
                                    pathIsHave = true;
                                    break;
                                }
                            }
                            if (!pathIsHave) {
                                currentLabelDom.remove();
                                break;
                            }
                        }
                        return false;
                    })
                    container.children('.node-common').removeClass('node-focus');
                    currentDom.addClass('node-focus');
                    var input = $("<input type='text' class='hide-input'/>");
                    setTimeout(function () {
                        input.focus();
                    }, 50);
                    currentDom.append(input);
                    currentDom.keydown(function (event) {
                        event = event || window.event
                        if (event.keyCode == 46) {  //8--backspace;46--delete
                            currentDom.remove();
                            jsPlumb.removeAllEndpoints(id);
                            //如果连线有 label ，也得删除
                            var labelsDom = $('.line-label');
                            var paths = jsPlumb.getAllConnections();
                            if (labelsDom.length == 0) {
                                return false;
                            }
                            for (var i = 0; i < labelsDom.length; i++) {
                                var currentLabelDom = labelsDom.eq(i);
                                var pathId = currentLabelDom.data('path');
                                var pathIsHave = false;
                                for (var j = 0; j < paths.length; j++) {
                                    var currentPath = paths[j];
                                    if (currentPath.id == pathId) {
                                        pathIsHave = true;
                                        break;
                                    }
                                }
                                if (!pathIsHave) {
                                    currentLabelDom.remove();
                                    break;
                                }
                            }
                            return false;
                        }
                    });
                }, 50);
            })
            // 双击打开表单
            currentDom.dblclick(function (e) {
                var that = this;
                var Id = currentDom[0].id;//节点Id
                var url = '/Form/AddForm/0fe998eb-f135-4b16-bda7-f66cfc0b1ef4/?MasterId=' + mini.get("HZ_PremTemplateManage").getSelected().Id + '&TemplateManageId=' + Id;//默认打开新增的Url
                $.ajax({
                    url: "/Form/GridPageLoad",
                    data: {
                        KeyWord: "PS_PreM_PreTasks", KeyWordType: "BO",
                        select: "",
                        swhere: " TemplateManageId = '" + Id + "'",
                        sort: "",
                        index: "",
                        size: ""
                    },
                    type: "POST",
                    cache: false,
                    async: false,
                    success: function (text) {
                        var o = mini.decode(text);
                        var data = mini.decode(o.data.value);
                        if (o.success && data.length > 0) {
                            url = "/Form/ValidForm/0fe998eb-f135-4b16-bda7-f66cfc0b1ef4/edit/" + data[0].Id;
                        }
                    }
                });
                //查询前期表中是否存在当前Id，不存在新增，存在打开编辑
                mini.open({
                    url: url,
                    showMaxButton: true,
                    title: '前期工作任务',
                    width: '900px',
                    height: '500px',
                    ondestroy: function (action) {
                        IsSave = this.getIFrameEl().contentWindow.IsSave;
                        
                        if (IsSave) {
                            KeyValue = this.getIFrameEl().contentWindow.KeyValue;
                            TaskName = this.getIFrameEl().contentWindow.TaskName;
                            IsImportant = this.getIFrameEl().contentWindow.IsImportant;
                            IsAbandon = this.getIFrameEl().contentWindow.IsAbandon;
                            
                            that.firstElementChild.innerText = TaskName;
                            if (IsImportant == "1") {
                                that.style.backgroundColor = "red";
                            }
                            if (IsAbandon == "1") {
                                that.style.backgroundColor = "gray";
                            }
                        }
                    }
                })
            });
            // 拖拽改变大小
            currentDom.resizable({
                autoHide: true,
                minHeight: 36,
                minWidth: 150,
                containment: "parent",
                resize: function (event, ui) {
                    jsPlumb.repaint(ui.helper)
                    jsPlumb.repaintEverything()

                }
            });
            currentDom.mouseleave(function () {
                $("img").remove();
            });
        },
        /**
         * 单击删除连线
         *
         */
        clickLine: function () {
            var that = this;
            jsPlumb.bind("click", function (conn, originalEvent) {
                if (!isNew) { return false; }
                // 取消上次延时未执行的方法 
                clearTimeout(lineTimes);
                //执行延时 
                lineTimes = setTimeout(function () {
                    jsPlumb.repaintEverything();
                    var target = originalEvent.toElement;
                    var isOuter = target.getAttribute('class') ? true : false;
                    if (isOuter) {
                        return false;
                    }
                    target.setAttribute('stroke', '#409eff');
                    $(document).keydown(function (event) {
                        event = event || window.event
                        if (event.keyCode == 8 || event.keyCode == 46) {  //8--backspace;46--delete
                            var labelInfo = that.lineIsHasLabel(conn);
                            if (labelInfo.isHasLabel) {
                                labelInfo.currentLabel.remove();
                            }
                            jsPlumb.detach(conn);
                            return false;
                        }
                    })
                }, 50);
            });
            return this;
        },
        /**
         * 双击给线添加label
         *
         */
        dblclickLine: function () {
            var that = this;
            jsPlumb.bind("dblclick", function (conn, originalEvent) {
                if (!isNew) {
                    return false;
                }
                // 取消上次延时未执行的方法 
                clearTimeout(lineTimes);
                //如果连接线有lebel，则获取焦点，如果没有，则添加。                
                var labelInfo = that.lineIsHasLabel(conn);
                if (labelInfo.isHasLabel) {
                    labelInfo.currentLabel.removeClass('label-blur').addClass('label-focus');
                    var oldText = labelInfo.currentLabel.children('.label-text').html();
                    var inputDom = $('<input type="text" class="label-input" value="' + oldText + '"/>')
                    setTimeout(function () {
                        inputDom.focus();
                    }, 50)
                    labelInfo.currentLabel.append(inputDom)
                    return false;
                }
                _index++;
                var left = parseInt(originalEvent.clientX - container.offset().left)
                var top = parseInt(originalEvent.clientY - container.offset().top)
                //var id = that.judgeId("label",_index);
                var id = that.CreateGUID();
                var labelDom = $('<div class="line-label label-focus" id="' + id + '" data-path="' + conn.id + '"><span class="label-text"></span><input type="text" class="label-input"/></div>')
                labelDom.css("left", left).css("top", top);
                var input = labelDom.children('input.label-input');
                setTimeout(function () {
                    input.focus();
                }, 50)
                container.append(labelDom);

                labelDom.keydown(function (event) {
                    event = event || window.event;
                    if (event.keyCode == 13) {
                        var text = input.val();
                        if (!text) {
                            labelDom.remove();
                            return false;
                        }
                        labelDom.children('span').html(input.val());
                        input.remove();
                        labelDom.removeClass('label-focus').addClass('label-blur');
                        return false;
                    }
                });

                // label 可以拖动
                jsPlumb.draggable(id);
                labelDom.draggable({ containment: "parent" });

                // label 的点击事件
                that.labelClick(id);
            });
            return this;
        },
        /**
         * label 事件
         *
         */
        labelClick: function (id) {
            var currentDom = $('#' + id);
            // 单击选中，可删除
            currentDom.click(function () {
                clearTimeout(labelTimes);
                //右上角添加删除图标
                $(this).append('<img src="./public/images/close.png" style="position: absolute;" />');
                $("img").css("top", 0).css("right", 0);
                labelTimes = setTimeout(function () {
                    $("img").click(function (event) {
                        var parentId = $("#" + $(this).parent().attr('id'));
                        parentId.remove();
                        return false;

                    })
                    container.children('.line-label').removeClass('label-focus').addClass('label-blur');
                    currentDom.addClass('label-focus').removeClass('label-blur');
                    var input = $("<input type='text' class='hide-input'/>");
                    setTimeout(function () {
                        input.focus();
                    }, 50)
                    currentDom.append(input);
                    currentDom.keydown(function (event) {
                        event = event || window.event
                        if (event.keyCode == 8 || event.keyCode == 46) {  //8--backspace;46--delete
                            currentDom.remove();
                            return false;
                        }
                    });
                }, 50);
            })
            // 双击添加文字
            currentDom.dblclick(function () {
                // 取消上次延时未执行的方法 
                clearTimeout(labelTimes);
                container.children('.line-label').removeClass('label-focus').addClass('label-blur');
                currentDom.addClass('label-focus').removeClass('label-blur');
                var text = currentDom.children('span').text().replace(/(^\s*)|(\s*$)/g, "") || '';
                currentDom.children('span').html("");
                var input = $("<input type='text' class='label-input' value='" + text + "'/>");
                setTimeout(function () {
                    input.focus();
                }, 50)
                currentDom.append(input);
                currentDom.keydown(function (event) {
                    if (event.keyCode == 13) {
                        currentDom.children('span').html(currentDom.children("input.label-input").val());
                        currentDom.children("input.label-input").remove();
                        currentDom.removeClass('label-focus').addClass('label-blur');
                        return false;
                    }
                });
            });
            // 拖拽改变大小
            currentDom.resizable({
                autoHide: true,
                containment: "parent",
                minHeight: 40,
                minWidth: 70,
            });
            currentDom.mouseleave(function () {
                $("img").remove();
            });
        },
        /**
         * 单击空白处
         *
         */
        documentClick: function () {
            $(document).click(function (e) {
                e = e || window.event;
                var target = e.target || e.srcElement;
                $(document).off('keydown')
                //如果有在编辑的节点，要完成赋值
                var focusNode = $('.node-common.node-focus');
                if (focusNode.length != 0) {
                    var isHasInput = focusNode.children("input.flow-input").length == 0 ? false : true;
                    if (isHasInput) {
                        focusNode.children('span').html(focusNode.children("input.flow-input").val());
                        focusNode.children("input.flow-input").remove();
                        jsPlumb.repaintEverything();
                    }
                }
                var focusLabel = $('.line-label.label-focus');
                if (focusLabel.length != 0) {
                    var labelHasInput = focusLabel.children("input.label-input").length == 0 ? false : true;
                    if (labelHasInput) {
                        var text = focusLabel.children("input.label-input").val();
                        if (!text) {
                            focusLabel.remove();
                            return false;
                        }
                        focusLabel.children('span').html(focusLabel.children("input.label-input").val());
                        focusLabel.children("input.label-input").remove();
                        focusLabel.removeClass('label-focus').addClass('label-blur');
                    }
                }
                //节点，label，连接线取消选中状态
                $('.node-common').removeClass('node-focus');
                $('.line-label').removeClass('label-focus').addClass('label-blur');
                var paths = $('path');
                if (paths.length != 0) {
                    for (var i = 0; i < paths.length; i++) {
                        var item = paths[i];
                        if (item.getAttribute('class')) {
                            continue;
                        }
                        item.setAttribute('stroke', '#000000')
                    }
                }

            })

            return this;
        },
        /**
         * 清空画布
         *
         */
        clearFlow: function () {
            $('#delete').click(function () {
                
                jsPlumb.reset();//删除所有连线，否侧会有重复
                $('#flow-main').html('');
            })
            return this;
        },
        /**
         * 编辑流程图
         *
         */
        editFlow: function () {
            var that = this;
            $('#update').click(function () {
                isNew = true;
                mini.get("add").enable();
                mini.get("delete").enable();
                mini.get("save").enable();
                $("#flow-main .node-common").each(function (idx, elem) {
                    var $elem = $(elem);
                    var id = $elem.attr('id')
                    jsPlumb.addEndpoint(id, { anchors: "BottomCenter" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "TopCenter" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "RightMiddle" }, endpointStyle);
                    jsPlumb.addEndpoint(id, { anchors: "LeftMiddle" }, endpointStyle);
                    jsPlumb.draggable(id);
                    $("#" + id).draggable({ containment: "parent", grid: [10, 10] });
                    that.nodeClick(id);
                });
                $("#flow-main .line-label").each(function (idx, elem) {
                    var $elem = $(elem);
                    var id = $elem.attr('id')
                    jsPlumb.draggable(id);
                    $elem.draggable({ containment: "parent" });
                    that.labelClick(id);
                });
            })
            return this;
        },
        /**
         * 保存流程图
         *
         */
        saveFlow: function () {
            var that = this;
            $('#save').click(function () {
                clearTimeout(saveTimes);
                saveTimes = setTimeout(function () {

                    var connects = [];
                    $.each(jsPlumb.getAllConnections(), function (idx, connection) {
                        if (connection.endpoints[0].anchor.type != undefined || connection.endpoints[1].anchor.type != undefined) {
                            connects.push({
                                connectionId: connection.id,
                                pageSourceId: connection.sourceId,
                                pageTargetId: connection.targetId,
                                sourcePoint: connection.endpoints[0].anchor.type,
                                targetPoint: connection.endpoints[1].anchor.type,
                            });
                        }

                        else {
                            connects.push({
                                connectionId: connection.id,
                                pageSourceId: connection.sourceId,
                                pageTargetId: connection.targetId,
                                sourcePoint: connection.endpoints[0].anchor.anchors[0].type,
                                targetPoint: connection.endpoints[1].anchor.anchors[1].type,
                            });
                        }
                    });
                    connects = connects.reduce(function (prev, element) {
                        if (!prev.find(el=>(el.pageSourceId == element.pageSourceId
                            && el.pageTargetId == element.pageTargetId
                            && el.sourcePoint == element.sourcePoint
                            && el.targetPoint == element.targetPoint))) {
                            prev.push(element)
                        }
                        return prev
                    }, [])
                    ////去重
                    //var a = [];
                    //var connectsCopy = connects.clone();
                    //for (var i = 0; i < connects.length; i++) {
                    //    for (var j = 0; j < connectsCopy.length; j++) {
                    //        if(connectsCopy[j].pageSourceId==connects[i].pageSourceId
                    //            && connectsCopy[j].pageTargetId==connects[i].pageTargetId
                    //            && connectsCopy[j].sourcePoint==connects[i].sourcePoint
                    //            && connectsCopy[j].targetPoint == connects[i].targetPoint) {
                    //            //connects.splice(j, j + 1);

                    //            //delete connectsCopy[j];
                    //            console.log("下标：" + i);
                    //            a.push(connectsCopy[j]);
                    //        }
                            
                    //    }
                    //    if (j == connectsCopy.length) break;
                    //}
                    

                    var blocks = [];
                    $("#flow-main .node-common").each(function (idx, elem) {
                        var $elem = $(elem);
                        var blockId = $elem.attr('id');
                        var blockContent = $elem.children('.node-text').html();
                        blocks.push({
                            blockId: blockId,
                            blockContent: blockContent,
                            type: $elem.data("type"),
                            blockX: parseInt($elem.css("left"), 10),
                            blockY: parseInt($elem.css("top"), 10),
                            width: parseInt($elem.width(), 10) + 24,
                            height: parseInt($elem.height(), 10) + 16,
                            backgroundColor: $elem.css("background-color")
                        });
                    });
                    var lineDescs = [];
                    $("#flow-main .line-label").each(function (idx, elem) {
                        var $elem = $(elem);
                        var lineContent = $elem.children('.label-text').html();
                        lineDescs.push({
                            lineId: $elem.attr('id'),
                            lineContent: lineContent,
                            lineX: parseInt($elem.css("left"), 10),
                            lineY: parseInt($elem.css("top"), 10),
                            width: parseInt($elem.width(), 10) + 24,
                            height: parseInt($elem.height(), 10) + 16,
                            pathId: $elem.data("path")
                        });
                    });
                    var serliza = {
                        connects: connects,
                        blocks: blocks,
                        lineDescs: lineDescs
                    }
                    
                    console.log(serliza);

                    if (mini.get("HZ_PremTemplateManage").getSelected() != undefined) {
                        var data;
                        var params = {};
                        params.KeyWord = "HZ_PremTemplateManage_Dtl";
                        params.KeyWordType = "BO";
                        params.select = "";
                        params.swhere = " MasterId = '" + mini.get("HZ_PremTemplateManage").getSelected().Id + "' ";
                        params.sort = " UpdDate desc ,Version desc";
                        params.index = 0;
                        params.size = 0;
                        params.extparams = "";
                        $.ajax({
                            url: "/Form/GridPageLoad",
                            type: "POST",
                            data: params,
                            async: false,
                            success: function (text) {
                                var o = mini.decode(text);
                                var odata = mini.decode(o.data.value);
                                
                                //根据是否有Id判断是update还是insert
                                if (odata.length > 0) {
                                    data = {
                                        MasterId: mini.get("HZ_PremTemplateManage").getSelected().Id,
                                        DataJson: mini.encode(serliza),
                                        Version: "1.0",
                                        DtlId: odata[0].Id
                                    };
                                } else {
                                    data = {
                                        MasterId: mini.get("HZ_PremTemplateManage").getSelected().Id,
                                        DataJson: mini.encode(serliza),
                                        Version: "1.0",
                                        DtlId: ""
                                    };
                                }
                            }
                        });
                        //控制器保存
                        $.ajax({
                            url: "/HZStandard/SavePremTemplateManageDtl",
                            type: "POST",
                            data: data,
                            cacha: false,
                            async: false,
                            success: function (text) {
                                var o = text;
                                
                            }
                        });
                        //单个删除节点
                        if (delArray.length > 0) {
                            for (var i = 0 ; i < delArray.length; i++) {
                                $.ajax({
                                    url: "/HZStandard/DelPreTasks",
                                    type: "POST",
                                    data: delArray[i],
                                    cacha: false,
                                    async: false,
                                    success: function (text) {
                                        var o = text;
                                    }
                                });
                            }
                            delArray = [];
                        }
                        //清空模板保存同时删除前期任务表中数据
                        if (serliza.blocks.length == 0) {
                            $.ajax({
                                url: "/HZStandard/DelPreTasks",
                                type: "POST",
                                data: {
                                    MasterId: mini.get("HZ_PremTemplateManage").getSelected().Id,
                                    BlockId: ""
                                },
                                cacha: false,
                                async: false,
                                success: function (text) {
                                    var o = text;
                                }
                            });
                        }
                    }

                    //这里只是写了一个简单的保存之后的操作，正常是需要发请求的。请求成功之后，在执行如下操作。
                    layer.confirm('保存成功', function (index) {
                        $('#flow-main').html('');
                        flowData = serliza;
                        isNew = false;
                        that.draw(flowData);
                        layer.close(index);
                        mini.get("add").disable();
                        mini.get("delete").disable();
                        mini.get("save").disable();
                    });
                }, 50)

            })
            return this;
        },
        /**
         * 保存为图片
         *
         */
        saveToImg: function () {
            $('#saveImg').click(function () {
                // 需要转为图片的dom
                var targetDom = container;
                // 将当前页面DOM克隆
                var copyDom = targetDom.clone(true);
                // 将页面中的svg转换为canvas
                copyDom.find('svg').each(function (index, node) {
                    var parentNode = node.parentNode;
                    var svg = node.outerHTML.trim();
                    var canvas = document.createElement('canvas');
                    canvg(canvas, svg, {
                        ignoreAnimation: false,
                        log: true
                    });
                    if (node.style.position) {
                        canvas.style.position += node.style.position;
                        canvas.style.left += node.style.left;
                        canvas.style.top += node.style.top;
                    }
                    parentNode.removeChild(node);
                    $(parentNode).prepend($(canvas));
                });
                // 页面原有dom隐藏，添加克隆dom
                $('.flow-container').prepend(copyDom);
                targetDom.hide();
                // 新建canvas元素
                var canvas2 = document.createElement("canvas");
                var w = targetDom.width();
                var h = targetDom.height();
                //将canvas画布放大若干倍，然后盛放在较小的容器内，就显得不模糊了
                canvas2.width = w * 2;
                canvas2.height = h * 2;
                canvas2.style.width = w + "px";
                canvas2.style.height = h + "px";
                //可以按照自己的需求，对context的参数修改,translate指的是偏移量
                var context = canvas2.getContext("2d");
                context.translate(0, 0);//translate指的是偏移量
                context.scale(2, 2);//scale指的是放大
                html2canvas(copyDom, {
                    canvas: canvas2,
                    onrendered: function (canvas) {
                        console.log([canvas])
                        //使用a 标签下载
                        var a = document.createElement('a');
                        a.setAttribute('href', canvas.toDataURL());
                        a.setAttribute('download', '流程图.png');
                        a.click();
                        a.remove();
                        // 将clone页面删除
                        copyDom.remove();
                        targetDom.show();
                    }
                });
            })
        },
        /**
         * 防止节点id重复
         * @params type Srting 节点类型
         * @params num Number 当前顺序号
         * @return id String 不重复的id
         */
        judgeId: function (type, num) {
            var id = type + num;
            var doms = $('#' + id)
            if (doms.length != 0) {
                _index = num + 1;
                return judgeId(type, _index);
            }
            return type + num;
        },
        CreateGUID: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
				  .toString(16)
				  .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			  s4() + '-' + s4() + s4() + s4();
        },
        /**
         * 判断连接线，是否有label
         * @params conn Object 连线对象
         * @return  Object labelInfo
         */
        lineIsHasLabel: function (conn) {
            var pathId = conn.id;
            var lebelDoms = $('.line-label');
            var isHasLabel = false;
            var currentLabel;
            for (var i = 0; i < lebelDoms.length; i++) {
                var item = lebelDoms.eq(i);
                isHasLabel = item.data('path') == pathId ? true : false;
                if (isHasLabel) {
                    currentLabel = item;
                    break;
                }
            }
            return {
                isHasLabel: isHasLabel,
                currentLabel: currentLabel
            };
        },
        /**
         * 根据数据画流程图
         * @params data Object 流程图数据
         */
        draw: function (data) {
            var blockDoms = data.blocks;
            blockDoms.forEach(function (item, index) {
                var dom = $('<div class="node-common" id="' + item.blockId + '" data-type="' + item.type + '"><span class="node-text">' + item.blockContent + '</span></div>')
                dom.css("left", item.blockX).css("top", item.blockY).css("width", item.width).css("height", item.height).css("background-color", item.backgroundColor);
                var type = item.type;
                switch (type) {
                    case "base":
                        dom.addClass('node-base');
                        break;
                    case "flow":
                        dom.addClass('node-flow');
                        break;
                    case "node":
                        dom.addClass('node-node');
                        break;
                    case "judge":
                        dom.addClass('node-judge');
                        break;
                }
                $('#flow-main').append(dom);
            })
            var connect = data.connects;
            connect.forEach(function (item, index) {
                jsPlumb.ready(function () {
                    jsPlumb.connect({
                        source: item.pageSourceId,
                        target: item.pageTargetId,
                        anchor: [item.sourcePoint, item.targetPoint],
                        endpoint: ["Blank", { radius: 8 }],
                        connectorStyle: connectorPaintStyle,//连接线的颜色，大小样式
                        connectorHoverStyle: connectorHoverStyle,
                        paintStyle: {
                            strokeStyle: "#000000",
                            fillStyle: "transparent",
                            radius: 2,
                            lineWidth: 2
                        },
                        connector: ["Flowchart", { stub: 1, gap: 1, cornerRadius: 3, alwaysRespectStubs: true }],
                        overlays: [["Arrow", { width: 10, length: 10, location: 1 }]],
                        endpointStyle: { fillStyle: 'transparent', strokeStyle: "#000000", lineWidth: 1, radius: 2, },
                        isSource: false,
                        isTarget: false
                    })
                })

            })
            var lineDescs = data.lineDescs;
            lineDescs.forEach(function (item, index) {
                var dom = $('<div class="line-label label-blur" id="' + item.lineId + '" data-path="' + item.pathId + '"><span class="label-text">' + item.lineContent + '</span></div>')
                dom.css("left", item.lineX).css("top", item.lineY);
                dom.css("width", item.width).css("height", item.height);
                $('#flow-main').append(dom);
            })
        },
    }
    // main.init();
    //main.draw(data);
})();


