import os
import torch
from model.train import train_model
import logging

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('training.log')
        ]
    )

def main():
    try:
        setup_logging()
        logger = logging.getLogger(__name__)
        
        # Set the path to your dataset
        current_dir = os.path.dirname(os.path.abspath(__file__))
        dataset_path = os.path.join(current_dir, "dataset")
        
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Dataset directory not found at {dataset_path}")
            
        # Training parameters
        params = {
            "num_epochs": 50,
            "batch_size": 32,
            "learning_rate": 0.001,
            "parts": 5,  # Split training into 5 parts
            "resume_from": None  # Set to checkpoint path if resuming training
        }
        
        # Train the model
        logger.info("Starting training...")
        logger.info(f"Using dataset from: {dataset_path}")
        logger.info(f"Training parameters: {params}")
        
        model, metrics = train_model(dataset_path, **params)
        
        # Save the model and metrics
        model_save_path = os.path.join(current_dir, "arabic_pronunciation_model.pth")
        torch.save({
            'model_state_dict': model.state_dict(),
            'training_params': params,
            'accuracy_metrics': metrics
        }, model_save_path)
        
        logger.info("=== Final Results ===")
        logger.info(f"Best Accuracy: {metrics['best_accuracy']:.2f}%")
        logger.info(f"Final Accuracy: {metrics['final_accuracy']:.2f}%")
        logger.info(f"Average Accuracy: {metrics['average_accuracy']:.2f}%")
        logger.info(f"Model successfully saved to: {model_save_path}")
        
    except FileNotFoundError as e:
        logger.error(f"Error: {str(e)}")
    except Exception as e:
        logger.error(f"An unexpected error occurred: {str(e)}")
        raise

if __name__ == "__main__":
    main()

#cd /Users/alvinahmad/Documents/tajwid-main
#PYTHONPATH=$PYTHONPATH:. python backend/run_training.py
