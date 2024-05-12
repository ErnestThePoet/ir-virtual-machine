/* Do never modify this locale. */
const zhCn = {
    APP_TITLE: "IR虚拟机",

    // UI strings
    ADD: "新建",
    IMPORT: "导入",
    DEMOS: "示例",
    DEMO_SOURCES: "源代码",
    SAVE: "保存",
    THEME: "主题",
    ABOUT: "关于",
    CLOSE: "关闭",
    CONFIRM_UNSAVED_CLOSE: "关闭前是否保存对 {name} 的更改？",
    SAVE_CLOSE: "保存关闭",
    UNSAVE_CLOSE: "不保存关闭",
    OK: "确定",
    CANCEL: "取消",
    EMPTY_PLACEHOLDER_DESC:
        "用于哈尔滨工业大学/南京大学《编译原理》课程实验的中间代码虚拟机",
    EMPTY_PLACEHOLDER_HINT_TITLE: "您可以：",
    EMPTY_PLACEHOLDER_HINT_1: "在左侧菜单中新建或导入.ir文件",
    EMPTY_PLACEHOLDER_HINT_2: "直接将一个或多个.ir文件拖入页面",
    EMPTY_PLACEHOLDER_HINT_3: "尝试一下左侧菜单中的各种示例程序",
    FETCH_FAILED: "fetch() {url} 失败",
    NOT_AN_IR_FILE: "{fileName}不是一个ir文件",
    IR_IMPORT_FAILED: "{fileName}导入失败",

    RUN: "运行",
    RUN_STEP: "单步",
    RESET: "重置",
    CLEAR_CONSOLE: "清屏",

    STEP_COUNT: "执行步数：",
    STEP_COUNT_NUMBER: "{stepCount, number}",
    STATE: "VM状态：",
    STATE_INITIAL: "初始",
    STATE_BUSY: "忙碌",
    STATE_WAIT_INPUT: "等待输入",
    STATE_FREE: "空闲",
    STATE_STATIC_CHECK_FAILED: "IR静态分析错误",
    STATE_RUNTIME_ERROR: "运行时错误",
    STATE_MAX_STEP_REACHED: "达到步数限制",
    STATE_EXITED_NORMALLY: "正常退出（返回值0）",
    STATE_EXITED_ABNORMALLY: "不正常退出（返回值非0）",

    MAX_EXECUTION_STEP_COUNT: "执行步数限制",
    SET_0_MEANS_NO_STEP_LIMIT: "设为0则不限制执行步数",
    MEMORY_SIZE: "内存大小/B",
    STACK_SIZE: "栈大小/B",

    TOTAL_MEMORY_USAGE: "总内存使用",
    STACK_MEMORY_USAGE: "栈内存使用",
    GLOBAL_VARIABLE_MEMORY_USAGE: "全局变量内存使用",
    PEAK_MEMORY_USAGE: "峰值使用",
    PERCENTAGE_USAGE: "{percentage, number, ::.0}%",
    BYTE_USAGE: "{used}B/{total}B",
    ARBITRARY_UNIT_MEMORY_USAGE:
        "{used, number, ::.0}{unit}/{total, number, ::.0}{unit}",
    BYTE_SIZE: "{size}B",
    ARBITRARY_UNIT_SIZE: "{size, number, ::.0}{unit}",

    GLOBAL_VARIABLE_TABLE: "全局变量表",
    LOCAL_VARIABLE_TABLE: "局部变量表",
    VARIABLE_ID: "变量名",
    ADDRESS: "地址",
    SIZE: "大小",
    VALUES: "值",
    EMPTY_VATIABLE_TABLE: "（空）",
    CALL_STACK_DEPTH: "调用栈第{depth}层",

    // Static error check messages
    STATIC_ERROR_PREFIX: "静态分析错误(第{lineNumber}行)：",
    STATIC_ERROR_PREFIX_NO_LINE_NUMBER: "静态分析错误：",
    DECODE_ERROR_PREFIX: "指令解码错误(第{lineNumber}行)：",
    UNRECOGNIZED_INSTRUCTION: "无法识别的IR指令",
    ILLEGAL_INSTRUCTION_FORMAT: "指令格式非法",
    FUNCTION_ILLEGAL_ID: "FUNCTION指令函数名非法",
    ASSIGN_ILLEGAL_LEFT: "赋值指令左侧非法",
    ASSIGN_ILLEGAL_RIGHT: "赋值指令右侧一元值非法",
    ASSIGN_RIGHT_IMM_TOO_LARGE: "赋值指令右侧立即数过大",
    ASSIGN_ILLEGAL_RIGHT_OPERATOR: "赋值指令右侧算术运算符非法",
    ASSIGN_ILLEGAL_RIGHT_OPERAND1: "赋值指令右侧第一个一元值操作数非法",
    ASSIGN_RIGHT_OPERAND1_IMM_TOO_LARGE: "赋值指令右侧第一个立即数操作数过大",
    ASSIGN_ILLEGAL_RIGHT_OPERAND2: "赋值指令右侧第二个一元值操作数非法",
    ASSIGN_RIGHT_OPERAND2_IMM_TOO_LARGE: "赋值指令右侧第二个立即数操作数过大",
    DEC_ILLEGAL_ID: "DEC指令变量名非法",
    DEC_ILLEGAL_SIZE_FORMAT: "DEC指令分配空间格式非法",
    DEC_SIZE_TOO_LARGE: "DEC指令分配空间过大",
    DEC_SIZE_NOT_4_MULTIPLE: "DEC指令分配空间大小不是4的倍数",
    GLOBAL_DEC_ILLEGAL_ID: "GLOBAL_DEC指令变量名非法",
    GLOBAL_DEC_ILLEGAL_SIZE_FORMAT: "GLOBAL_DEC指令分配空间格式非法",
    GLOBAL_DEC_SIZE_TOO_LARGE: "GLOBAL_DEC指令分配空间过大",
    GLOBAL_DEC_SIZE_NOT_4_MULTIPLE: "GLOBAL_DEC指令分配空间大小不是4的倍数",
    LABEL_ILLEGAL_ID: "LABEL指令标签名非法",
    GOTO_ILLEGAL_ID: "GOTO指令标签名非法",
    DUPLICATE_LABEL_ID:
        "LABEL指令声明的标签名''{id}''已存在(上次声明在第{lastLineNumber}行)",
    DUPLICATE_FUNCTION_ID:
        "FUNCTION指令声明的函数名''{id}''已存在(上次声明在第{lastLineNumber}行)",
    FUNCTION_NOT_FOUND: "找不到函数''{id}''",
    LABEL_NOT_FOUND: "找不到标签''{id}''",
    IF_ILLEGAL_COND_OPERATOR: "IF指令条件表达式的条件运算符非法",
    IF_ILLEGAL_COND_OPERAND1: "IF指令条件表达式的第一个一元值操作数非法",
    IF_COND_OPERAND1_IMM_TOO_LARGE: "IF指令条件表达式的第一个立即数操作数过大",
    IF_ILLEGAL_COND_OPERAND2: "IF指令条件表达式的第二个一元值操作数非法",
    IF_COND_OPERAND2_IMM_TOO_LARGE: "IF指令条件表达式的第二个立即数操作数过大",
    IF_ILLEGAL_GOTO_ID: "IF指令GOTO标签名非法",
    ARG_ILLEGAL: "ARG指令一元值实参非法",
    ARG_IMM_TOO_LARGE: "ARG指令立即数实参过大",
    CALL_ILLEGAL_ID: "CALL指令调用函数名非法",
    PARAM_ILLEGAL_ID: "PARAM指令形参名非法",
    RETURN_ILLEGAL: "RETURN指令一元值返回值非法",
    RETURN_IMM_TOO_LARGE: "RETURN指令立即数返回值过大",
    READ_ILLEGAL: "提供给READ指令的写入目标非法",
    WRITE_ILLEGAL: "提供给WRITE指令的一元值非法",
    WRITE_IMM_TOO_LARGE: "提供给WRITE指令的立即数过大",
    NO_MAIN_FUNCTION: "未定义'main'函数",

    // Runtime error messages
    RUNTIME_ERROR_PREFIX: "运行时错误(第{lineNumber}行)：",
    RUNTIME_ERROR_PREFIX_NO_LN: "运行时错误：",
    GLOBAL_VARIABLE_SEGMENT_OVERFLOW: "全局变量空间溢出",
    STACK_OVERFLOW: "栈空间溢出",
    VARIABLE_NOT_FOUND: "找不到变量''{id}''",
    INSTRUCTION_READ_OUT_OF_BOUND:
        "从地址{address}处读入指令超出了指令地址空间",
    MEMORY_READ_OUT_OF_BOUND: "从地址{address}读入4字节时超出了地址空间",
    MEMORY_WRITE_OUT_OF_BOUND: "向地址{address}写入4字节时超出了地址空间",
    EMPTY_VARIABLE_TABLE_STACK: "局部变量符号表栈为空",
    DUPLICATE_DEC_ID:
        "DEC指令声明的变量名''{id}''已存在(上次声明在第{lastLineNumber}行)",
    DUPLICATE_GLOBAL_DEC_ID:
        "GLOBAL_DEC指令声明的全局变量名''{id}''已存在(上次声明在第{lastLineNumber}行)",
    DUPLICATE_PARAM_ID:
        "PARAM指令声明的形参名''{id}''已存在(上次声明在第{lastLineNumber}行)",
    DIVIDE_BY_ZERO: "不能除以0",

    // Other error messages
    MAX_STEP_REACHED: "已到达最大执行步数限制({maxExecutionStepCount, number})",
    INPUT_INT_ILLEGAL: "输入的整数格式非法",
    INPUT_INT_ABS_TOO_LARGE: "输入的整数绝对值过大",

    // Console normal messages
    WRITE_OUTPUT: "{value}",
    READ_PROMPT: "请输入{name}的值：",
    CONSOLE_ARROW: ">",
    READ_INPUT: "{value}",
    PROGRAM_EXITED: "程序执行结束，返回值为{returnValue}。",
    EXECUTION_STEP_COUNT_TIME:
        "总执行步数：{stepCount, number}；总执行耗时：{time, number}ms"
};

export default zhCn;
