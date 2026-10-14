#!/usr/bin/env bash
# build.sh - Render build script for LookinDoc backend
set -e

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Downloading spaCy English model..."
python -m spacy download en_core_web_sm

echo "Downloading NLTK data..."
python -c "
import nltk
nltk.download('stopwords', quiet=True)
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
print('NLTK data downloaded successfully.')
"

echo "Build complete!"
