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

    const irKeywordSnippetParts = [
        "FUNCTION ${1:id} :\n",
        "DEC ${1:id} ${2:size}",
        "GLOBAL_DEC ${1:id} ${2:size}",
        "LABEL ${1:id} :\n",
        "GOTO ${1:label}",
        "IF ${1:condition} GOTO ${2:label}",
        "ARG ${1:value}",
        "PARAM ${1:id}",
        "CALL ${1:id}",
        "RETURN ${1:value}",
        "READ ${1:id}",
        "WRITE ${1:value}"
    ];

    monaco.languages.registerCompletionItemProvider(irLanguageId, {
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn
            };
            return {
                suggestions: [
                    ...irKeywords.map(x => ({
                        label: x,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: x,
                        range
                    })),
                    ...irKeywords.map((x, i) => ({
                        label: `${x} Snippet`,
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: irKeywordSnippetParts[i],
                        insertTextRules:
                            monaco.languages.CompletionItemInsertTextRule
                                .InsertAsSnippet,
                        range
                    }))
                ]
            };
        }
    });

    monaco.languages.setLanguageConfiguration(irLanguageId, {
        comments: {
            lineComment: ";"
        }
    });

    isIrRegistered = true;
}
