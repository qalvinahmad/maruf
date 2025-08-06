import os

def count_dataset_stats(dataset_path):
    # Get all subdirectories (classes) in the dataset folder
    classes = [d for d in os.listdir(dataset_path) if os.path.isdir(os.path.join(dataset_path, d))]
    
    print(f"Total number of classes: {len(classes)}")
    print("\nFiles per class:")
    print("-" * 30)
    
    total_files = 0  # Initialize variable to keep track of total number of files

    # Count files in each class
    for class_name in sorted(classes):
        class_path = os.path.join(dataset_path, class_name)
        files = [f for f in os.listdir(class_path) if os.path.isfile(os.path.join(class_path, f))]
        class_file_count = len(files)
        total_files += class_file_count  # Add the count of files in the current class to the total
        print(f"{class_name}: {class_file_count} files")
    
    # Print total number of files across all classes
    print("-" * 30)
    print(f"Total number of files in all classes: {total_files}")

if __name__ == "__main__":
    dataset_path = "dataset"  # Path to your dataset folder
    count_dataset_stats(dataset_path)
