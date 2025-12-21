import bpy
import json
import os

def restore_assembled_state():
    state_path = "/Users/andresguarnizo/Projects/Personal_Website/lamp_assembled_state.json"
    if not os.path.exists(state_path):
        print(f"Error: {state_path} not found.")
        return

    with open(state_path, 'r') as f:
        state = json.load(f)

    for obj_name, transforms in state.items():
        obj = bpy.data.objects.get(obj_name)
        if obj:
            obj.location = transforms["location"]
            obj.rotation_euler = transforms["rotation_euler"]
            obj.scale = transforms["scale"]
            print(f"Restored {obj_name}")

if __name__ == "__main__":
    restore_assembled_state()

