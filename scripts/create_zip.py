import os
import zipfile

def create_project_zip():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(root_dir, 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    zip_output_public = os.path.join(public_dir, 'budgetbuddy-project.zip')
    zip_output_root = os.path.join(root_dir, 'budgetbuddy-project.zip')

    ignore_dirs = {
        'node_modules', '.git', 'dist', '.aistudio', '.cache', '__pycache__'
    }
    ignore_files = {
        'budgetbuddy-project.zip', '.DS_Store'
    }

    files_added = 0
    with zipfile.ZipFile(zip_output_public, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for dirpath, dirnames, filenames in os.walk(root_dir):
            # Prune ignored directories in place
            dirnames[:] = [d for d in dirnames if d not in ignore_dirs and not d.startswith('.git')]
            
            for f in filenames:
                if f in ignore_files or f.endswith('.zip'):
                    continue
                full_path = os.path.join(dirpath, f)
                rel_path = os.path.relpath(full_path, root_dir)
                # Don't include files from public that are the zip itself
                if 'budgetbuddy-project.zip' in rel_path:
                    continue
                zipf.write(full_path, rel_path)
                files_added += 1

    # Also copy or link to root for direct access
    import shutil
    shutil.copy2(zip_output_public, zip_output_root)

    print(f"Project zip created successfully with {files_added} files.")
    print(f"Public path: {zip_output_public}")
    print(f"Root path: {zip_output_root}")

if __name__ == '__main__':
    create_project_zip()
