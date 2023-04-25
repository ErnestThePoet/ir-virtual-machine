# IR Virtual Machine
### 用于南京大学/哈尔滨工业大学《编译原理》实验的Web版中间代码虚拟机

#### 虚拟机访问地址
- [Github Pages访问](https://ernestthepoet.github.io/ir-virtual-machine/)
- [Gitee Pages访问](https://ecui.gitee.io/ir-virtual-machine/)
#### 仓库地址
- [Github仓库](https://github.com/ErnestThePoet/ir-virtual-machine)
- [Gitee仓库](https://gitee.com/ecui/ir-virtual-machine)

## 为什么我要做这个项目？  
- **实验指导书上没有给出的中间代码语法的严格定义**  
在进行编译原理实验三的过程中，当我想尝试一些中间代码的优化方式时，我时常疑惑我想要用的那些写法是否合法。比如，`ARG`和`WRITE`指令的右边能不能直接写一个解引用或取地址，例如`WRITE *t1`？实验指导书对IR语法的描述已经比较详尽了，可惜一些细节上仍然没有说明白。为此，我不得不逐个编写IR文件，在虚拟机程序上验证我的猜想。
- **现有虚拟机程序存在一些bug或不合理之处**  
在虚拟机上进行大量的测试以后，我也发现了现有的虚拟机程序在代码执行上的的一些bug或不合理之处。例如，`RETURN`指令后面是一个从未出现过的变量名时，虚拟机竟然会现场定义这个变量，不报告任何错误；IR整数变量的长度是32位，虚拟机却能正常存储超过其表示范围的值；指导书要求变量命名规范与之前相同，虚拟机却能接受`62x`这样的变量名。
- **现有虚拟机的交互体验尚待提高**  
此外，现有虚拟机程序虽然功能完善，但我认为其交互体验仍然可以提高，在某些交互细节的处理上也有一定欠缺。比如，每次运行结束后通过模态弹框提示结果，这使得再次运行或加载新文件之前必须手动关掉该对话框；同时，若在选择文件界面取消了选择，则程序会崩溃退出。而且，要想运行虚拟机，还需进行环境配置。最后，我个人希望虚拟机可以支持全局变量的使用，虽然指导书上已经假设程序中不存在全局变量。

或许，当年虚拟机程序的作者如今已身居要职，已没有精力回过头来完善他多年前写成的程序。那么，为什么不使用更现代的技术，去写一个能完全兼容课本规范的、更好的IR虚拟机呢？

## 特点
- ✅给出了精确的IR语法定义
- ✅支持批量加载IR代码文件，**可直接将多个IR文件拖入**
- ✅以标签页的形式切换多个虚拟机实例
- ✅支持全局变量的定义与使用
- ✅完善的错误检查，详细的错误提示
- ✅在线运行，无需配置环境
- ✅友好的交互界面
- ✅完整展示全局变量表和调用栈中所有函数的局部变量表
- ✅可设置的运行选项：最大执行步数限制（防止无限循环/递归）；虚拟机内存大小、栈大小
- ✅良好的移动端适配

## 虚拟机信息
- 小端序
- 机器字长：32位
- 模拟`cdecl`调用约定

## IR语法定义
注：下方IR语法定义在《编译原理实践与指导教程》（许畅，陈嘉，朱晓瑞编著.机械工业出版社）中的描述之上，进行了进一步的严格定义，与书中的语法完全兼容，并新增了一条全局变量声明指令。

- 定义`ID`为符合C语言标准的标识符名称：  
`ID = [a-zA-Z_](\w)*`  
- 定义`Imm`为一个立即数（32位有符号整数，若超过范围`[-2^31, 2^31-1]`，高位将被截断；若超过范围`[-(2^53-1), 2^53-1]`，将导致指令解码错误）：  
`Imm = #(-)?(\d)+`  
- 定义`Size`为分配空间字节数（32位无符号整数，若超过虚拟机相应内存区域大小，将导致运行时错误），必须是正整数且为4的倍数：  
`Size = (\d)+`  
- 定义`Singular`为一个一元值，它要么是一个立即数，或`ID`本身，或前置了一个解引用运算符`*`或取地址运算符`&`的`ID`。`*ID`表示以`ID`的值为地址的32位有符号整数，`&ID`表示`ID`的地址：  
`Singular -> Imm | ID | *ID | &ID`  
- 定义`BinaryMathOp`为二元四则运算符之一：  
`BinaryMathOp -> + | - | * | /`
- 定义`BinaryRelOp`为二元关系运算符之一：  
`BinaryRelOp -> == | != | < | <= | > | >=`
- 定义`LValue`为可出现在赋值符号左侧的值：  
`LValue -> ID | *ID`
- 定义`RValue`为一个可出现在赋值符号右侧的值（函数调用在表中被单独列出）：  
`RValue -> Singular | Singular BinaryMathOp Singular`
- 定义`CondValue`为一个可出现在`IF`指令条件处的值：  
`CondValue -> Singular BinaryRelOp Singular`

中间代码（IR）是由一行或多行IR指令组成的。所有合法的IR指令的语法定义如下表所示。请注意一行IR指令内各个元素之间均由**一个**空格或制表符`'\t'`隔开。

|IR指令语法|描述|
|------------|------------|
|FUNCTION **ID** :|定义一个名为**ID**的函数。IR程序中必须有一个名为`main`的函数作为虚拟机执行的入口|
|**LValue** := **RValue**|赋值；若**LValue**为**ID**且该**ID**未被定义过，则在赋值之前将其作为当前函数的一个局部变量进行空间分配|
|DEC **ID** **Size**|在栈上分配一块指定大小的连续的空间，**ID**代表存储在该空间前4字节的整数。用于在函数内部声明数组或结构体，也可用于声明整数变量|
|GLOBAL_DEC **ID** **Size**|在全局变量存储区分配一块指定大小的连续的空间，**ID**代表存储在该空间前4字节的整数。用于声明全局整数变量、数组或结构体，*这是本虚拟机新增的一条IR指令*|
|LABEL **ID** :|定义一个名为**ID**的标号|
|GOTO **ID**|无条件跳转，跳转目标是名为**ID**的标号的下一条指令|
|IF **CondValue** GOTO **ID**|条件跳转，若**CondValue**为真，则跳转目标是名为**ID**的标号的下一条指令；否则继续执行下一条IR指令|
|ARG **Singular**|传递一个实参。最后一个被`ARG`指令传递的实参将对应第一条`PARAM`指令读取到的形参值|
|PARAM **ID**|声明一个名为**ID**的函数形参|
|CALL **ID**|调用名为**ID**的函数并忽略返回值|
|**LValue** := CALL **ID**|调用名为**ID**的函数并存储返回值到**LValue**中；若**LValue**为**ID**且该**ID**未被定义过，则在被调用的函数返回后，将其作为当前函数的一个局部变量进行空间分配|
|RETURN **Singular**|退出当前函数并返回给定值|
|READ **LValue**|从控制台读取一个整数储存在给定变量中；若**LValue**为**ID**且该**ID**未被定义过，则将其作为当前函数的一个局部变量进行空间分配|
|WRITE **Singular**|向控制台输出给定整数|

## 一些设计理念与讨论
- **全局变量相互不能重名，同一函数内的变量相互不能重名，函数内变量不能和全局变量重名，不同函数内的变量可以但不建议重名**  
（IR中的变量真的没有作用域吗？其实这样规定欠妥。如果变量真的没有作用域，那么在出现直接递归的情况下，就必须为每次调用新开辟一个局部变量表，以确保上层函数中的局部变量不会受到本层调用的影响。那么，对于复杂的间接递归的情形呢？显然，合理的做法是为每次函数调用都在栈中新建一个局部变量表。如此，IR中的变量就确实有作用域了。）
- **变量、函数和标签之间可以但不建议重名** 
（为何？因为中间代码涉及这三者的语法没有任何交集，重名并不会引发任何歧义，只是不利于人本身对代码的阅读）
- **为何在这个虚拟机里面看到的指令执行条数比在irsim中的少？**  
因为本虚拟机并不实际执行`FUNCTION`和`LABEL`指令，也不会将它们计算在执行步数内。而据本人观察，irsim不计入除了`main`函数外的所有`FUNCTION`指令，且会计入所有`LABEL`指令。这就会使得部分中间代码在本虚拟机上显示的执行步数略少于在irsim上的。那么，到底哪一种较为合理呢？我认为，不考虑虚拟机对每条指令的具体实现，单就语义层面来看，`FUNCTION`和`LABEL`起到的都只是代码标号的作用，并不代表一次执行，因此不将它们计入执行步数是合理的。除此之外，本虚拟机的计步策略与irsim相同，可以放心地用来评估中间代码优化的成效。
- **单步执行中，被标注的那一行代表？**  
代表的是下一条要被执行的指令，也就是再次点击单步执行后被执行的指令。注：irsim中，高亮的行是刚才执行完的指令，我认为自己的实现更直观，也更符合逻辑。
- **让我的实验三代码能生成全局变量指令容易吗？**  
特别简单，修改一下处理语法树`ExtDecList`结点的代码即可。

## 一些脑洞操作的讨论
- **函数里没有`RETURN`指令会怎么样？**  
本虚拟机模拟了x86的`cdecl`调用约定，`ARG`指令将参数逐个压入栈中，函数的`PARAM`指令从栈中逐个读取参数，`RETURN`指令代替调用者恢复寄存器、清理堆栈，并使`eip`指向返回地址。如果没有`RETURN`语句，虚拟机将从当前位置继续向后执行IR指令，其后果是无法预料的。当然，任何运行时错误都会被虚拟机检测到并报告。
- **函数的`PARAM`指令和调用时的`ARG`指令数量不等会怎么样？**  
`ARG`指令更多则`PARAM`只会读到最后压入的几个参数；`PARAM`指令更多则多出来的`PARAM`指令会读到属于调用者的栈，可能引发内存访问越界错误。

## 一些实现细节
- **等待控制台输入是如何实现的？**  
使用JavaScript的异步编程实现。虚拟机的单步执行和连续执行方法都是`async`异步函数，其内部运行到读取控制台输入时，将`await`一个等待读取控制台输入的函数。该函数返回一个`Promise`，用户按下`Enter`键后，将调用这个期约的`resolve`函数将其落定，此时`await`结束，后面原本被挂起的代码继续执行，这样就实现了等待控制台的输入。
- **虚拟机的内存模型**  
虚拟机的内存被分为栈内存和全局变量内存，栈空间从内存最高地址向下增长，全局变量空间从内存最低地址向上增长。指令被单独存放在其他地方。虚拟机的所有内存都是可读可写的，有栈溢出检查和全局变量溢出检查。详细的内存模型可以在`src/modules/vm/vm.ts`的注释里找到。

## 虚拟机的逻辑结构和源代码结构
### 虚拟机的逻辑结构
```

    ----------------------------------
    |                                |
    |               MMU              |
    | (名字挺吓人的，实际上只负责内存读写) |
    |     srcs/modules/vm/mmu.ts     |
    |                                |
    ----------------------------------
                    |
    ----------------------------------   ------------------------------
    |                                |   |                            |
    |               VM               |   |            ALU             |
    |  (虚拟机主模块，执行指令、处理IO)   |---| (进行32位整数的算术和逻辑运算) |
    |     srcs/modules/vm/vm.ts      |   |   srcs/modules/vm/alu.ts   |
    |                                |   |                            |
    ----------------------------------   ------------------------------
                    |
    ----------------------------------
    |                                |
    |            Decoder             |
    |  (静态检查IR指令并解码为可执行指令) |
    |   srcs/modules/vm/decoder.ts   |
    |                                |
    ----------------------------------

```
### 主要源代码的逻辑结构
```

    -------  -------         -------
    | VM0 |  | VM1 |   ...   | VMn |
    -------  -------         -------
       |        |               |
    ----------------------------------------------
    |                                            |
    |   VMContainer                              |
    |   (容纳多个VM实例的容器)                      |
    |   srcs/modules/vmContainer/vmContainer.ts  |
    |                                            |
    ----------------------------------------------
        ^             |
        | 映射         | syncVmState() 进行状态同步
        v             v
    ----------------------------------------------
    |                                            |
    |   VmState.vmPageStates                     |
    |   (各VM实例的UI状态，Redux Store)            |
    |   VmState.activeVmIndex为当前标签页VM的下标   |
    |   srcs/store/reducers/vm/vm.ts             |
    |                                            |
    ----------------------------------------------

```

## 如何添加一种语言
- Step1: 进入`src/locales`，以您语言的缩写为文件名新建一个`.ts`文件。然后将`en.ts`的内容粘贴进去，进行各个字符串的翻译，并修改被导出的变量名。
- Step2: 打开`src/locales/index.ts`，在文件顶端含有`Add new language import here`指示的地方引入您刚才创建的模块，然后在文件下面的`locales`变量里有`Add new language entry here`指示的地方照例添加一个记录。
- Step3: 在本地进行测试，然后提交PR即可。不要在本地进行构建。完成！

## How to add a new language
- Step1: Go to `src/locales`, and create a `.ts` file named by your language. Then copy the content of `en.ts` into your created file, do translations, and rename the exported variable.
- Step2: Open `src/locales/index.ts`, find `Add new language import here` and add an import of your previously created module. Next add an entry into `locales` where there's an `Add new language entry here` mark.
- Step3: Test your new language and create a pull request. Don't run build. That's done!

## 如何添加一个主题
- Step1: 进入`src/themes`，新建一个`主题名.scss`文件。然后将`light.scss`的内容粘贴进去，修改各个颜色，并一定要修改类选择器的名字。
- Step2: 打开`src/themes/index.ts`，在文件里含有`Add new theme entry here`指示的地方照例添加一个记录。注意记录对象的`className`属性一定要和刚才`scss`文件里类选择器的名字相同。
- Step3: 在本地进行测试，然后提交PR即可。不要在本地进行构建。完成！

## How to add a new language
- Step1: Go to `src/themes`, and create a `yourThemeName.scss` file. Then copy the content of `light.scss` into your created file, modify colors, and DO REMEMBER to rename the class selector.
- Step2: Open `src/themes/index.ts`, add an entry where there's an `Add new theme entry here` mark. Note that the `className` property must match the name of your theme's class selector.
- Step3: Test your new theme and create a pull request. Don't run build. That's done!
