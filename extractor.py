import os
import mimetypes
import fnmatch

def save_code(root_dir, out_file, exts=None, ex_dirs=None, ex_files=None):
    if exts is None:
        exts = ['.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
                '.java', '.kt', '.cpp', '.c', '.cs', '.go', '.rs']
    if ex_dirs is None:
        ex_dirs = ['node_modules', '.next', 'dist', 'build', '__pycache__', 'venv']
    if ex_files is None:
        ex_files = ['.env', '.env.*']

    out_abs = os.path.abspath(out_file)
    script_abs = os.path.abspath(__file__)
    processed = set()

    with open(out_file, 'w', encoding='utf-8') as out:
        for root, dirs, files in os.walk(root_dir, topdown=True):
            dirs[:] = [d for d in dirs if d not in ex_dirs]
            for f in files:
                if any(fnmatch.fnmatch(f, p) for p in ex_files):
                    continue

                fp = os.path.join(root, f)
                abs_fp = os.path.abspath(fp)
                if abs_fp in (out_abs, script_abs):
                    continue

                real_fp = os.path.realpath(abs_fp)
                if real_fp in processed:
                    continue
                processed.add(real_fp)

                if any(f.lower().endswith(ext.lower()) for ext in exts):
                    mime, _ = mimetypes.guess_type(fp)
                    if mime and not mime.startswith('text'):
                        continue
                    try:
                        with open(fp, 'r', encoding='utf-8') as file:
                            content = file.read()
                        out.write("File: " + fp + "\n")
                        out.write(content + "\n")
                    except Exception as e:
                        out.write("Error reading " + fp + ": " + str(e) + "\n")

if __name__ == "__main__":
    root = os.getcwd()
    out_filename = os.path.join(root, "all_code.txt")
    exts = ['.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
            '.java', '.kt', '.cpp', '.c', '.cs', '.go', '.rs']
    ex_dirs = ['node_modules', '.next', 'dist', 'build', '__pycache__', 'venv', 'orpheus_env']
    ex_files = ['.env', '.env.*','next-env.d.ts','next.config.ts']
    save_code(root, out_filename, exts, ex_dirs, ex_files)
    print("All code saved to:", out_filename)
