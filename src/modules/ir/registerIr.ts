import type { Monaco } from "@monaco-editor/react";

let isIrRegistered: boolean = false;

export const irLanguageId = "ir";

export function registerIr(monaco: Monaco) {
    if (isIrRegistered) {
        return;
    }

    monaco.languages.register({
        id: irLanguageId
    });

    monaco.editor.defineTheme("ir-theme", {
        base: "vs",
        inherit: true,
        rules: [
            {
                token: "function",
                foreground: "#74531f"
            },
            {
                token: "number.size",
                foreground: "#0097ff"
            }
        ],
        colors: {}
    });

    const irKeywords = [
        "FUNCTION",
        "DEC",
        "GLOBAL_DEC",
        "LABEL",
        "GOTO",
        "IF",
        "ARG",
        "PARAM",
        "CALL",
        "RETURN",
        "READ",
        "WRITE"
    ];

    monaco.languages.setMonarchTokensProvider(irLanguageId, {
        keywords: irKeywords,
        identifier: /[a-zA-Z_]\w*/,
        whitespace: /[ \t\r\n]+/,
        defaultToken: "source",
        tokenizer: {
            root: [
                [/#-?\d+/, "number"],
                [/\d+/, "number.size"],
                [
                    /(:=)|(\+)|(-)|(\*)|(\/)|(==)|(!=)|(<=)|(<)|(>=)|(>)|(&)/,
                    "operators"
                ],
                [/:/, "delimiter"],
                [/;.*/, "comment"],
                [/@whitespace/, "white"],
                [
                    /(FUNCTION)(@whitespace)(@identifier)/,
                    ["keyword", "white", "function"]
                ],
                [
                    /(CALL)(@whitespace)(@identifier)/,
                    ["keyword", "white", "function"]
                ],
                [
                    /@identifier/,
                    {
                        cases: {
                            "@keywords": "keyword",
                            "@default": "identifier"
                        }
                    }
                ]
            ]
        }
    });

    monaco.languages.registerCompletionItemProvider(irLanguageId, {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            return {
                suggestions: irKeywords.map(x => ({
                    label: x,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: x,
                    range: {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn
                    }
                }))
            };
        }
    });

    isIrRegistered = true;
}
