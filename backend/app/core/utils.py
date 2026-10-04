import re
import os
import unicodedata

def sanitize_filename(filename: str) -> str:
    """
    Sanitize a filename to avoid path traversal, special characters, and collisions.
    Removes leading path separators, '../', and restricts to safe ASCII characters.
    """
    # Remove any directory paths (both Windows and POSIX)
    filename = os.path.basename(filename)
    filename = filename.replace("\\", "/").split("/")[-1]
    
    # Normalize unicode
    filename = unicodedata.normalize("NFKD", filename).encode("ascii", "ignore").decode("ascii")
    
    # Keep only alphanumeric, dots, underscores, dashes
    filename = re.sub(r"[^\w\.\-]", "_", filename)
    
    # Collapse multiple underscores or dots
    filename = re.sub(r"_+", "_", filename)
    filename = re.sub(r"\.+", ".", filename)
    
    # Ensure there is a base name
    if not filename or filename == ".":
        filename = "document"
        
    return filename
