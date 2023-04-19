# IR Virtual Machine
### 用于南京大学/哈尔滨工业大学《编译原理》实验的Web版中间代码虚拟机

## 为什么我要做这个项目？  
——因为，实验指导书上给出的中间代码格式较为模糊，当我疑惑某些语法是否合法时，不得不在虚拟机程序上逐个验证。在大量试验中，本人也发现了现有虚拟机程序在代码执行上的的一些bug。此外，虚拟机程序虽然功能完善，但我认为其在交互性上存在一定缺陷，操作较为繁琐，而且在运行之前还需进行环境配置。最后，我个人希望虚拟机可以支持全局变量的使用，虽然指导书上已经假设程序中不存在全局变量。或许，当年虚拟机程序的作者如今已经身居要职，没有精力继续完善他的程序。那么，就该轮到我去做一个能完全兼容课本规范的、更好的IR虚拟机了。

## 特点
- 支持批量加载IR代码文件
- 给出了精确的IR语法定义
- 支持全局变量的定义与使用
- 完善的错误检查
- 在线运行，无需配置环境
- 友好的交互界面
- 可设置的运行选项：最大执行步数限制（防止无限循环/递归）；虚拟机栈大小

## 虚拟机信息
- 小端序
- 机器字长：32位

## IR语法定义
注：下方IR语法定义在《编译原理实践与指导教程》（许畅，陈嘉，朱晓瑞编著.机械工业出版社）中的描述之上，进行了进一步的严格定义，与书中的语法完全兼容，并新增了一条全局变量声明指令。

- 定义`ID`为符合C语言标准的标识符名称：  
`ID = [a-zA-Z_](\w)*`  
- 定义`Imm`为一个立即数（32位有符号整数，若超过补码表示范围，高位将被截断）：  
`Imm = #(-)?(\d)+`  
- 定义`Size`为分配空间字节数，必须是正整数且为4的倍数，并不超过32位无符号整数的表示范围：  
`Size = (\d)+`  
- 定义`Singular`为一个一元值，它要么是一个立即数，或`ID`本身，或前置了一个解引用运算符`*`或取地址运算符`&`的`ID`：  
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

中间代码的语法定义如下表所示。请注意一行中间代码内各个元素之间均由一个空格或制表符`'\t'`隔开。

|语法|描述|
|------------|------------|
|FUNCTION **ID** :|定义函数|
|**LValue** := **RValue**|赋值；若**LValue**为**ID**且该**ID**未被定义过，则将其作为当前函数的一个局部变量进行空间分配|
|DEC **ID** **Size**|在栈上分配一块指定大小的连续的空间，**ID**代表存储在该空间前4字节的整数。用于在函数内部声明数组或结构体，也可用于声明整数变量|
|GLOBAL_DEC **ID** **Size**|在全局存储区分配一块指定大小的连续的空间，**ID**代表存储在该空间前4字节的整数。用于声明全局整数变量、数组或结构体，*这是本虚拟机新增的一条IR指令*|
|LABEL **ID** :|定义标号|
|GOTO **ID**|无条件跳转|
|IF **CondValue** GOTO **ID**|条件跳转|
|ARG **Singular**|传实参|
|CALL **ID**|调用函数并忽略返回值|
|**LValue** := CALL **ID**|调用函数并存储返回值|
|PARAM **ID**|声明函数形参|
|RETURN **Singular**|退出当前函数并返回给定值|
|READ **LValue**|从控制台读取一个整数储存在给定变量中|
|WRITE **Singular**|向控制台输出给定整数|

虚拟机将所有地址变量和表示空间大小的立即数均视为32位无符号整数。当二元四则运算符的操作数中有一个为无符号数时，运算将以无符号方式进行，运算结果也将被看做一个无符号数。