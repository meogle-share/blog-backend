#!/bin/bash

# Git Changes Data Exporter
# Interactively select changed files and export changes

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Output to .claude/temp/ directory
TEMP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/temp"
mkdir -p "$TEMP_DIR"
OUTPUT_FILE="$TEMP_DIR/git-changes.txt"

# Get all changed files (staged + unstaged + untracked)
ALL_FILES=$(git status --porcelain | awk '{print $2}')

if [ -z "$ALL_FILES" ]; then
    echo "No changes found."
    exit 1
fi

# Function to match file against pattern
match_pattern() {
    local file="$1"
    local pattern="$2"
    local basename=$(basename "$file")

    # Full path glob match
    if [[ $file == $pattern ]]; then
        return 0
    fi

    # Basename glob match
    if [[ $basename == $pattern ]]; then
        return 0
    fi

    # Substring match (if pattern has no glob characters)
    if [[ ! $pattern == *"*"* ]] && [[ ! $pattern == *"?"* ]]; then
        if [[ $basename == *"$pattern"* ]]; then
            return 0
        fi
    fi

    return 1
}

# Display changed files
echo "Changed files:"
echo "$ALL_FILES" | nl -w2 -s'. '
echo ""
echo "Select files to include:"
echo "  - Numbers: 1 2 3"
echo "  - Range: 1-3"
echo "  - Pattern: *.base.ts (glob) or mapper (substring)"
echo "  - All: all or press Enter"
echo -n "> "
read -r SELECTION

# Initial selection
if [ -z "$SELECTION" ] || [ "$SELECTION" = "all" ]; then
    SELECTED_FILES="$ALL_FILES"
else
    SELECTED_FILES=""
    for ITEM in $SELECTION; do
        if [[ $ITEM == *-* ]] && [[ $ITEM =~ ^[0-9]+-[0-9]+$ ]]; then
            # Range
            START=$(echo $ITEM | cut -d'-' -f1)
            END=$(echo $ITEM | cut -d'-' -f2)
            for i in $(seq $START $END); do
                FILE=$(echo "$ALL_FILES" | sed -n "${i}p")
                if [ -n "$FILE" ]; then
                    SELECTED_FILES="$SELECTED_FILES$FILE"$'\n'
                fi
            done
        elif [[ $ITEM =~ ^[0-9]+$ ]]; then
            # Number
            FILE=$(echo "$ALL_FILES" | sed -n "${ITEM}p")
            if [ -n "$FILE" ]; then
                SELECTED_FILES="$SELECTED_FILES$FILE"$'\n'
            fi
        else
            # Pattern
            while IFS= read -r FILE; do
                if match_pattern "$FILE" "$ITEM"; then
                    SELECTED_FILES="$SELECTED_FILES$FILE"$'\n'
                fi
            done <<< "$ALL_FILES"
        fi
    done
fi

# Remove empty lines and duplicates
SELECTED_FILES=$(echo "$SELECTED_FILES" | sed '/^$/d' | sort -u)

# Interactive modification loop
while true; do
    if [ -z "$SELECTED_FILES" ]; then
        echo "No files selected."
        exit 1
    fi

    # Calculate unselected files
    UNSELECTED_FILES=""
    while IFS= read -r FILE; do
        if ! echo "$SELECTED_FILES" | grep -Fxq "$FILE"; then
            UNSELECTED_FILES="$UNSELECTED_FILES$FILE"$'\n'
        fi
    done <<< "$ALL_FILES"
    UNSELECTED_FILES=$(echo "$UNSELECTED_FILES" | sed '/^$/d')

    echo ""

    # Show unselected files first if any
    if [ -n "$UNSELECTED_FILES" ]; then
        echo "Unselected files ($(echo "$UNSELECTED_FILES" | wc -l | tr -d ' ')):"
        echo "$UNSELECTED_FILES" | sed 's/^/  /'
        echo ""
    fi

    # Show selected files
    echo "Selected files ($(echo "$SELECTED_FILES" | wc -l | tr -d ' ')):"
    echo "$SELECTED_FILES" | sed 's/^/  /'

    echo ""
    echo -n "Continue? (y/n) > "
    read -r CONFIRM

    if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
        break
    fi

    # Modification mode
    echo ""
    echo "Modify selection:"
    echo "  Add: + 1 2 3  or  + *.spec.ts  or  + mapper"
    echo "  Remove: - 1 2 3  or  - *.spec.ts  or  - mapper"
    echo "  (Numbers for remove are based on selected list above)"
    echo -n "> "
    read -r MODIFICATION

    if [ -z "$MODIFICATION" ]; then
        continue
    fi

    if [[ $MODIFICATION == +* ]]; then
        # Add files
        ADD_ITEMS="${MODIFICATION:1}"
        ADD_ITEMS=$(echo "$ADD_ITEMS" | xargs)

        for ITEM in $ADD_ITEMS; do
            if [[ $ITEM == *-* ]] && [[ $ITEM =~ ^[0-9]+-[0-9]+$ ]]; then
                # Range from original list
                START=$(echo $ITEM | cut -d'-' -f1)
                END=$(echo $ITEM | cut -d'-' -f2)
                for i in $(seq $START $END); do
                    FILE=$(echo "$ALL_FILES" | sed -n "${i}p")
                    if [ -n "$FILE" ]; then
                        SELECTED_FILES="$SELECTED_FILES"$'\n'"$FILE"
                    fi
                done
            elif [[ $ITEM =~ ^[0-9]+$ ]]; then
                # Number from original list
                FILE=$(echo "$ALL_FILES" | sed -n "${ITEM}p")
                if [ -n "$FILE" ]; then
                    SELECTED_FILES="$SELECTED_FILES"$'\n'"$FILE"
                fi
            else
                # Pattern from original list
                while IFS= read -r FILE; do
                    if match_pattern "$FILE" "$ITEM"; then
                        SELECTED_FILES="$SELECTED_FILES"$'\n'"$FILE"
                    fi
                done <<< "$ALL_FILES"
            fi
        done

        echo "✓ Files added"

    elif [[ $MODIFICATION == -* ]]; then
        # Remove files
        REMOVE_ITEMS="${MODIFICATION:1}"
        REMOVE_ITEMS=$(echo "$REMOVE_ITEMS" | xargs)

        TEMP_SELECTED=""
        CURRENT_NUM=0

        while IFS= read -r FILE; do
            CURRENT_NUM=$((CURRENT_NUM + 1))
            SHOULD_REMOVE=false

            for ITEM in $REMOVE_ITEMS; do
                if [[ $ITEM == *-* ]] && [[ $ITEM =~ ^[0-9]+-[0-9]+$ ]]; then
                    # Range from selected list
                    START=$(echo $ITEM | cut -d'-' -f1)
                    END=$(echo $ITEM | cut -d'-' -f2)
                    if [ $CURRENT_NUM -ge $START ] && [ $CURRENT_NUM -le $END ]; then
                        SHOULD_REMOVE=true
                        break
                    fi
                elif [[ $ITEM =~ ^[0-9]+$ ]]; then
                    # Number from selected list
                    if [ $CURRENT_NUM -eq $ITEM ]; then
                        SHOULD_REMOVE=true
                        break
                    fi
                else
                    # Pattern matching
                    if match_pattern "$FILE" "$ITEM"; then
                        SHOULD_REMOVE=true
                        break
                    fi
                fi
            done

            if [ "$SHOULD_REMOVE" = false ]; then
                TEMP_SELECTED="$TEMP_SELECTED$FILE"$'\n'
            fi
        done <<< "$SELECTED_FILES"

        SELECTED_FILES="$TEMP_SELECTED"
        echo "✓ Files removed"

    else
        echo "Invalid input. Use + to add or - to remove."
    fi

    # Clean up
    SELECTED_FILES=$(echo "$SELECTED_FILES" | sed '/^$/d' | sort -u)
done

# Get changes for selected files
# Use HEAD comparison to show all changes (staged + unstaged)
DIFF=$(git diff HEAD -- $(echo "$SELECTED_FILES" | tr '\n' ' ') 2>/dev/null || echo "")
DIFF_STAT=$(git diff HEAD --stat -- $(echo "$SELECTED_FILES" | tr '\n' ' ') 2>/dev/null || echo "")

# For untracked files, show full content
UNTRACKED_CONTENT=""
while IFS= read -r FILE; do
    if [[ $(git status --porcelain "$FILE" | awk '{print $1}') == "??" ]]; then
        if [ -f "$FILE" ]; then
            UNTRACKED_CONTENT="$UNTRACKED_CONTENT

=== New File: $FILE ===
$(cat "$FILE")"
        fi
    fi
done <<< "$SELECTED_FILES"

# Create output
OUTPUT_CONTENT="=== Git Changes ===

--- Selected Files ---
$SELECTED_FILES

--- Change Statistics ---
$DIFF_STAT

--- Detailed Changes ---
$DIFF$UNTRACKED_CONTENT"

# Save to file
echo "$OUTPUT_CONTENT" > "$OUTPUT_FILE"

echo ""
echo "Saved to: $OUTPUT_FILE"