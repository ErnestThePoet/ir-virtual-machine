import { AppLocale } from ".";

const en: AppLocale = {
    APP_TITLE: "IR Virtual Machine",

    // UI strings
    ADD: "New",
    IMPORT: "Import",
    SAVE: "Save",
    THEME: "Theme",
    ABOUT: "About",
    CLOSE: "Close",
    CONFIRM_UNSAVED_CLOSE: "Save changes to {name} before close?",
    SAVE_CLOSE: "Save&Close",
    UNSAVE_CLOSE: "Close",
    OK: "OK",
    CANCEL: "Cancel",
    EMPTY_PLACEHOLDER: "No VM open. Try adding or importing an IR file! :)",
    EMPTY_PLACEHOLDER_SUPPORT_DRAG:
        "You may also drag multiple .ir files inside.",
    IR_IMPORT_FAILED: "Failed to import {fileName}",

    RUN: "Run",
    RUN_STEP: "Step",
    RESET: "Reset",
    CLEAR_CONSOLE: "Clear",

    STEP_COUNT: "Step Count: ",
    STATE: "VM State: ",
    STATE_INITIAL: "INITIAL",
    STATE_BUSY: "BUSY",
    STATE_WAIT_INPUT: "AWAITING_INPUT",
    STATE_FREE: "FREE",
    STATE_STATIC_CHECK_FAILED: "IR Static Check Error",
    STATE_RUNTIME_ERROR: "Runtime Error",
    STATE_MAX_STEP_REACHED: "Max Step Count Reached",
    STATE_EXITED_NORMALLY: "Exited Normally(Return value 0)",
    STATE_EXITED_ABNORMALLY: "Exited Abnormally(Return value not 0)",

    MAX_EXECUTION_STEP_COUNT: "Max Steps",
    MEMORY_SIZE: "Memory Size/B",
    STACK_SIZE: "Stack Size/B",

    TOTAL_MEMORY_USAGE: "Total Memory Usage: ",
    STACK_MEMORY_USAGE: "Stack Memory Usage: ",
    GLOBAL_VARIABLE_MEMORY_USAGE: "GlobalVar Memory Usage: ",
    PERCENTAGE_USAGE: "{percentage, number, ::.0}%",
    B_USAGE: "{used}B/{total}B",
    KB_USAGE: "{used, number, ::.0}KB/{total, number, ::.0}KB",

    GLOBAL_VARIABLE_TABLE: "Global Variable Table",
    LOCAL_VARIABLE_TABLE: "Local Variable Table",
    VARIABLE_ID: "ID",
    ADDRESS: "Address",
    SIZE: "Size",
    VALUES: "Value",
    EMPTY_VATIABLE_TABLE: "(Empty)",

    // Static error check messages
    STATIC_ERROR_PREFIX: "Static Check Error: ",
    DECODE_ERROR_PREFIX: "IR Decoding Error(Line {lineNumber}): ",
    UNRECOGNIZED_INSTRUCTION: "Unrecognized IR instruction",
    ILLEGAL_INSTRUCTION_FORMAT: "Illegal IR format",
    FUNCTION_ILLEGAL_ID: "FUNCTION id illegal",
    ASSIGN_ILLEGAL_LEFT: "Illegal left hand side of assignment",
    ASSIGN_ILLEGAL_RIGHT: "Illegal right hand side of assignment",
    ASSIGN_ILLEGAL_RIGHT_OPERATOR: "Illegal math operator on RHS of assignment",
    ASSIGN_ILLEGAL_RIGHT_OPERAND1:
        "Illegal first Singular operand on RHS of assignment",
    ASSIGN_ILLEGAL_RIGHT_OPERAND2:
        "Illegal second Singular operand on RHS of assignment",
    DEC_ILLEGAL_ID: "DEC's id illegal",
    DEC_ILLEGAL_SIZE_FORMAT: "DEC's size format illegal",
    DEC_SIZE_TOO_LARGE: "DEC's size too large",
    DEC_SIZE_NOT_4_MULTIPLE: "DEC's size not a multiple of 4",
    GLOBAL_DEC_ILLEGAL_ID: "GLOBAL_DEC's id illegal",
    GLOBAL_DEC_ILLEGAL_SIZE_FORMAT: "GLOBAL_DEC's size format illegal",
    GLOBAL_DEC_SIZE_TOO_LARGE: "GLOBAL_DEC's size too large",
    GLOBAL_DEC_SIZE_NOT_4_MULTIPLE: "GLOBAL_DEC's size not a multiple of 4",
    LABEL_ILLEGAL_ID: "LABEL's id illegal",
    GOTO_ILLEGAL_ID: "GOTO's id illegal",
    IF_ILLEGAL_COND_OPERATOR: "IF's relop illegal",
    IF_ILLEGAL_COND_OPERAND1:
        "IF's first Singular operand in condition illegal",
    IF_ILLEGAL_COND_OPERAND2:
        "IF's second Singular operand in condition illegal",
    IF_ILLEGAL_GOTO_ID: "IF's GOTO id illegal",
    ARG_ILLEGAL: "ARG's Singular arg illegal",
    CALL_ILLEGAL_ID: "CALL's function id illegal",
    PARAM_ILLEGAL_ID: "PARAM's param id illegal",
    RETURN_ILLEGAL: "RETURN's Singular return value illegal",
    READ_ILLEGAL: "Illegal LValue for READ",
    WRITE_ILLEGAL: "Illegal Singular for WRITE",
    NO_MAIN_FUNCTION: "Function main is not defined",

    // Runtime error messages
    RUNTIME_ERROR_PREFIX: "Runtime Error(Line{lineNumber}): ",
    RUNTIME_ERROR_PREFIX_NO_LN: "Runtime Error: ",
    GLOBAL_VARIABLE_SEGMENT_OVERFLOW: "Global variable segment overflow",
    STACK_OVERFLOW: "Stack overflow",
    VARIABLE_NOT_FOUND: "Can't find variable {id}",
    FUNCTION_NOT_FOUND: "Can't find function {id}",
    LABEL_NOT_FOUND: "Can't find label {id}",
    INSTRUCTION_READ_OUT_OF_BOUND:
        "Reading instruction from {address} is out of bound",
    MEMORY_READ_OUT_OF_BOUND: "Writing 4 bytes to {address} is out of bound",
    MEMORY_WRITE_OUT_OF_BOUND: "Reading 4 bytes from {address} is out of bound",
    EMPTY_VARIABLE_TABLE_STACK: "Empty local variable stack",
    DUPLICATE_DEC_ID: "DEC's variable id already declared",
    DUPLICATE_GLOBAL_DEC_ID: "GLOBAL_DEC's global variable id already declared",
    DUPLICATE_PARAM_ID: "PARAM's param id already declared",

    // Other error messages
    MAX_STEP_REACHED:
        "Maximum execution step count reached({maxExecutionStepCount})",
    EXITED_ABNORMALLY:
        "Program exited with return value {returnValue}. Total execution step count: {stepCount}",
    INPUT_INT_ILLEGAL: "Illegal input integer",
    INPUT_INT_ABS_TOO_LARGE: "Absolute value of input integer too large",

    // Console normal messages
    WRITE_OUTPUT: "{value}",
    READ_PROMPT: "Please enter a value for {name}: ",
    CONSOLE_ARROW: ">",
    READ_INPUT: "{value}",
    EXITED_NORMALLY:
        "Program exited with return value 0. Total execution step count: {stepCount}"
};

export default en;
