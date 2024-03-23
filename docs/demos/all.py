import os
import sys

def compile_single(dir:str,file_name:str):
    print(f"Compiling {dir}/{file_name}")
    os.system(f"cc {dir}/{file_name} {dir}/{file_name[:-4]}.ir")

def compile_in_dir(dir:str):
    for file_name in os.listdir(dir):
            if file_name.endswith(".cmm"):
                 compile_single(dir,file_name)

if len(sys.argv)==1:
    for dir in os.listdir("."):
        if os.path.isdir(dir):
             compile_in_dir(dir)
elif len(sys.argv)==2:
    compile_in_dir(sys.argv[1])
else:
    if sys.argv[2].endswith(".cmm"):
        compile_single(sys.argv[1],sys.argv[2])
    else:
        compile_single(sys.argv[1],sys.argv[2]+".cmm")
