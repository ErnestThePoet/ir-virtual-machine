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
在虚拟机上进行大量的测试以后，我也发现了现有的虚拟机程序（irsim）在代码执行上的的一些bug或不合理之处。例如，`RETURN`指令后面是一个从未出现过的变量名时，虚拟机竟然会现场定义这个变量，不报告任何错误；IR整数变量的长度是32位，虚拟机却能正常存储超过其表示范围的值；指导书要求变量命名规范与之前相同，虚拟机却能接受`62x`这样的变量名。
- **现有虚拟机的交互体验尚待提高**  
此外，现有虚拟机程序虽然功能完善，但我认为其交互体验仍然可以提高，在某些交互细节的处理上也有一定欠缺。比如，每次运行结束后通过模态弹框提示结果，这使得再次运行或加载新文件之前必须手动关掉该对话框；同时，若在选择文件界面取消了选择，则程序会崩溃退出。而且，要想运行虚拟机，还需进行环境配置。最后，我个人希望虚拟机可以支持全局变量的使用，虽然指导书上已经假设程序中不存在全局变量。

或许，当年虚拟机程序的作者如今已身居要职，已没有精力回过头来完善他多年前写成的程序。那么，我们为什么不使用更现代的技术，去写一个能完全兼容课本规范的、更好的IR虚拟机呢？

## 特点
- ✅给出了精确的IR语法定义
- ✅支持批量加载IR代码文件，**可直接将多个IR文件拖入**
- ✅交互界面友好，IR代码编辑器支持语法高亮、智能补全、搜索替换与可视化错误提示等多种功能
- ✅以标签页的形式切换多个虚拟机实例
- ✅支持全局变量的定义与使用
- ✅完善的错误检查，详细的错误提示
- ✅在线运行，无需配置环境
- ✅完整展示全局变量表和调用栈中所有函数的局部变量表
- ✅可设置的运行选项：最大执行步数限制（防止无限循环/递归）；虚拟机内存大小、栈大小
- ✅良好的移动端适配
- ✅**提供CLI命令行版本供自动化测试使用**

## 使用方法
### 导入`.ir`文件
打开虚拟机页面后，您可以通过以下任何一种方式开始使用虚拟机：
- 使用左侧菜单中的`新建`选项，创建一个空白的`.ir`文件
- 使用左侧菜单中的`导入`选项，导入想要运行的本地`.ir`文件
- 直接将本地的`.ir`文件拖入页面中
- 使用左侧菜单中的`示例`选项，在对话框中选取您感兴趣的示例IR程序

对于每个导入的`.ir`文件，系统都会创建一个新的虚拟机实例，您可以在页面中以标签页的形式切换这些实例。

### 编辑IR代码
虚拟机实例界面的左侧是IR代码编辑器，它使用的是与VSCode同款的[Monaco Editor](https://github.com/microsoft/monaco-editor)，支持IR代码的语法高亮、智能补全、搜索（`Ctrl+F`）、替换（`Ctrl+H`）、切换注释（`Ctrl+/`）与可视化错误提示等多种功能。您可以在其中编辑IR代码，并且方便地发现和修正IR代码的静态检查错误。

### 运行IR代码
虚拟机实例界面的中间是虚拟机控制台。点击控制台顶部的`运行`按钮，虚拟机将运行IR程序；点击`单步`按钮，虚拟机则将一步一步执行IR程序。在单步执行过程中，点击`运行`按钮可以切换到连续运行模式。当执行到`READ`指令时，控制台中会显示输入提示消息，您完成输入后按下`Enter`键即可。虚拟机采用流式输入，您可以在一行中用任意空白符号分隔多组数据。程序执行结束时，控制台会输出程序`main`函数的返回值和运行统计信息。  
新创建的虚拟机处于`初始`状态，此状态下可以点击`运行`或`单步`按钮开始虚拟机的运行。IR程序执行完毕后，虚拟机会处于`正常退出`或`不正常退出`状态，在这些状态下都可以直接点击`运行`或`单步`按钮，开始下一轮运行。在开始执行前，虚拟机将首先对IR程序进行静态检查，如果存在错误，则会变为`IR静态分析错误`状态；运行时遇到错误，虚拟机将进入`运行时错误`状态；运行步数超过设置的上限值，虚拟机就会进入`达到步数限制`状态。在这些状态下，不能继续运行虚拟机，需要点击控制台上方的`重置`按钮将虚拟机恢复到`初始`状态。

### 修改虚拟机设置
虚拟机实例界面的右侧是虚拟机监视器，在其中可以设置虚拟机的执行步数上限和内存大小，也可以查看虚拟机当前的运行状态、执行步数、内存使用和变量表。  
只有当虚拟机处于`初始`状态时，您才可以修改虚拟机的设置。如果您不希望限制虚拟机的执行步数，则可以将执行步数上限设置为`0`。

## IR程序样例
IR虽然简单，其实无所不能。难道你不想试试左侧菜单中`示例`选项里那些有意思的IR程序吗~  
注：示例IR程序及其cmm源代码位于仓库的`public\demos`目录下

## 虚拟机信息
- 小端序
- 机器字长：32位
- 模拟`cdecl`调用约定

## IR语法定义
注：下方IR语法定义在《编译原理实践与指导教程》（许畅，陈嘉，朱晓瑞编著.机械工业出版社）中的描述之上，进行了进一步的精确定义，**与书中的语法完全兼容**，并新增了对注释语句的支持和一条全局变量声明指令。

- 定义`ID`为符合C语言标准的标识符名称：  
`ID = [a-zA-Z_](\w)*`  
- 定义`Imm`为一个立即数（32位有符号整数，若超过范围`[-2^31, 2^31-1]`，高位将被截断）：  
`Imm = #(-)?(\d)+`  
- 定义`Size`为分配空间字节数（32位有符号整数，若超过范围`[-2^31, 2^31-1]`，高位将被截断），必须是正整数且为4的倍数：  
`Size = (\d)+`  
- 定义`Singular`为一个一元值，它要么是一个立即数，或者是`ID`本身，或者是前置了一个解引用运算符`*`或取地址运算符`&`的`ID`。`*ID`表示以`ID`的值为地址的32位有符号整数，`&ID`表示`ID`的地址：  
`Singular -> Imm | ID | *ID | &ID`  
- 定义`BinaryMathOp`为二元四则运算符之一：  
`BinaryMathOp -> + | - | * | /`
- 定义`BinaryRelOp`为二元关系运算符之一：  
`BinaryRelOp -> == | != | < | <= | > | >=`
- 定义`LValue`为可出现在赋值符号左侧的值：  
`LValue -> ID | *ID`
- 定义`RValue`为一个可出现在赋值符号右侧的值（除了函数调用）。第二个候选式中，各个元素之间均由至少一个空格或制表符`'\t'`隔开：  
`RValue -> Singular | Singular BinaryMathOp Singular`
- 定义`CondValue`为一个可出现在`IF`指令条件处的值。各个元素之间均由至少一个空格或制表符`'\t'`隔开：  
`CondValue -> Singular BinaryRelOp Singular`

中间代码（IR）程序是由一行或多行IR指令组成的。所有合法的IR指令的语法定义如下表所示。一行IR指令内各个元素之间均由至少一个空格或制表符`'\t'`隔开，每行开头和结尾可以有任意多个空格或制表符`'\t'`。IR程序是大小写敏感的。

|IR指令语法|描述|
|------------|------------|
|FUNCTION **ID** :|定义一个名为**ID**的函数。IR程序中必须有一个名为`main`的函数作为虚拟机执行的入口|
|**LValue** := **RValue**|赋值；若**LValue**为**ID**且该**ID**未被定义过，则在赋值之前将其作为当前函数的一个局部变量进行空间分配|
|DEC **ID** **Size**|在栈上分配一块指定大小的连续的空间，**ID**代表存储在该空间最低4字节的整数。用于在函数内部声明数组或结构体，也可用于声明整数变量。其占用的内存空间初始时为随机内容|
|GLOBAL_DEC **ID** **Size**|在全局变量存储区分配一块指定大小的连续的空间，**ID**代表存储在该空间最低4字节的整数。用于声明全局整数变量、数组或结构体，*这是本虚拟机新增的一条IR指令*。其占用的内存空间被全部初始化为0。全局变量的作用域为整个IR程序，与声明位置无关|
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
|（空）|空行，将被忽略|
|;<任意内容>|注释，将被忽略|

## CLI版本虚拟机
本虚拟机也提供了CLI（命令行界面）版本，可在命令行中执行IR文件，并用来进行IR程序的自动化测试。仓库内`cli`子目录下是虚拟机CLI版本的源代码，其中`build/irvm.mjs`是已经打包构建好的CLI程序，可以复制到任何目录下使用。
### 使用方法
首先需要安装[最新版Node.js](https://nodejs.org/en/download)。  
进入`irvm.mjs`所在目录，使用以下命令运行虚拟机CLI：
```
node irvm.mjs [-h] [-p] [-s] [-t] [-r] [-l {en,zh-cn}] irFile
```
- 必须参数
  - `irFile`：要执行的IR文件路径
- 可选参数
  - `-h, --help`：展示帮助
  - `-p`：将输入时的提示文字打印到`stdout`，不提供此参数则不打印
  - `-s`：执行结束后，将执行步数打印到`stdout`，便于机器解析。不提供此参数则不打印
  - `-t`：执行结束后，将执行耗时（以毫秒为单位）打印到`stdout`，便于机器解析。不提供此参数则不打印
  - `-r`：执行结束后，将`main`函数返回结果和统计信息以自然语言打印到`stdout`，便于人类阅读。不提供此参数则不打印
  - `-l {en,zh-cn}, --locale {en,zh-cn}`：CLI程序的界面语言，默认为`zh-cn`

当IR程序正常退出（`main`函数返回值为`0`）时，`node`进程的返回值同样是`0`；否则，`node`进程的返回值就是`main`函数的返回值。如果CLI程序在执行时发生了错误，则进程不会返回`0`。

### 使用示例
- 运行IR程序，打印输入提示和人类可读的执行统计：
```
node irvm.mjs rand.ir -p -r
```
- 运行IR程序，不打印输入提示和执行统计：
```
node irvm.mjs rand.ir
```
- 运行IR程序，将`stdout`上的输出写入文件：
```
node irvm.mjs rand.ir > out.txt
```
- 运行IR程序，从文件读取输入，将`stdout`上的输出写入文件，并输出机器可读的执行步数（Windows CMD/PowerShell环境）：
```
type in.txt | node irvm.mjs rand.ir -s > out.txt
```
- 上一个示例的Linux环境命令：
```
cat in.txt | node irvm.mjs rand.ir -s > out.txt
```
CLI版虚拟机同样以流的方式读取输入，控制台或者输入文件中的各个数据之间可用任意空白符号分隔。**注意输入文件中的数据数量不能少于程序将要读取的数据数量。**

## 一些设计理念与讨论
- **全局变量相互不能重名，同一函数内的变量、形参相互不能重名，函数内的变量、形参可以但不建议和全局变量重名，不同函数内的变量、形参可以但不建议重名**  
IR中的变量真的没有作用域吗？其实这样规定欠妥。如果变量真的没有作用域，那么在出现直接递归的情况下，就必须为每次调用新开辟一个局部变量表，以确保上层函数中的局部变量不会受到本层调用的影响。那么，对于复杂的间接递归的情形呢？显然，合理的做法是为每次函数调用都在栈中新建一个局部变量表。如此，IR中的变量就确实有作用域了。  
我想，归根到底，IR还不是目标代码，只是一种很接近底层的、语法简单规整的比较高级的语言。IR程序中的变量并不代表某个寄存器或某片确定的内存空间，其与C语言中的变量并没有本质区别。
- **变量、函数和标签之间可以但不建议重名**  
为何？因为中间代码涉及这三者的语法没有任何交集，重名并不会引发任何歧义，只是不利于人本身对代码的阅读。
- **为何在这个虚拟机里面看到的指令执行条数比在irsim中的少？**  
因为本虚拟机并不实际执行`FUNCTION`和`LABEL`指令，也不会将它们计算在执行步数内。而据本人观察，irsim不计入除了`main`函数外的所有`FUNCTION`指令，且会计入所有顺序执行到的`LABEL`指令。这就会使得部分中间代码在本虚拟机上显示的执行步数略少于在irsim上的。那么，到底哪一种较为合理呢？我认为，不考虑虚拟机对每条指令的具体实现，单就语义层面来看，`FUNCTION`和`LABEL`起到的都只是代码标号的作用，并不代表一次执行，因此不将它们计入执行步数是合理的。除此之外，本虚拟机的计步策略与irsim相同，可以放心地用来评估中间代码优化的成效。
- **单步执行中，被标注的那一行代表？**  
代表的是下一条要被执行的指令，也就是再次点击单步执行后被执行的指令。注：irsim中，高亮的行是刚才执行完的指令，我认为自己的实现更直观，也更符合逻辑。
- **全局变量声明指令的执行逻辑？**  
所有全局变量声明指令都在进入main函数之前执行，并计入执行步数。假如全局变量声明指令出现在了函数内部，那么在之后执行时，全局变量声明指令就会被跳过（但是根据C--语法生成的全局变量声明指令是不应该出现在一个函数内部的）。全局变量占用的内存空间被全部初始化为0。全局变量的作用域为整个IR程序，与声明位置无关。即使一行IR指令引用的全局变量是在它下面声明的，它也可以正常访问到该全局变量。
- **让我的实验三代码能生成全局变量声明指令容易吗？**  
特别简单，针对`ExtDef → Specifier ExtDecList SEMICOLON`这条产生式生成`GLOBAL_DEC`指令即可。

## 一些脑洞操作的讨论
- **IR指令中的立即数过大会怎么样？**  
本虚拟机的机器字长是32位，IR变量的类型都是补码表示的32位有符号整数（使用`DEC`或`GLOBAL_DEC`指令声明的数组或结构体变量虽然可以占据更多的空间，但其变量名代表的是存储在其中最低4字节的整数）。同惯常的实现一样，当立即数或从控制台读入的整数超过范围`[-2^31, 2^31-1]`时，其二进制表示中超出的高位部分将被截断；考虑到JavaScript语言自身的限制，为了防止丢失精度，当立即数或从控制台读入的整数超过范围`[-(2^53-1), 2^53-1]`时，虚拟机将发生一个指令解码错误或运行时错误。
- **函数里没有`RETURN`指令会怎么样？**  
本虚拟机模拟了x86的`cdecl`调用约定，`ARG`指令将参数逐个压入栈中，函数的`PARAM`指令从栈中逐个读取参数，`RETURN`指令代替调用者恢复寄存器、清理堆栈，并使`eip`指向返回地址。如果没有`RETURN`语句，虚拟机将从当前位置继续向后执行IR指令，其后果是无法预料的。当然，任何运行时错误都会被虚拟机检测到并报告。  
**注意：如果虚拟机报错`从地址xx处读入指令超出了指令地址空间`，请首先检查定义在最下方的函数是否没有`RETURN`指令。**
- **函数的`PARAM`指令和调用时的`ARG`指令数量不等会怎么样？**  
`ARG`指令更多则`PARAM`只会读到最后压入的几个参数；`PARAM`指令更多则多出来的`PARAM`指令会读到属于调用者的栈，可能引发内存访问越界错误。
- **只有`ARG`而后面没有`CALL`会怎么样？**  
会浪费一点栈空间。

## 一些实现细节
- **等待控制台输入是如何实现的？**  
使用JavaScript的异步编程实现。虚拟机的单步执行和连续执行方法都是`async`异步函数，其内部运行到读取控制台输入时，将`await`一个等待读取控制台输入的函数。该函数返回一个`Promise`，用户按下`Enter`键后，将调用这个期约的`resolve`函数将其落定，此时`await`结束，后面原本被挂起的代码继续执行，这样就实现了等待控制台的输入。
- **虚拟机的内存模型**  
虚拟机的内存被分为栈内存和全局变量内存，栈空间从内存最高地址向下增长，全局变量空间从内存最低地址向上增长。指令被单独存放在其他地方。虚拟机的所有内存都是可读可写的，有栈溢出检查和全局变量溢出检查。详细的内存模型可以在`src/modules/vm/vm.ts`的注释里找到。
- **较多输出时提升性能的关键**  
浏览器的界面重绘是特别耗时间的。因此，不能简单地在虚拟机有一条输出的时候就更新一次界面。虚拟机使用了一个输出缓冲区，虚拟机的所有输出都被放入这个缓冲区中，由虚拟机实例的使用方来决定什么时候读取并清空缓冲区，然后将其内容更新到界面上。

## 虚拟机性能
本虚拟机的性能经过多轮次的精心优化，目前的性能测试结果如下：  
- 测试环境
  - OS: Windows 10 64-bit 22H2
  - CPU: i5-11260H
  - 浏览器: Edge 122

运行示例IR程序中的`Benchmark`，本虚拟机执行步数为`990004`，耗时约为`102`毫秒，合计约`970.6`万指令/秒；irsim执行步数`990006`，耗时约`6.2`秒，合计约`16.0`万指令/秒。

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
- Step3: 打开`src/App.tsx`，在文件里含有`Add new theme import here`指示的地方照例添加对新主题`scss`文件的导入。
- Step4: 在本地进行测试，然后提交PR即可。不要在本地进行构建。完成！

## How to add a new theme
- Step1: Go to `src/themes`, and create a `yourThemeName.scss` file. Then copy the content of `light.scss` into your created file, modify colors, and DO REMEMBER to rename the class selector.
- Step2: Open `src/themes/index.ts`, add an entry where there's an `Add new theme entry here` mark. Note that the `className` property must match the name of your theme's class selector.
- Step3: Open `src/App.tsx`, add an import for the new `.scss` file where there's an `Add new theme import here` mark.
- Step4: Test your new theme and create a pull request. Don't run build. That's done!

## 写在后面
今天是2024年的3月25日，从我开始开发这个项目算起，已经快要过去一年了。这几天，我大幅度重构了项目的代码，把虚拟机的性能提升了将近10倍，添加了很多IR示例程序，引入了强大的Monaco编辑器组件代替原先我手写的编辑器，还做了虚拟机的CLI版本。我的编译原理课程明明早已结束，这个项目的代码也有八个多月没有更新了，最近为什么又“朝花夕拾”了呢？  
——因为，从某种意义上来说，这个项目，是我大学四年来学习成长的一次总检验。  
客观地说，这个项目的规模并不算大，代码量也并不多，我只花了10天左右的时间就发布了第一个版本。但是，这个项目，代表了我一直以来“保持热爱，奔赴山海”的做事风格。当意识到我可以用自己的技能解决一个问题，让一件事情变得更好的时候，我就会激动得不能自已，并且马上开展行动。去年在做编译原理实验三的时候，我萌生了弥补irsim的所有不足，做一个全新的Web版虚拟机的想法，于是就毫不犹豫地创建了这个项目。之后的十天里，我每天都迸发着“兴酣落笔摇五岳，诗成笑傲凌沧州”的激情，敲下每一行代码时，指尖都跃动着欣喜。我相信，自己一定能让同学们在验收的时候，都用上这个更好的虚拟机——我做到了。能用自己的双手创造出新的事物，给这个世界带来一点小小的改变——多么让人感到快乐与幸福呀！从高中第一次接触编程到今天，我对编程的热爱从未减退，我写每一行代码的初心也都未曾改变。  
同时，这个项目的六千多行代码里，也融入着我大学四年来沉甸甸的收获。编译系统课程为我揭开了编译器的神秘面纱，并且让这个项目在我的世界里生根发芽；我无比热爱的前端开发，让我有能力以最主流、最现代的方式去开发这个更好、更强的虚拟机；我在CSAPP和计算机组成原理课上学到的硬件底层知识，让我能够使用JavaScript语言正确、高效地实现一个中间代码执行引擎，并且完全使用C--中的32位有符号整数的运算去实现32位、64位无符号整数的运算，扩展了C--语言能力的边界，进而编译出了许多更复杂也更有趣的IR示例程序；我在密码学课程上学到的专业知识，给了我使用C--去实现各种密码学算法和优化虚拟机性能的兴趣和动力……  
去年，我在求职简历中，把这个项目写在了首位。凭着这份简历，我收获了一次宝贵的实习机会，并且在秋招期间拿到了多份大厂的前端开发offer。收到第一份offer的时候，我不禁回想自己第一次写前端时的迷茫与好奇，想到自己大二做的那次只有一个人来听的前端开发讲座，第一次把[自动机可视化项目](https://github.com/ErnestThePoet/Automata-Playground)分享给大家时的欣喜，还有在编译原理实验课上看到所有人都在用我开发的虚拟机验收时，那难以言说的成就感与幸福……我告诉自己，一步一步走来，春种一粒粟，秋收万颗子；今天的收获，是我在每一个日子里默默扎根、辛勤耕耘的结果，它们是我应得的。  
所以，这个项目，是我的渡船。我乘着月光，追随热爱，一路而来；行至津渡，便搭上这艘船，渡往充满迷雾的对岸，去探寻更加辽阔的诗和远方。  
燕子归来，陌上花开。希望所有人都能得遂所愿！