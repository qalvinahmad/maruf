import os
import json
from pathlib import Path

def count_dataset_info():
    """Count and analyze dataset information"""
    dataset_path = Path(__file__).parent.parent / 'dataset'
    
    stats = {
        'total_files': 0,
        'total_classes': 0,
        'classes': {},
        'audio_files': 0,
        'image_files': 0,
        'text_files': 0,
        'size_mb': 0
    }
    
    if not dataset_path.exists():
        return stats
        
    # Walk through dataset directory
    for root, dirs, files in os.walk(dataset_path):
        # Count classes (folders)
        if root != str(dataset_path):
            class_name = os.path.basename(root)
            if class_name not in stats['classes']:
                stats['classes'][class_name] = 0
                stats['total_classes'] += 1
        
        # Count files
        for file in files:
            stats['total_files'] += 1
            file_path = os.path.join(root, file)
            
            # Count by file type
            if file.lower().endswith(('.wav', '.mp3', '.ogg')):
                stats['audio_files'] += 1
                if root != str(dataset_path):
                    stats['classes'][class_name] += 1
                    
            elif file.lower().endswith(('.jpg', '.jpeg', '.png')):
                stats['image_files'] += 1
                
            elif file.lower().endswith('.txt'):
                stats['text_files'] += 1
            
            # Calculate total size
            stats['size_mb'] += os.path.getsize(file_path) / (1024 * 1024)
    
    # Round size to 2 decimal places
    stats['size_mb'] = round(stats['size_mb'], 2)
    
    return stats

def print_stats():
    """Print dataset statistics in a formatted way"""
    stats = count_dataset_info()
    
    print("\n=== Dataset Statistics ===")
    print(f"Total Files: {stats['total_files']}")
    print(f"Total Classes: {stats['total_classes']}")
    print(f"\nBreakdown by Type:")
    print(f"- Audio Files: {stats['audio_files']}")
    print(f"- Image Files: {stats['image_files']}")
    print(f"- Text Files: {stats['text_files']}")
    print(f"\nTotal Size: {stats['size_mb']} MB")
    
    print("\nFiles per Class:")
    for class_name, count in stats['classes'].items():
        print(f"- {class_name}: {count} files")

def save_stats():
    """Save dataset statistics to a JSON file"""
    stats = count_dataset_info()
    output_path = Path(__file__).parent.parent / 'stats' / 'dataset_stats.json'
    
    # Create stats directory if it doesn't exist
    output_path.parent.mkdir(exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(stats, f, indent=2, ensure_ascii=False)
    
    print(f"\nStatistics saved to: {output_path}")

if __name__ == '__main__':
    print_stats()
    save_stats()
