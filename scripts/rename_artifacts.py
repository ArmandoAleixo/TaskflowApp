#!/usr/bin/env python3
"""Rename artifacts directories for TaskFlow"""

import os
import shutil
import json
from pathlib import Path

def main():
    artifacts_dir = Path(__file__).parent.parent / "artifacts"
    
    print("🔄 Renaming directories...\n")
    
    # Rename api-server to taskflow-backend
    api_server = artifacts_dir / "api-server"
    taskflow_backend = artifacts_dir / "taskflow-backend"
    
    if api_server.exists():
        print(f"Moving {api_server.name} → taskflow-backend")
        if taskflow_backend.exists():
            shutil.rmtree(taskflow_backend)
        shutil.move(str(api_server), str(taskflow_backend))
        print(f"✅ Done!")
    
    # Rename taskflow to taskflow-frontend
    taskflow = artifacts_dir / "taskflow"
    taskflow_frontend = artifacts_dir / "taskflow-frontend"
    
    if taskflow.exists():
        print(f"Moving {taskflow.name} → taskflow-frontend")
        if taskflow_frontend.exists():
            shutil.rmtree(taskflow_frontend)
        shutil.move(str(taskflow), str(taskflow_frontend))
        print(f"✅ Done!")
    
    # Update package.json in taskflow-backend
    print("\n📝 Updating package names...\n")
    package_json = taskflow_backend / "package.json"
    
    if package_json.exists():
        with open(package_json, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        data["name"] = "@workspace/taskflow-backend"
        
        with open(package_json, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Updated {package_json.name}")
    
    print("\n✅ All done! New structure:")
    print("   📁 artifacts/taskflow-backend")
    print("   📁 artifacts/taskflow-frontend")

if __name__ == "__main__":
    main()
