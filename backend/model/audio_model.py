import torch
import torch.nn as nn

class ArabicPronunciationModel(nn.Module):
    def __init__(self, num_classes=185):
        super(ArabicPronunciationModel, self).__init__()
        
        # First convolution block
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2)
        )
        
        # Second convolution block
        self.conv2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2)
        )
        
        # Third convolution block
        self.conv3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2)
        )
        
        self.flatten = nn.Flatten()
        
        # We'll determine the size dynamically in forward pass
        self.fc1 = None
        self.dropout = nn.Dropout(0.5)
        self.fc2 = nn.Linear(512, num_classes)
        
        # Flag to indicate if we need to initialize fc1
        self.is_fc1_init = False
        
    def forward(self, x):
        # Add debug print for input shape
        print(f"Input shape: {x.shape}")
        
        x = self.conv1(x)
        print(f"After conv1: {x.shape}")
        
        x = self.conv2(x)
        print(f"After conv2: {x.shape}")
        
        x = self.conv3(x)
        print(f"After conv3: {x.shape}")
        
        x = self.flatten(x)
        print(f"After flatten: {x.shape}")
        
        # Initialize fc1 with correct input size on first forward pass
        if not self.is_fc1_init:
            self.fc1 = nn.Linear(x.shape[1], 512)
            self.is_fc1_init = True
            # Move fc1 to the same device as the input
            self.fc1 = self.fc1.to(x.device)
        
        x = self.fc1(x)
        x = self.dropout(x)
        x = self.fc2(x)
        return x
