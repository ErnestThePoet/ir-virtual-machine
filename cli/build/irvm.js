import e from"fs";import t from"readline";import{createIntlCache as s,createIntl as i}from"@formatjs/intl";import r from"lodash";const{cloneDeep:a}=r,n=[{name:"简体中文",locale:{APP_TITLE:"IR虚拟机",ADD:"新建",IMPORT:"导入",DEMOS:"示例",DEMO_SOURCES:"源代码",SAVE:"保存",THEME:"主题",ABOUT:"关于",CLOSE:"关闭",CONFIRM_UNSAVED_CLOSE:"关闭前是否保存对 {name} 的更改？",SAVE_CLOSE:"保存关闭",UNSAVE_CLOSE:"不保存关闭",OK:"确定",CANCEL:"取消",EMPTY_PLACEHOLDER_DESC:"用于哈尔滨工业大学/南京大学《编译原理》课程实验的中间代码虚拟机",EMPTY_PLACEHOLDER_HINT_TITLE:"您可以：",EMPTY_PLACEHOLDER_HINT_1:"尝试一下左侧菜单中的各种示例程序",EMPTY_PLACEHOLDER_HINT_2:"在左侧菜单中新建或导入.ir文件",EMPTY_PLACEHOLDER_HINT_3:"直接将一个或多个.ir文件拖入页面",FETCH_FAILED:"fetch() {url} 失败",NOT_AN_IR_FILE:"{fileName}不是一个ir文件",IR_IMPORT_FAILED:"{fileName}导入失败",RUN:"运行",RUN_STEP:"单步",RESET:"重置",CLEAR_CONSOLE:"清屏",STEP_COUNT:"执行步数：",STEP_COUNT_NUMBER:"{stepCount, number}",STATE:"VM状态：",STATE_INITIAL:"初始",STATE_BUSY:"忙碌",STATE_WAIT_INPUT:"等待输入",STATE_FREE:"空闲",STATE_STATIC_CHECK_FAILED:"IR静态分析错误",STATE_RUNTIME_ERROR:"运行时错误",STATE_MAX_STEP_REACHED:"达到步数限制",STATE_EXITED_NORMALLY:"正常退出（返回值0）",STATE_EXITED_ABNORMALLY:"不正常退出（返回值非0）",MAX_EXECUTION_STEP_COUNT:"执行步数限制",SET_0_MEANS_NO_STEP_LIMIT:"设为0则不限制执行步数",MEMORY_SIZE:"内存大小/B",STACK_SIZE:"栈大小/B",TOTAL_MEMORY_USAGE:"总内存使用",STACK_MEMORY_USAGE:"栈内存使用",GLOBAL_VARIABLE_MEMORY_USAGE:"全局变量内存使用",PEAK_MEMORY_USAGE:"峰值使用",PERCENTAGE_USAGE:"{percentage, number, ::.0}%",B_USAGE:"{used}B/{total}B",KB_USAGE:"{used, number, ::.0}KB/{total, number, ::.0}KB",BYTES:"{bytes}B",KB:"{kb, number, ::.0}KB",GLOBAL_VARIABLE_TABLE:"全局变量表",LOCAL_VARIABLE_TABLE:"局部变量表",VARIABLE_ID:"变量名",ADDRESS:"地址",SIZE:"大小",VALUES:"值",EMPTY_VATIABLE_TABLE:"（空）",CALL_STACK_DEPTH:"调用栈第{depth}层",STATIC_ERROR_PREFIX:"静态分析错误：",DECODE_ERROR_PREFIX:"指令解码错误(第{lineNumber}行)：",UNRECOGNIZED_INSTRUCTION:"无法识别的IR指令",ILLEGAL_INSTRUCTION_FORMAT:"指令格式非法",FUNCTION_ILLEGAL_ID:"FUNCTION指令函数名非法",ASSIGN_ILLEGAL_LEFT:"赋值指令左侧非法",ASSIGN_ILLEGAL_RIGHT:"赋值指令右侧一元值非法",ASSIGN_RIGHT_IMM_TOO_LARGE:"赋值指令右侧立即数过大",ASSIGN_ILLEGAL_RIGHT_OPERATOR:"赋值指令右侧算术运算符非法",ASSIGN_ILLEGAL_RIGHT_OPERAND1:"赋值指令右侧第一个一元值操作数非法",ASSIGN_RIGHT_OPERAND1_IMM_TOO_LARGE:"赋值指令右侧第一个立即数操作数过大",ASSIGN_ILLEGAL_RIGHT_OPERAND2:"赋值指令右侧第二个一元值操作数非法",ASSIGN_RIGHT_OPERAND2_IMM_TOO_LARGE:"赋值指令右侧第二个立即数操作数过大",DEC_ILLEGAL_ID:"DEC指令变量名非法",DEC_ILLEGAL_SIZE_FORMAT:"DEC指令分配空间格式非法",DEC_SIZE_TOO_LARGE:"DEC指令分配空间过大",DEC_SIZE_NOT_4_MULTIPLE:"DEC指令分配空间大小不是4的倍数",GLOBAL_DEC_ILLEGAL_ID:"GLOBAL_DEC指令变量名非法",GLOBAL_DEC_ILLEGAL_SIZE_FORMAT:"GLOBAL_DEC指令分配空间格式非法",GLOBAL_DEC_SIZE_TOO_LARGE:"GLOBAL_DEC指令分配空间过大",GLOBAL_DEC_SIZE_NOT_4_MULTIPLE:"GLOBAL_DEC指令分配空间大小不是4的倍数",LABEL_ILLEGAL_ID:"LABEL指令标签名非法",GOTO_ILLEGAL_ID:"GOTO指令标签名非法",IF_ILLEGAL_COND_OPERATOR:"IF指令条件表达式的条件运算符非法",IF_ILLEGAL_COND_OPERAND1:"IF指令条件表达式的第一个一元值操作数非法",IF_COND_OPERAND1_IMM_TOO_LARGE:"IF指令条件表达式的第一个立即数操作数过大",IF_ILLEGAL_COND_OPERAND2:"IF指令条件表达式的第二个一元值操作数非法",IF_COND_OPERAND2_IMM_TOO_LARGE:"IF指令条件表达式的第二个立即数操作数过大",IF_ILLEGAL_GOTO_ID:"IF指令GOTO标签名非法",ARG_ILLEGAL:"ARG指令一元值实参非法",ARG_IMM_TOO_LARGE:"ARG指令立即数实参过大",CALL_ILLEGAL_ID:"CALL指令调用函数名非法",PARAM_ILLEGAL_ID:"PARAM指令形参名非法",RETURN_ILLEGAL:"RETURN指令一元值返回值非法",RETURN_IMM_TOO_LARGE:"RETURN指令立即数返回值过大",READ_ILLEGAL:"提供给READ函数的写入目标非法",WRITE_ILLEGAL:"提供给WRITE函数的一元值非法",WRITE_IMM_TOO_LARGE:"提供给WRITE函数的立即数过大",NO_MAIN_FUNCTION:"未定义main函数",RUNTIME_ERROR_PREFIX:"运行时错误(第{lineNumber}行)：",RUNTIME_ERROR_PREFIX_NO_LN:"运行时错误：",GLOBAL_VARIABLE_SEGMENT_OVERFLOW:"全局变量空间溢出",STACK_OVERFLOW:"栈空间溢出",VARIABLE_NOT_FOUND:"找不到变量{id}",FUNCTION_NOT_FOUND:"找不到函数{id}",LABEL_NOT_FOUND:"找不到标签{id}",INSTRUCTION_READ_OUT_OF_BOUND:"从地址{address}处读入指令超出了指令地址空间",MEMORY_READ_OUT_OF_BOUND:"从地址{address}读入4字节时超出了地址空间",MEMORY_WRITE_OUT_OF_BOUND:"向地址{address}写入4字节时超出了地址空间",EMPTY_VARIABLE_TABLE_STACK:"局部变量符号表栈为空",DUPLICATE_DEC_ID:"DEC指令声明的变量名已存在",DUPLICATE_GLOBAL_DEC_ID:"GLOBAL_DEC指令声明的全局变量名已存在",DUPLICATE_PARAM_ID:"PARAM指令声明的形参名已存在",DIVIDE_BY_ZERO:"不能除以0",MAX_STEP_REACHED:"已到达最大执行步数限制({maxExecutionStepCount, number})",INPUT_INT_ILLEGAL:"输入的整数格式非法",INPUT_INT_ABS_TOO_LARGE:"输入的整数绝对值过大",WRITE_OUTPUT:"{value}",READ_PROMPT:"请输入{name}的值：",CONSOLE_ARROW:">",READ_INPUT:"{value}",PROGRAM_EXITED:"程序执行结束，返回值为{returnValue}。",EXECUTION_STEP_COUNT_TIME:"总执行步数：{stepCount, number}；总执行耗时：{time, number}ms"}},{name:"English",locale:{APP_TITLE:"IR Virtual Machine",ADD:"New",IMPORT:"Import",DEMOS:"Demos",DEMO_SOURCES:"Sources",SAVE:"Save",THEME:"Theme",ABOUT:"About",CLOSE:"Close",CONFIRM_UNSAVED_CLOSE:"Save changes to {name} before close?",SAVE_CLOSE:"Save&Close",UNSAVE_CLOSE:"Close",OK:"OK",CANCEL:"Cancel",EMPTY_PLACEHOLDER_DESC:"An IR virtual machine for HIT/NJU Compilation Principle labs",EMPTY_PLACEHOLDER_HINT_TITLE:"You may:",EMPTY_PLACEHOLDER_HINT_1:"Try out Demos in left sidebar",EMPTY_PLACEHOLDER_HINT_2:"Add or import .ir files in left sidebar",EMPTY_PLACEHOLDER_HINT_3:"Drag one or more .ir files inside",FETCH_FAILED:"fetch() for {url} failed",NOT_AN_IR_FILE:"{fileName} is not an ir file",IR_IMPORT_FAILED:"Failed to import {fileName}",RUN:"Run",RUN_STEP:"Step",RESET:"Reset",CLEAR_CONSOLE:"Clear",STEP_COUNT:"Step Count: ",STEP_COUNT_NUMBER:"{stepCount, number}",STATE:"VM State: ",STATE_INITIAL:"Initial",STATE_BUSY:"Busy",STATE_WAIT_INPUT:"Awaiting Input",STATE_FREE:"Free",STATE_STATIC_CHECK_FAILED:"IR Static Check Error",STATE_RUNTIME_ERROR:"Runtime Error",STATE_MAX_STEP_REACHED:"Max Step Count Reached",STATE_EXITED_NORMALLY:"Exited Normally(Return value 0)",STATE_EXITED_ABNORMALLY:"Exited Abnormally(Return value not 0)",MAX_EXECUTION_STEP_COUNT:"Max Steps",SET_0_MEANS_NO_STEP_LIMIT:"No step limit if set to 0",MEMORY_SIZE:"Memory Size/B",STACK_SIZE:"Stack Size/B",TOTAL_MEMORY_USAGE:"Total Memory Usage: ",STACK_MEMORY_USAGE:"Stack Memory Usage: ",GLOBAL_VARIABLE_MEMORY_USAGE:"GlobalVar Memory Usage: ",PEAK_MEMORY_USAGE:"Peak Usage: ",PERCENTAGE_USAGE:"{percentage, number, ::.0}%",B_USAGE:"{used}B/{total}B",KB_USAGE:"{used, number, ::.0}KB/{total, number, ::.0}KB",BYTES:"{bytes}B",KB:"{kb, number, ::.0}KB",GLOBAL_VARIABLE_TABLE:"Global Variable Table",LOCAL_VARIABLE_TABLE:"Local Variable Table",VARIABLE_ID:"ID",ADDRESS:"Address",SIZE:"Size",VALUES:"Value",EMPTY_VATIABLE_TABLE:"(Empty)",CALL_STACK_DEPTH:"Call stack depth {depth}",STATIC_ERROR_PREFIX:"Static Check Error: ",DECODE_ERROR_PREFIX:"IR Decoding Error(Line {lineNumber}): ",UNRECOGNIZED_INSTRUCTION:"Unrecognized IR instruction",ILLEGAL_INSTRUCTION_FORMAT:"Illegal IR format",FUNCTION_ILLEGAL_ID:"FUNCTION id illegal",ASSIGN_ILLEGAL_LEFT:"Illegal left hand side of assignment",ASSIGN_ILLEGAL_RIGHT:"Illegal right hand side of assignment",ASSIGN_RIGHT_IMM_TOO_LARGE:"Right hand side immediate number of assignment too large",ASSIGN_ILLEGAL_RIGHT_OPERATOR:"Illegal math operator on RHS of assignment",ASSIGN_ILLEGAL_RIGHT_OPERAND1:"Illegal first Singular operand on RHS of assignment",ASSIGN_RIGHT_OPERAND1_IMM_TOO_LARGE:"First immediate number operand on RHS of assignment too large",ASSIGN_ILLEGAL_RIGHT_OPERAND2:"Illegal second Singular operand on RHS of assignment",ASSIGN_RIGHT_OPERAND2_IMM_TOO_LARGE:"Second immediate number operand on RHS of assignment too large",DEC_ILLEGAL_ID:"DEC's id illegal",DEC_ILLEGAL_SIZE_FORMAT:"DEC's size format illegal",DEC_SIZE_TOO_LARGE:"DEC's size too large",DEC_SIZE_NOT_4_MULTIPLE:"DEC's size not a multiple of 4",GLOBAL_DEC_ILLEGAL_ID:"GLOBAL_DEC's id illegal",GLOBAL_DEC_ILLEGAL_SIZE_FORMAT:"GLOBAL_DEC's size format illegal",GLOBAL_DEC_SIZE_TOO_LARGE:"GLOBAL_DEC's size too large",GLOBAL_DEC_SIZE_NOT_4_MULTIPLE:"GLOBAL_DEC's size not a multiple of 4",LABEL_ILLEGAL_ID:"LABEL's id illegal",GOTO_ILLEGAL_ID:"GOTO's id illegal",IF_ILLEGAL_COND_OPERATOR:"IF's relop illegal",IF_ILLEGAL_COND_OPERAND1:"IF's first Singular operand in condition illegal",IF_COND_OPERAND1_IMM_TOO_LARGE:"IF's first immediate number operand in condition too large",IF_ILLEGAL_COND_OPERAND2:"IF's second Singular operand in condition illegal",IF_COND_OPERAND2_IMM_TOO_LARGE:"IF's second immediate number operand in condition too large",IF_ILLEGAL_GOTO_ID:"IF's GOTO id illegal",ARG_ILLEGAL:"ARG's Singular arg illegal",ARG_IMM_TOO_LARGE:"ARG's immediate number arg too large",CALL_ILLEGAL_ID:"CALL's function id illegal",PARAM_ILLEGAL_ID:"PARAM's param id illegal",RETURN_ILLEGAL:"RETURN's Singular return value illegal",RETURN_IMM_TOO_LARGE:"RETURN's immediate number return value too large",READ_ILLEGAL:"Illegal LValue for READ",WRITE_ILLEGAL:"Illegal Singular for WRITE",WRITE_IMM_TOO_LARGE:"Immediate number for WRITE too large",NO_MAIN_FUNCTION:"Function main is not defined",RUNTIME_ERROR_PREFIX:"Runtime Error(Line{lineNumber}): ",RUNTIME_ERROR_PREFIX_NO_LN:"Runtime Error: ",GLOBAL_VARIABLE_SEGMENT_OVERFLOW:"Global variable segment overflow",STACK_OVERFLOW:"Stack overflow",VARIABLE_NOT_FOUND:"Can't find variable {id}",FUNCTION_NOT_FOUND:"Can't find function {id}",LABEL_NOT_FOUND:"Can't find label {id}",INSTRUCTION_READ_OUT_OF_BOUND:"Reading instruction from {address} is out of bound",MEMORY_READ_OUT_OF_BOUND:"Reading 4 bytes from {address} is out of bound",MEMORY_WRITE_OUT_OF_BOUND:"Writing 4 bytes to {address} is out of bound",EMPTY_VARIABLE_TABLE_STACK:"Empty local variable stack",DUPLICATE_DEC_ID:"DEC's variable id already declared",DUPLICATE_GLOBAL_DEC_ID:"GLOBAL_DEC's global variable id already declared",DUPLICATE_PARAM_ID:"PARAM's param id already declared",DIVIDE_BY_ZERO:"Cannot divide by 0",MAX_STEP_REACHED:"Maximum execution step count reached({maxExecutionStepCount, number})",INPUT_INT_ILLEGAL:"Illegal input integer",INPUT_INT_ABS_TOO_LARGE:"Absolute value of input integer too large",WRITE_OUTPUT:"{value}",READ_PROMPT:"Please enter a value for {name}:",CONSOLE_ARROW:">",READ_INPUT:"{value}",PROGRAM_EXITED:"Program exited with return value {returnValue}.",EXECUTION_STEP_COUNT_TIME:"Execution step count: {stepCount, number}; Execution time: {time, number}ms"}}],l=new Int32Array(1);function E(e){return l[0]=e,l[0]}function o(e,t){return E(e+t)}function u(e,t){return E(e-t)}var _,R,I,A,L,T,O,c,S,h;function m(e,t){return e<0||e+4>t.length?{value:null,status:_.OUT_OF_BOUND}:{value:E(t[e]|t[e+1]<<8|t[e+2]<<16|t[e+3]<<24),status:_.SUCCESS}}!function(e){e[e.SUCCESS=0]="SUCCESS",e[e.OUT_OF_BOUND=1]="OUT_OF_BOUND"}(_||(_={})),function(e){e[e.SUCCESS=0]="SUCCESS",e[e.OUT_OF_BOUND=1]="OUT_OF_BOUND"}(R||(R={})),function(e){e[e.IMM=0]="IMM",e[e.ID=1]="ID",e[e.ADDRESS_ID=2]="ADDRESS_ID",e[e.DEREF_ID=3]="DEREF_ID"}(I||(I={})),function(e){e[e.ADD=0]="ADD",e[e.SUB=1]="SUB",e[e.MUL=2]="MUL",e[e.DIV=3]="DIV"}(A||(A={})),function(e){e[e.EQ=0]="EQ",e[e.NE=1]="NE",e[e.LT=2]="LT",e[e.LE=3]="LE",e[e.GT=4]="GT",e[e.GE=5]="GE"}(L||(L={})),function(e){e[e.ID=0]="ID",e[e.DEREF_ID=1]="DEREF_ID"}(T||(T={})),function(e){e[e.SINGULAR=0]="SINGULAR",e[e.BINARY_MATH_OP=1]="BINARY_MATH_OP"}(O||(O={})),function(e){e[e.FUNCTION=0]="FUNCTION",e[e.ASSIGN=1]="ASSIGN",e[e.DEC=2]="DEC",e[e.GLOBAL_DEC=3]="GLOBAL_DEC",e[e.LABEL=4]="LABEL",e[e.GOTO=5]="GOTO",e[e.IF=6]="IF",e[e.ARG=7]="ARG",e[e.CALL=8]="CALL",e[e.ASSIGN_CALL=9]="ASSIGN_CALL",e[e.PARAM=10]="PARAM",e[e.RETURN=11]="RETURN",e[e.READ=12]="READ",e[e.WRITE=13]="WRITE",e[e.EMPTY=14]="EMPTY",e[e.COMMENT=15]="COMMENT",e[e.ERROR=16]="ERROR"}(c||(c={})),function(e){e[e.ASSIGN=1]="ASSIGN",e[e.DEC=2]="DEC",e[e.GLOBAL_DEC=3]="GLOBAL_DEC",e[e.GOTO=5]="GOTO",e[e.IF=6]="IF",e[e.ARG=7]="ARG",e[e.CALL=8]="CALL",e[e.ASSIGN_CALL=9]="ASSIGN_CALL",e[e.PARAM=10]="PARAM",e[e.RETURN=11]="RETURN",e[e.READ=12]="READ",e[e.WRITE=13]="WRITE"}(S||(S={}));class d{patternId=new RegExp(/^(?<id>[a-zA-Z_]\w*)$/);patternSize=new RegExp(/^(?<size>\d+)$/);patternSingular=new RegExp(/^(#(?<imm>-?\d+))$|^(?<id>[a-zA-Z_]\w*)$|^(\*(?<derefId>[a-zA-Z_]\w*))$|^(&(?<addressId>[a-zA-Z_]\w*))$/);patternLValue=new RegExp(/^((?<id>[a-zA-Z_]\w*))$|^(\*(?<derefId>[a-zA-Z_]\w*))$/);illegalInstructionFormatError={type:c.ERROR,messageKey:"ILLEGAL_INSTRUCTION_FORMAT"};purify(e){return e.trim().replaceAll(/[ \t]+/g," ")}splitWhiteSpace(e){return e.replaceAll("\t"," ").split(" ")}decodeComponentId(e){const t=e.match(this.patternId);return null===t?null:t.groups.id}decodeComponentSize(e){const t=e.match(this.patternSize);if(null===t)return null;const s=parseInt(t.groups.size);return Number.isSafeInteger(s)?E(s):1/0}decodeComponentSingular(e){const t=e.match(this.patternSingular);if(null===t)return null;if(void 0!==t.groups.imm){const e=parseInt(t.groups.imm);return Number.isSafeInteger(e)?{type:I.IMM,imm:E(e)}:{type:I.IMM,imm:1/0}}return void 0!==t.groups.id?{type:I.ID,id:t.groups.id}:void 0!==t.groups.derefId?{type:I.DEREF_ID,id:t.groups.derefId}:{type:I.ADDRESS_ID,id:t.groups.addressId}}decodeComponentLValue(e){const t=e.match(this.patternLValue);return null===t?null:void 0!==t.groups.id?{type:T.ID,id:t.groups.id}:{type:T.DEREF_ID,id:t.groups.derefId}}decodeFunction(e){if(3!==e.length||":"!==e[2])return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);return null===t?{type:c.ERROR,messageKey:"FUNCTION_ILLEGAL_ID"}:{type:c.FUNCTION,value:{id:t}}}decodeAssign(e){if(3!==e.length&&5!==e.length||":="!==e[1])return this.illegalInstructionFormatError;const t=this.decodeComponentLValue(e[0]);if(null===t)return{type:c.ERROR,messageKey:"ASSIGN_ILLEGAL_LEFT"};const s=this.decodeComponentSingular(e[2]);if(null===s)return{type:c.ERROR,messageKey:3===e.length?"ASSIGN_ILLEGAL_RIGHT":"ASSIGN_ILLEGAL_RIGHT_OPERAND1"};if(s.type===I.IMM&&!Number.isFinite(s.imm))return{type:c.ERROR,messageKey:3===e.length?"ASSIGN_RIGHT_IMM_TOO_LARGE":"ASSIGN_RIGHT_OPERAND1_IMM_TOO_LARGE"};if(3===e.length)return{type:c.ASSIGN,value:{lValue:t,rValue:{type:O.SINGULAR,singular:s}}};{let i=A.ADD;switch(e[3]){case"+":i=A.ADD;break;case"-":i=A.SUB;break;case"*":i=A.MUL;break;case"/":i=A.DIV;break;default:return{type:c.ERROR,messageKey:"ASSIGN_ILLEGAL_RIGHT_OPERATOR"}}const r=this.decodeComponentSingular(e[4]);return null===r?{type:c.ERROR,messageKey:"ASSIGN_ILLEGAL_RIGHT_OPERAND2"}:r.type!==I.IMM||Number.isFinite(r.imm)?{type:c.ASSIGN,value:{lValue:t,rValue:{type:O.BINARY_MATH_OP,singularL:s,singularR:r,binaryMathOp:i}}}:{type:c.ERROR,messageKey:"ASSIGN_RIGHT_OPERAND2_IMM_TOO_LARGE"}}}decodeDec(e){if(3!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);if(null===t)return{type:c.ERROR,messageKey:"DEC_ILLEGAL_ID"};const s=this.decodeComponentSize(e[2]);return null===s?{type:c.ERROR,messageKey:"DEC_ILLEGAL_SIZE_FORMAT"}:Number.isFinite(s)?s%4!=0?{type:c.ERROR,messageKey:"DEC_SIZE_NOT_4_MULTIPLE"}:{type:c.DEC,value:{id:t,size:s}}:{type:c.ERROR,messageKey:"DEC_SIZE_TOO_LARGE"}}decodeGlobalDec(e){if(3!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);if(null===t)return{type:c.ERROR,messageKey:"GLOBAL_DEC_ILLEGAL_ID"};const s=this.decodeComponentSize(e[2]);return null===s?{type:c.ERROR,messageKey:"GLOBAL_DEC_ILLEGAL_SIZE_FORMAT"}:Number.isFinite(s)?s%4!=0?{type:c.ERROR,messageKey:"GLOBAL_DEC_SIZE_NOT_4_MULTIPLE"}:{type:c.GLOBAL_DEC,value:{id:t,size:s}}:{type:c.ERROR,messageKey:"GLOBAL_DEC_SIZE_TOO_LARGE"}}decodeLabel(e){if(3!==e.length||":"!==e[2])return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);return null===t?{type:c.ERROR,messageKey:"LABEL_ILLEGAL_ID"}:{type:c.LABEL,value:{id:t}}}decodeGoto(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);return null===t?{type:c.ERROR,messageKey:"GOTO_ILLEGAL_ID"}:{type:c.GOTO,value:{id:t}}}decodeIf(e){if(6!==e.length||"GOTO"!==e[4])return this.illegalInstructionFormatError;const t=this.decodeComponentSingular(e[1]);if(null===t)return{type:c.ERROR,messageKey:"IF_ILLEGAL_COND_OPERAND1"};if(t.type===I.IMM&&!Number.isFinite(t.imm))return{type:c.ERROR,messageKey:"IF_COND_OPERAND1_IMM_TOO_LARGE"};let s=L.EQ;switch(e[2]){case"==":s=L.EQ;break;case"!=":s=L.NE;break;case"<":s=L.LT;break;case"<=":s=L.LE;break;case">":s=L.GT;break;case">=":s=L.GE;break;default:return{type:c.ERROR,messageKey:"IF_ILLEGAL_COND_OPERATOR"}}const i=this.decodeComponentSingular(e[3]);if(null===i)return{type:c.ERROR,messageKey:"IF_ILLEGAL_COND_OPERAND2"};if(i.type===I.IMM&&!Number.isFinite(i.imm))return{type:c.ERROR,messageKey:"IF_COND_OPERAND2_IMM_TOO_LARGE"};const r=this.decodeComponentId(e[5]);return null===r?{type:c.ERROR,messageKey:"IF_ILLEGAL_GOTO_ID"}:{type:c.IF,value:{condition:{singularL:t,singularR:i,binaryRelOp:s},gotoId:r}}}decodeArg(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentSingular(e[1]);return null===t?{type:c.ERROR,messageKey:"ARG_ILLEGAL"}:t.type!==I.IMM||Number.isFinite(t.imm)?{type:c.ARG,value:{value:t}}:{type:c.ERROR,messageKey:"ARG_IMM_TOO_LARGE"}}decodeCall(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);return null===t?{type:c.ERROR,messageKey:"CALL_ILLEGAL_ID"}:{type:c.CALL,value:{id:t}}}decodeAssignCall(e){if(4!==e.length||":="!==e[1]||"CALL"!==e[2])return this.illegalInstructionFormatError;const t=this.decodeComponentLValue(e[0]);if(null===t)return{type:c.ERROR,messageKey:"ASSIGN_ILLEGAL_LEFT"};const s=this.decodeComponentId(e[3]);return null===s?{type:c.ERROR,messageKey:"CALL_ILLEGAL_ID"}:{type:c.ASSIGN_CALL,value:{lValue:t,functionId:s}}}decodeParam(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentId(e[1]);return null===t?{type:c.ERROR,messageKey:"PARAM_ILLEGAL_ID"}:{type:c.PARAM,value:{id:t}}}decodeReturn(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentSingular(e[1]);return null===t?{type:c.ERROR,messageKey:"RETURN_ILLEGAL"}:t.type!==I.IMM||Number.isFinite(t.imm)?{type:c.RETURN,value:{value:t}}:{type:c.ERROR,messageKey:"RETURN_IMM_TOO_LARGE"}}decodeRead(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentLValue(e[1]);return null===t?{type:c.ERROR,messageKey:"READ_ILLEGAL"}:{type:c.READ,value:{lValue:t}}}decodeWrite(e){if(2!==e.length)return this.illegalInstructionFormatError;const t=this.decodeComponentSingular(e[1]);return null===t?{type:c.ERROR,messageKey:"WRITE_ILLEGAL"}:t.type!==I.IMM||Number.isFinite(t.imm)?{type:c.WRITE,value:{value:t}}:{type:c.ERROR,messageKey:"WRITE_IMM_TOO_LARGE"}}decode(e){if(e.match(/^[ \t]*$/))return{type:c.EMPTY};const t={type:c.ERROR,messageKey:"UNRECOGNIZED_INSTRUCTION"},s=this.purify(e);if(s.startsWith(";"))return{type:c.COMMENT};const i=this.splitWhiteSpace(s);if(i.length<1)return t;switch(i[0]){case"FUNCTION":return this.decodeFunction(i);case"DEC":return this.decodeDec(i);case"GLOBAL_DEC":return this.decodeGlobalDec(i);case"LABEL":return this.decodeLabel(i);case"GOTO":return this.decodeGoto(i);case"IF":return this.decodeIf(i);case"ARG":return this.decodeArg(i);case"CALL":return this.decodeCall(i);case"PARAM":return this.decodeParam(i);case"RETURN":return this.decodeReturn(i);case"READ":return this.decodeRead(i);case"WRITE":return this.decodeWrite(i);default:const e=this.decodeAssign(i);if(e.type===c.ASSIGN)return e;const t=this.decodeAssignCall(i);return t.type===c.ASSIGN_CALL?t:e}}}!function(e){e[e.INITIAL=0]="INITIAL",e[e.BUSY=1]="BUSY",e[e.WAIT_INPUT=2]="WAIT_INPUT",e[e.FREE=3]="FREE",e[e.STATIC_CHECK_FAILED=4]="STATIC_CHECK_FAILED",e[e.RUNTIME_ERROR=5]="RUNTIME_ERROR",e[e.MAX_STEP_REACHED=6]="MAX_STEP_REACHED",e[e.EXITED_NORMALLY=7]="EXITED_NORMALLY",e[e.EXITED_ABNORMALLY=8]="EXITED_ABNORMALLY"}(h||(h={}));const g={instructions:[],text:[],memory:new Uint8Array},p={total:0,stack:0,globalVariable:0},N={labelTable:{},functionTable:{},globalVariableTable:{},variableTableStack:[],assignCallLValueStack:[]},C={stepCount:0,state:h.INITIAL,callStack:[],staticErrors:[],runtimeErrors:[]};var D;!function(e){e[e.SUCCESS=0]="SUCCESS",e[e.ERROR=1]="ERROR",e[e.WARNING=2]="WARNING",e[e.INPUT=3]="INPUT",e[e.OUTPUT=4]="OUTPUT",e[e.PROMPT=5]="PROMPT",e[e.ARROW=6]="ARROW"}(D||(D={}));const y={maxExecutionStepCount:{min:0,max:999999999},memorySize:{min:1024,max:16777216},stackSize:{min:512,max:16776192}},M={maxExecutionStepCount:1e6,memorySize:16384,stackSize:8192};3!==process.argv.length&&4!==process.argv.length&&(console.log("Usage:\nnode irvm.cjs <ir-file> [--en]"),process.exit(1));const G=s();let b;b=4===process.argv.length&&"--en"===process.argv[3]?i({locale:"en",messages:n[1].locale},G):i({locale:"zh-cn",messages:n[0].locale},G);const U=t.createInterface({input:process.stdin});let f;try{f=e.readFileSync(process.argv[2],{encoding:"utf-8"})}catch(e){console.error(e),process.exit(1)}const P=new class{initialRegisters={eax:0,ebx:0,ecx:0,edx:0,ebp:0,esp:M.memorySize,eip:0};decoder=new d;memory=a(g);registers=a(this.initialRegisters);tables=a(N);executionStatus=a(C);peakMemoryUsage=a(p);options=a(M);executionStartTime=new Date;writeBuffer=[];readConsole=e=>Promise.resolve("");entryFunctionName="main";setReadConsoleFn(e){this.readConsole=e}getSingleVariableValues(e){const t=[];for(let s=e.address;s<o(e.address,e.size);s=o(s,4)){const e=m(s,this.memory.memory);e.status===_.OUT_OF_BOUND?t.push(NaN):t.push(e.value)}return t}getSingleTableVariableDetails(e){const t=[];for(const s in e)t.push({id:s,address:e[s].address,size:e[s].size,values:this.getSingleVariableValues(e[s])});return t}get canContinueExecution(){return this.executionStatus.state===h.INITIAL||this.executionStatus.state===h.FREE||this.executionStatus.state===h.EXITED_NORMALLY||this.executionStatus.state===h.EXITED_ABNORMALLY}get currentLineNumber(){return this.registers.eip<0||this.registers.eip>=this.memory.text.length?-1:this.memory.text[this.registers.eip].lineNumber}get instructions(){return this.memory.instructions}get globalVariableDetails(){return this.getSingleTableVariableDetails(this.tables.globalVariableTable)}get localVariableDetailsStack(){const e=[];for(let t=0;t<this.tables.variableTableStack.length;t++)e.push({functionName:this.executionStatus.callStack[t],stackDepth:t,details:this.getSingleTableVariableDetails(this.tables.variableTableStack[t])});return e}get state(){return this.executionStatus.state}get staticErrors(){return a(this.executionStatus.staticErrors)}get runtimeErrors(){return a(this.executionStatus.runtimeErrors)}get currentOptions(){return a(this.options)}get stepCount(){return this.executionStatus.stepCount}get memoryUsage(){return{total:this.options.memorySize,used:this.registers.edx+this.options.memorySize-this.registers.esp,stackTotal:this.options.stackSize,stackUsed:this.options.memorySize-this.registers.esp,globalVariableTotal:this.options.memorySize-this.options.stackSize,globalVariableUsed:this.registers.edx}}get currentPeakMemoryUsage(){return this.peakMemoryUsage}get returnValue(){return this.registers.eax}updatePeakMemoryUsage(){const e=this.memoryUsage;this.peakMemoryUsage={total:Math.max(this.peakMemoryUsage.total,e.used),stack:Math.max(this.peakMemoryUsage.stack,e.stackUsed),globalVariable:Math.max(this.peakMemoryUsage.globalVariable,e.globalVariableUsed)}}flushWriteBuffer(e){void 0!==e&&e(this.writeBuffer),this.writeBuffer=[]}configure(e){if(this.executionStatus.state!==h.INITIAL)return;const t=(e,t)=>(e=Math.max(e,t.min),e=Math.min(e,t.max));void 0!==e.maxExecutionStepCount&&(e.maxExecutionStepCount=t(e.maxExecutionStepCount,y.maxExecutionStepCount),this.options.maxExecutionStepCount=e.maxExecutionStepCount),void 0!==e.memorySize&&(e.memorySize=t(e.memorySize,y.memorySize),e.memorySize=t(e.memorySize,{min:this.options.stackSize,max:y.memorySize.max}),this.options.memorySize=e.memorySize,this.initialRegisters.esp=E(e.memorySize),this.registers.esp=E(e.memorySize),this.updatePeakMemoryUsage()),void 0!==e.stackSize&&(e.stackSize=t(e.stackSize,y.stackSize),e.stackSize=t(e.stackSize,{min:y.stackSize.min,max:this.options.memorySize}),this.options.stackSize=e.stackSize)}reset(){this.memory.text=[],this.memory.memory=new Uint8Array,this.registers=a(this.initialRegisters),this.tables=a(N),this.executionStatus=a(C),this.peakMemoryUsage=a(p),this.writeBuffer=[]}loadNewInstructions(e){this.reset(),this.memory.instructions=e}loadAndDecodeNewInstructions(e){this.loadNewInstructions(e),this.decodeInstructions(!0)}decodeInstructions(e){for(let t=0;t<this.memory.instructions.length;t++){const s=this.decoder.decode(this.memory.instructions[t]);if(s.type!==c.EMPTY&&s.type!==c.COMMENT)if(s.type!==c.ERROR){if(!e)switch(s.type){case c.LABEL:this.tables.labelTable[s.value.id]={addressBefore:E(this.memory.text.length-1)};break;case c.FUNCTION:this.tables.functionTable[s.value.id]={addressBefore:E(this.memory.text.length-1)};break;default:this.memory.text.push({...s,lineNumber:t+1,instructionLength:this.memory.instructions[t].length})}}else e||(this.executionStatus.state=h.STATIC_CHECK_FAILED,this.writeBuffer.push([{key:"DECODE_ERROR_PREFIX",values:{lineNumber:t+1},type:D.ERROR},{key:s.messageKey,type:D.ERROR}])),this.executionStatus.staticErrors.push({startLineNumber:t+1,endLineNumber:t+1,startColumn:1,endColumn:this.memory.instructions[t].length,message:{key:s.messageKey}})}this.entryFunctionName in this.tables.functionTable||e||(this.executionStatus.state=h.STATIC_CHECK_FAILED,this.writeBuffer.push([{key:"STATIC_ERROR_PREFIX",type:D.ERROR},{key:"NO_MAIN_FUNCTION",type:D.ERROR}]))}initializeMemoryRegister(){if(this.registers.eip=o(this.tables.functionTable[this.entryFunctionName].addressBefore,1),this.memory.memory=new Uint8Array(this.options.memorySize).fill(256*Math.random()),this.registers.esp=E(this.options.memorySize),this.updatePeakMemoryUsage(),this.pushl(this.registers.ecx)&&this.pushl(E(this.memory.text.length))&&this.pushl(this.registers.ebp)){this.registers.ebp=this.registers.esp,this.tables.assignCallLValueStack.push(null),this.tables.variableTableStack.push({}),this.executionStatus.callStack.push(this.entryFunctionName);for(const e of this.memory.text)if(e.type===S.GLOBAL_DEC){const t=e.value;if(!this.checkGlobalVariableSegmentSize(t.size))return void this.writeRuntimeError({key:"GLOBAL_VARIABLE_SEGMENT_OVERFLOW"},e.lineNumber);if(t.id in this.tables.globalVariableTable)return void this.writeRuntimeError({key:"DUPLICATE_GLOBAL_DEC_ID"},e.lineNumber);this.memory.memory.subarray(this.registers.edx,o(this.registers.edx,t.size)).fill(0),this.tables.globalVariableTable[t.id]={size:t.size,address:this.registers.edx},this.registers.edx=o(this.registers.edx,t.size),this.updatePeakMemoryUsage(),this.executionStatus.stepCount++}}}prepareExcution(){this.decodeInstructions(),this.executionStatus.state===h.INITIAL&&(this.initializeMemoryRegister(),this.executionStatus.state===h.INITIAL&&(this.executionStatus.state=h.FREE,this.executionStartTime=new Date))}finalizeExcution(){const e=new Date;this.registers.edx=0,this.updatePeakMemoryUsage(),this.tables.globalVariableTable={},this.executionStatus.state=0===this.registers.eax?h.EXITED_NORMALLY:h.EXITED_ABNORMALLY,this.writeBuffer.push([{key:"PROGRAM_EXITED",values:{returnValue:this.registers.eax},type:0===this.registers.eax?D.SUCCESS:D.WARNING}]),this.writeBuffer.push([{key:"EXECUTION_STEP_COUNT_TIME",values:{stepCount:this.executionStatus.stepCount,time:e.getTime()-this.executionStartTime.getTime()},type:0===this.registers.eax?D.SUCCESS:D.WARNING}])}writeRuntimeError(e,t){this.executionStatus.state=h.RUNTIME_ERROR,this.executionStatus.runtimeErrors.push({startLineNumber:t??this.memory.text[this.registers.eip].lineNumber,endLineNumber:t??this.memory.text[this.registers.eip].lineNumber,startColumn:1,endColumn:this.memory.text[this.registers.eip].instructionLength,message:e}),this.writeBuffer.push([{key:"RUNTIME_ERROR_PREFIX",values:{lineNumber:t??this.memory.text[this.registers.eip].lineNumber},type:D.ERROR},Object.assign(e,{type:D.ERROR})])}checkStackSize(e){return this.options.memorySize-u(this.registers.esp,e)<=this.options.stackSize}checkGlobalVariableSegmentSize(e){return o(this.registers.edx,e)<=this.options.memorySize-this.options.stackSize}loadMemory32(e){const t=m(e,this.memory.memory);return t.status===_.OUT_OF_BOUND?(this.writeRuntimeError({key:"MEMORY_READ_OUT_OF_BOUND",values:{address:e}}),null):t.value}storeMemory32(e,t){const s=function(e,t,s){return t<0||t+4>s.length?R.OUT_OF_BOUND:(s[t]=255&e,s[t+1]=(65280&e)>>>8,s[t+2]=(16711680&e)>>>16,s[t+3]=(4278190080&e)>>>24,R.SUCCESS)}(e,t,this.memory.memory);return s!==R.OUT_OF_BOUND||(this.writeRuntimeError({key:"MEMORY_WRITE_OUT_OF_BOUND",values:{address:t}}),!1)}pushl(e){return this.checkStackSize(4)?(this.registers.esp=u(this.registers.esp,4),this.updatePeakMemoryUsage(),!!this.storeMemory32(e,this.registers.esp)):(this.writeRuntimeError({key:"STACK_OVERFLOW"}),!1)}popl(){const e=this.loadMemory32(this.registers.esp);return null===e?null:(this.registers.esp=o(this.registers.esp,4),this.updatePeakMemoryUsage(),e)}getVariableById(e,t){return 0===this.tables.variableTableStack.length?(this.writeRuntimeError({key:"EMPTY_VARIABLE_TABLE_STACK"}),null):e in this.tables.variableTableStack[this.tables.variableTableStack.length-1]?this.tables.variableTableStack[this.tables.variableTableStack.length-1][e]:e in this.tables.globalVariableTable?this.tables.globalVariableTable[e]:(t&&this.writeRuntimeError({key:"VARIABLE_NOT_FOUND",values:{id:e}}),null)}getSingularValue(e){if(e.type===I.IMM)return e.imm;{const t=this.getVariableById(e.id,!0);if(null===t)return null;if(e.type===I.ADDRESS_ID)return t.address;const s=this.loadMemory32(t.address);if(null===s)return null;if(e.type===I.ID)return s;const i=this.loadMemory32(s);return null===i?null:i}}getRValue(e){switch(e.type){case O.SINGULAR:return this.getSingularValue(e.singular);case O.BINARY_MATH_OP:{const t=this.getSingularValue(e.singularL);if(null===t)return null;const s=this.getSingularValue(e.singularR);if(null===s)return null;switch(e.binaryMathOp){case A.ADD:return o(t,s);case A.SUB:return u(t,s);case A.MUL:return function(e,t){const s=65535&e,i=65535&t;return E((((4294901760&e)>>>16)*i+s*((4294901760&t)>>>16)<<16)+s*i)}(t,s);case A.DIV:return 0===s?(this.writeRuntimeError({key:"DIVIDE_BY_ZERO"}),null):E(t/s)}}}}createStackVariable(e,t){if(!this.checkStackSize(t))return this.writeRuntimeError({key:"STACK_OVERFLOW"}),null;this.registers.esp=u(this.registers.esp,t),this.updatePeakMemoryUsage();const s={address:this.registers.esp,size:t};return 0===this.tables.variableTableStack.length?(this.writeRuntimeError({key:"EMPTY_VARIABLE_TABLE_STACK"}),null):e in this.tables.variableTableStack[this.tables.variableTableStack.length-1]?(this.writeRuntimeError({key:"DUPLICATE_DEC_ID",values:{id:e}}),null):(this.tables.variableTableStack[this.tables.variableTableStack.length-1][e]=s,s)}getLValueAddress(e){let t=this.getVariableById(e.id,e.type===T.DEREF_ID);if(null===t){if(e.type!==T.ID)return null;if(t=this.createStackVariable(e.id,4),null===t)return null}let s=t.address;if(e.type===T.DEREF_ID){const e=this.loadMemory32(t.address);if(null===e)return null;s=e}return s}getCondValue(e){const t=this.getSingularValue(e.singularL);if(null===t)return null;const s=this.getSingularValue(e.singularR);if(null===s)return null;switch(e.binaryRelOp){case L.EQ:return t===s;case L.NE:return t!==s;case L.LT:return t<s;case L.LE:return t<=s;case L.GT:return t>s;case L.GE:return t>=s}}async executeSingleStep(){if(this.executionStatus.state!==h.EXITED_NORMALLY&&this.executionStatus.state!==h.EXITED_ABNORMALLY||this.reset(),this.executionStatus.state===h.INITIAL&&(this.reset(),this.prepareExcution()),this.executionStatus.state!==h.FREE)return;if(this.executionStatus.state=h.BUSY,this.options.maxExecutionStepCount>0&&this.executionStatus.stepCount>=this.options.maxExecutionStepCount)return this.executionStatus.state=h.MAX_STEP_REACHED,void this.writeBuffer.push([{key:"MAX_STEP_REACHED",values:{maxExecutionStepCount:this.options.maxExecutionStepCount},type:D.ERROR}]);if(this.registers.eip>=this.memory.text.length||this.registers.eip<0)return this.executionStatus.state=h.RUNTIME_ERROR,void this.writeBuffer.push([{key:"RUNTIME_ERROR_PREFIX_NO_LN",type:D.ERROR},{key:"INSTRUCTION_READ_OUT_OF_BOUND",values:{address:this.registers.eip},type:D.ERROR}]);this.executionStatus.stepCount++;const e=this.memory.text[this.registers.eip];switch(e.type){case S.ARG:{const t=this.getSingularValue(e.value.value);if(null===t||!this.pushl(t))return;this.registers.ecx=o(this.registers.ecx,4);break}case S.ASSIGN:{const t=this.getRValue(e.value.rValue);if(null===t)return;const s=this.getLValueAddress(e.value.lValue);if(null===s)return;if(!this.storeMemory32(t,s))return;break}case S.ASSIGN_CALL:case S.CALL:{const t=e.type===S.CALL?e.value.id:e.value.functionId;if(!(t in this.tables.functionTable))return void this.writeRuntimeError({key:"FUNCTION_NOT_FOUND",values:{id:t}});if(this.registers.ebx=this.registers.esp,!this.pushl(this.registers.ecx))return;if(this.registers.ecx=0,!this.pushl(this.registers.eip))return;if(!this.pushl(this.registers.ebp))return;this.registers.ebp=this.registers.esp,e.type===S.ASSIGN_CALL?this.tables.assignCallLValueStack.push(e.value.lValue):this.tables.assignCallLValueStack.push(null),this.tables.variableTableStack.push({}),this.executionStatus.callStack.push(t),this.registers.eip=this.tables.functionTable[t].addressBefore;break}case S.DEC:if(null===this.createStackVariable(e.value.id,e.value.size))return;break;case S.GOTO:{const t=e.value.id;if(!(t in this.tables.labelTable))return void this.writeRuntimeError({key:"LABEL_NOT_FOUND",values:{id:t}});this.registers.eip=this.tables.labelTable[t].addressBefore;break}case S.IF:{const t=this.getCondValue(e.value.condition);if(null===t)return;const s=e.value.gotoId;if(!(s in this.tables.labelTable))return void this.writeRuntimeError({key:"LABEL_NOT_FOUND",values:{id:s}});t&&(this.registers.eip=this.tables.labelTable[s].addressBefore);break}case S.PARAM:{const t=e.value.id;if(t in this.tables.variableTableStack[this.tables.variableTableStack.length-1])return void this.writeRuntimeError({key:"DUPLICATE_PARAM_ID",values:{id:t}});if(null===this.loadMemory32(this.registers.ebx))return;this.tables.variableTableStack[this.tables.variableTableStack.length-1][t]={address:this.registers.ebx,size:4},this.registers.ebx=o(this.registers.ebx,4);break}case S.RETURN:{const t=this.getSingularValue(e.value.value);if(null===t)return;this.registers.eax=t,this.registers.esp=this.registers.ebp,this.updatePeakMemoryUsage();const s=this.popl();if(null===s)return;this.registers.ebp=s;const i=this.popl();if(null===i)return;this.registers.eip=i;const r=this.popl();if(null===r)return;if(this.registers.esp=o(this.registers.esp,r),this.updatePeakMemoryUsage(),this.registers.ecx=0,0===this.tables.variableTableStack.length)return void this.writeRuntimeError({key:"EMPTY_VARIABLE_TABLE_STACK"});if(this.executionStatus.callStack.pop(),this.tables.variableTableStack.pop(),this.registers.eip===this.memory.text.length)return void this.finalizeExcution();const a=this.tables.assignCallLValueStack.pop();if(null!==a){const e=this.getLValueAddress(a);if(null===e)return;if(!this.storeMemory32(this.registers.eax,e))return}break}case S.READ:{const t=e.value,s=this.getLValueAddress(t.lValue);if(null===s)return;const i=t.lValue.type===T.ID?t.lValue.id:"*"+t.lValue.id;this.executionStatus.state=h.WAIT_INPUT;const r=await this.readConsole([{key:"READ_PROMPT",values:{name:i}}]);this.executionStatus.state=h.BUSY;const a=parseInt(r);if(isNaN(a))return void this.writeRuntimeError({key:"INPUT_INT_ILLEGAL"});if(!Number.isSafeInteger(a))return void this.writeRuntimeError({key:"INPUT_INT_ABS_TOO_LARGE"});if(!this.storeMemory32(E(a),s))return;break}case S.WRITE:{const t=this.getSingularValue(e.value.value);if(null===t)return;this.writeBuffer.push([{key:"WRITE_OUTPUT",values:{value:t},type:D.OUTPUT}]);break}}for(this.registers.eip=o(this.registers.eip,1);this.registers.eip<this.memory.text.length&&this.registers.eip>=0&&this.memory.text[this.registers.eip].type===S.GLOBAL_DEC;)this.registers.eip=o(this.registers.eip,1);this.executionStatus.state=h.FREE}async execute(){for(;await this.executeSingleStep(),this.executionStatus.state===h.FREE;);}};P.configure({maxExecutionStepCount:0});let B=null;switch(P.setReadConsoleFn((e=>(U.on("line",(e=>{B?.(e)})),new Promise((e=>{B=e}))))),P.loadNewInstructions(f.replace(/\r/g,"").split("\n")),await P.execute(),P.flushWriteBuffer((e=>{for(const t of e){let e=!1;for(const s of t)s.type!==D.OUTPUT&&s.type!==D.ERROR||(process.stdout.write(b.formatMessage({id:s.key},s.values)),e=!0);e&&process.stdout.write("\n")}})),P.state){case h.EXITED_NORMALLY:process.exit(0);case h.EXITED_ABNORMALLY:process.exit(P.returnValue);case h.STATIC_CHECK_FAILED:case h.RUNTIME_ERROR:process.exit(1)}
