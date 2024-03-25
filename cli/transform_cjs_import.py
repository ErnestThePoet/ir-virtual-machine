import re
import sys

if len(sys.argv)!=2:
    print("Usage:\npython transform_cjs_import.py <file-path>")
    exit(1)

cjs_import_patterns=[re.compile("(\\s*import\\s+)(.+)(\\s+from\\s*[\"']lodash[\"']\\s*;\\s*)")]

with open(sys.argv[1],"r",encoding="utf-8") as fin:
    lines=fin.readlines()

current_package_index=0
with open(sys.argv[1],"w",encoding="utf-8") as fout:
    for line in lines:
        rewritten=False
        for pattern in cjs_import_patterns:
            if (match_result:=pattern.match(line)) is not None:
                current_package_name=f"__pkg_{current_package_index}"
                current_package_index+=1
                fout.write(f"{match_result.group(1)}{current_package_name}{match_result.group(3)}")
                fout.write(f"const {match_result.group(2)} = {current_package_name};\n")
                rewritten=True
                break
        if not rewritten:
            fout.write(line)
