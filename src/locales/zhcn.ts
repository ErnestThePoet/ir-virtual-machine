/* Do never modify this locale. */
const zhCn = {
    APP_TITLE: "编译原理IR虚拟机",

    // Static error check messages
    UNRECOGNIZED_INSTRUCTION: "无法识别的IR指令",
    ILLEGAL_INSTRUCTION_FORMAT: "指令格式非法",
    FUNCTION_ILLEGAL_ID: "FUNCTION指令函数名非法",
    ASSIGN_ILLEGAL_LEFT: "赋值指令左侧非法",
    ASSIGN_ILLEGAL_RIGHT: "赋值指令右侧非法",
    ASSIGN_ILLEGAL_RIGHT_OPERATOR: "赋值指令右侧算术运算符非法",
    ASSIGN_ILLEGAL_RIGHT_OPERAND1: "赋值指令右侧第一个一元值操作数非法",
    ASSIGN_ILLEGAL_RIGHT_OPERAND2: "赋值指令右侧第二个一元值操作数非法",
    DEC_ILLEGAL_ID: "DEC指令变量名非法",
    DEC_ILLEGAL_SIZE_FORMAT: "DEC指令分配空间格式非法",
    DEC_SIZE_NOT_4_MULTIPLE: "DEC指令分配空间大小不是4的倍数",
    GLOBAL_DEC_ILLEGAL_ID: "GLOBAL_DEC指令变量名非法",
    GLOBAL_DEC_ILLEGAL_SIZE_FORMAT: "GLOBAL_DEC指令分配空间格式非法",
    GLOBAL_DEC_SIZE_NOT_4_MULTIPLE: "GLOBAL_DEC指令分配空间大小不是4的倍数",
    LABEL_ILLEGAL_ID: "LABEL指令标签名非法",
    GOTO_ILLEGAL_ID: "GOTO指令标签名非法",
    IF_ILLEGAL_COND_OPERATOR: "IF指令条件表达式的条件表达式非法",
    IF_ILLEGAL_COND_OPERAND1: "IF指令条件表达式的第一个一元值操作数非法",
    IF_ILLEGAL_COND_OPERAND2: "IF指令条件表达式的第二个一元值操作数非法",
    IF_ILLEGAL_GOTO_ID: "IF指令GOTO标签名非法",
    ARG_ILLEGAL: "ARG指令一元值实参非法",
    CALL_ILLEGAL_ID: "CALL指令调用函数名非法",
    PARAM_ILLEGAL_ID: "PARAM指令形参名非法",
    RETURN_ILLEGAL: "RETURN指令一元值返回值非法",
    READ_ILLEGAL: "提供给READ函数的写入目标非法",
    WRITE_ILLEGAL: "提供给WRITE函数的一元值非法"
};

export default zhCn;
