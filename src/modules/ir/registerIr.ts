import type { Monaco } from "@monaco-editor/react";

export const irLanguageId = "ir";

export function registerIr(monaco: Monaco) {
    monaco.languages.register({
        id: irLanguageId
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
        defaultToken: "invalid",
        tokenizer: {
            root: [
                [/#-?\d+/, "number"],
                [/\d+/, "number"],
                [
                    /(:=)|(\+)|(-)|(\*)|(\/)|(==)|(!=)|(<=)|(<)|(>=)|(>)|(&)/,
                    "operators"
                ],
                [/:/, "delimiter"],
                [/;.*/, "comment"],
                [/@whitespace/, "white"],
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
}
