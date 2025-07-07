import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Subset
import logging
from tqdm import tqdm
import os
import json
from model.audio_model import ArabicPronunciationModel
from model.preprocess import AudioDataset

def calculate_accuracy(outputs, labels):
    _, predicted = torch.max(outputs.data, 1)
    total = labels.size(0)
    correct = (predicted == labels).sum().item()
    return correct / total * 100

def train_model(dataset_path, num_epochs=50, batch_size=32, learning_rate=0.001, parts=5, resume_from=None):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger = logging.getLogger(__name__)
    
    # Create dataset
    dataset = AudioDataset(dataset_path)
    total_size = len(dataset)
    part_size = total_size // parts
    
    # Initialize model
    model = ArabicPronunciationModel().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
    
    # Load checkpoint if resuming
    start_part = 0
    start_epoch = 0
    if resume_from:
        if os.path.exists(resume_from):
            checkpoint = torch.load(resume_from)
            model.load_state_dict(checkpoint['model_state_dict'])
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
            start_part = checkpoint['part']
            start_epoch = checkpoint['epoch']
            logger.info(f"Resuming from part {start_part}, epoch {start_epoch}")
    
    best_accuracy = 0.0
    accuracies = []

    # Training loop with parts
    for part in range(start_part, parts):
        # Calculate indices for current part
        start_idx = part * part_size
        end_idx = start_idx + part_size if part < parts - 1 else total_size
        
        # Create subset for current part
        part_indices = list(range(start_idx, end_idx))
        part_dataset = Subset(dataset, part_indices)
        dataloader = DataLoader(part_dataset, batch_size=batch_size, shuffle=True)
        
        logger.info(f"Training Part {part + 1}/{parts} - Samples {start_idx} to {end_idx}")
        
        # Train for specified epochs on current part
        for epoch in range(start_epoch, num_epochs):
            model.train()
            running_loss = 0.0
            running_accuracy = 0.0
            total_batches = 0
            
            pbar = tqdm(dataloader, desc=f'Part {part + 1}/{parts}, Epoch {epoch + 1}/{num_epochs}')
            
            for batch_idx, (inputs, labels) in enumerate(pbar):
                inputs, labels = inputs.to(device), labels.to(device)
                
                optimizer.zero_grad()
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
                # Calculate accuracy
                accuracy = calculate_accuracy(outputs, labels)
                running_accuracy += accuracy
                running_loss += loss.item()
                total_batches += 1
                
                # Update progress
                current_loss = running_loss / (batch_idx + 1)
                current_accuracy = running_accuracy / (batch_idx + 1)
                total_progress = (part * num_epochs + epoch) * 100 / (parts * num_epochs)
                pbar.set_postfix({
                    'loss': f'{current_loss:.4f}',
                    'accuracy': f'{current_accuracy:.2f}%',
                    'total_progress': f'{total_progress:.1f}%'
                })
            
            # Calculate epoch metrics
            epoch_loss = running_loss / total_batches
            epoch_accuracy = running_accuracy / total_batches
            accuracies.append(epoch_accuracy)
            
            # Update best accuracy
            if epoch_accuracy > best_accuracy:
                best_accuracy = epoch_accuracy
            
            # Log epoch results
            logger.info(f'Part {part + 1}/{parts}, Epoch {epoch + 1}/{num_epochs} - '
                       f'Loss: {epoch_loss:.4f} - Accuracy: {epoch_accuracy:.2f}%')
            
            # Save checkpoint with accuracy
            checkpoint_path = os.path.join(os.path.dirname(dataset_path), 
                                         f'checkpoint_part{part + 1}_epoch{epoch + 1}.pth')
            torch.save({
                'part': part,
                'epoch': epoch + 1,
                'model_state_dict': model.state_dict(),
                'optimizer_state_dict': optimizer.state_dict(),
                'loss': epoch_loss,
                'accuracy': epoch_accuracy,
                'best_accuracy': best_accuracy
            }, checkpoint_path)
            
        # Reset start_epoch for next part
        start_epoch = 0
    
    # Final training summary
    logger.info("=== Training Summary ===")
    logger.info(f"Best Accuracy: {best_accuracy:.2f}%")
    logger.info(f"Final Accuracy: {accuracies[-1]:.2f}%")
    logger.info(f"Average Accuracy: {sum(accuracies)/len(accuracies):.2f}%")
    logger.info("Training completed!")
    
    return model, {
        'best_accuracy': best_accuracy,
        'final_accuracy': accuracies[-1],
        'average_accuracy': sum(accuracies)/len(accuracies)
    }

if __name__ == "__main__":
    dataset_path = "dataset"
    model, metrics = train_model(dataset_path, parts=5)  # Split training into 5 parts
    torch.save(model.state_dict(), "arabic_pronunciation_model.pth")
    with open("training_metrics.json", "w") as f:
        json.dump(metrics, f)
