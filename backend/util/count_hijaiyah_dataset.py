import os
from pathlib import Path

EXPECTED_LETTERS = {
    'a': 'Alif',
    'ba': 'Ba',
    'ta': 'Ta', 
    'tsa': 'Tsa',
    'ja': 'Jim',
    'ha': 'Ha',
    'kha': 'Kha',
    'dha': 'Dal',
    'da': 'Dzal',
    'ra': 'Ra',
    'za': 'Za',
    'sin': 'Sin',
    'syin': 'Syin',
    'sho': 'Shad',
    'dho': 'Dhad',
    'tha': 'Tha',
    'zha': 'Zha',
    'an': 'Ain',
    'gho': 'Ghoin',
    'fa': 'Fa',
    'qa': 'Qaf',
    'ka': 'Kaf',
    'la': 'Lam',
    'ma': 'Mim',
    'nun': 'Nun',
    'wa': 'Wau',
    'ha': 'Ha',
    'ya': 'Ya',
}

def count_hijaiyah_dataset():
    """Count files and stats for hijaiyah dataset"""
    dataset_path = Path(__file__).parent.parent / 'dataset'
    
    stats = {
        'total_files': 0,
        'total_letters': 0,
        'audio_files': 0,
        'by_letter': {},
        'by_type': {
            'makhraj': 0,
            'tajwid': 0,
            'training': 0
        },
        'total_size_mb': 0,
        'missing_letters': []
    }

    # Initialize stats for all expected letters
    for letter_key in EXPECTED_LETTERS.keys():
        stats['by_letter'][letter_key] = {
            'count': 0,
            'speakers': set(),
            'sessions': set()
        }

    # Process dataset files
    for root, _, files in os.walk(dataset_path):
        audio_files = [f for f in files if f.lower().endswith('.wav')]
        
        for file in audio_files:
            if file[0].isdigit():  # Check if filename starts with number (valid format)
                parts = file.split('_')
                if len(parts) >= 4:
                    speaker_id = parts[0]
                    letter = parts[1]
                    session = parts[2]
                    
                    if letter in stats['by_letter']:
                        stats['by_letter'][letter]['count'] += 1
                        stats['by_letter'][letter]['speakers'].add(speaker_id)
                        stats['by_letter'][letter]['sessions'].add(session)
                        
            file_path = os.path.join(root, file)
            stats['total_size_mb'] += os.path.getsize(file_path) / (1024 * 1024)
            stats['audio_files'] += 1

    # Calculate missing letters
    stats['missing_letters'] = [
        f"{EXPECTED_LETTERS[letter]} ({letter})"
        for letter in EXPECTED_LETTERS
        if stats['by_letter'][letter]['count'] == 0
    ]

    # Print statistics
    print("\n=== Statistik Dataset Huruf Hijaiyah ===")
    print(f"Total File Audio: {stats['audio_files']}")
    print(f"Total Ukuran: {stats['total_size_mb']:.2f} MB")
    
    print("\nDistribusi per Huruf:")
    for letter in sorted(stats['by_letter'].keys()):
        if stats['by_letter'][letter]['count'] > 0:
            print(f"- {letter:4}: {stats['by_letter'][letter]['count']:3} file, "
                  f"{len(stats['by_letter'][letter]['speakers']):2} speaker, "
                  f"{len(stats['by_letter'][letter]['sessions']):2} sesi")
    
    print("\nHuruf yang Belum Ada:")
    for missing in sorted(stats['missing_letters']):
        print(f"- {missing}")
    
    return stats

if __name__ == "__main__":
    count_hijaiyah_dataset()
