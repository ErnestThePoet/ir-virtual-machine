import type { Monaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import { IR_KEYWORDS } from "../vm/decoder";

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

    const irIdentifierPattern = "[a-zA-Z_]\\w*";
    const irWhiteSpacePattern = "[ \\t\\r\\n]+";

    monaco.languages.setMonarchTokensProvider(irLanguageId, {
        keywords: IR_KEYWORDS,
        identifier: irIdentifierPattern,
        whitespace: irWhiteSpacePattern,
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
                    ...IR_KEYWORDS.map(x => ({
                        label: x,
                        kind: monaco.languages.CompletionItemKind.Keyword,
                        insertText: x,
                        range
                    })),
                    ...IR_KEYWORDS.map((x, i) => ({
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

    monaco.languages.registerFoldingRangeProvider(irLanguageId, {
        provideFoldingRanges: model => {
            const lines = model.getLinesContent();
            const ranges: monacoEditor.languages.FoldingRange[] = [];
            let functionLineNumber = -1;
            let returnLineNumber = -1;
            let nonEmptyLineNumber = -1;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();

                if (line !== "") {
                    nonEmptyLineNumber = i + 1;
                }

                if (
                    line.match(
                        `^FUNCTION${irWhiteSpacePattern}` +
                            `${irIdentifierPattern}${irWhiteSpacePattern}:$`
                    )
                ) {
                    if (functionLineNumber !== -1 && returnLineNumber !== -1) {
                        ranges.push({
                            start: functionLineNumber,
                            end: returnLineNumber,
                            kind: monaco.languages.FoldingRangeKind.Region
                        });

                        returnLineNumber = -1;
                    }
                    functionLineNumber = i + 1;
                } else if (
                    line.match(
                        `^RETURN${irWhiteSpacePattern}` +
                            // Singular pattern defined in VM decoder
                            `((#-?\\d+)|([a-zA-Z_]\\w*)|(\\*[a-zA-Z_]\\w*)|(&[a-zA-Z_]\\w*))$`
                    )
                ) {
                    returnLineNumber = i + 1;
                }
            }

            ranges.push({
                start: functionLineNumber,
                end: nonEmptyLineNumber,
                kind: monaco.languages.FoldingRangeKind.Region
            });

            return ranges;
        }
    });

    monaco.languages.setLanguageConfiguration(irLanguageId, {
        comments: {
            lineComment: ";"
        }
    });

    isIrRegistered = true;
}
