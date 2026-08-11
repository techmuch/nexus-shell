#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

WORKSPACE_DIR="/Users/david/projects/nexus-shell"
SCRATCH_DIR="${WORKSPACE_DIR}/.scratch"
docs_agents_conf="${WORKSPACE_DIR}/docs/agents/issue-tracker.md"

echo "🤖 Starting Headless Auto-Developer Loop..."

# 1. Ensure git workspace is clean
cd "$WORKSPACE_DIR"
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️ Git directory is dirty! Please stash or commit changes first."
    exit 1
fi

# 2. Determine Issue Tracker Configuration
TRACKER_TYPE="local"
if [ -f "$docs_agents_conf" ]; then
    if grep -q "GitHub" "$docs_agents_conf"; then
        TRACKER_TYPE="github"
    elif grep -q "GitLab" "$docs_agents_conf"; then
        TRACKER_TYPE="gitlab"
    fi
fi
echo "📍 Detected Tracker Type: $TRACKER_TYPE"

# 3. Find Next Issue Marked 'ready-for-agent'
NEXT_ISSUE=""
ISSUE_TITLE=""
ISSUE_BODY=""

if [ "$TRACKER_TYPE" = "github" ]; then
    # Query GitHub Issues
    ISSUE_JSON=$(gh issue list --label "ready-for-agent" --limit 1 --json number,title,body)
    if [ "$ISSUE_JSON" != "[]" ] && [ -n "$ISSUE_JSON" ]; then
        NEXT_ISSUE=$(echo "$ISSUE_JSON" | jq -r '.[0].number')
        ISSUE_TITLE=$(echo "$ISSUE_JSON" | jq -r '.[0].title')
        ISSUE_BODY=$(echo "$ISSUE_JSON" | jq -r '.[0].body')
    fi
elif [ "$TRACKER_TYPE" = "gitlab" ]; then
    # Query GitLab Issues
    ISSUE_JSON=$(glab issue list --label "ready-for-agent" --per-page 1 --output json)
    if [ "$ISSUE_JSON" != "[]" ] && [ -n "$ISSUE_JSON" ]; then
        NEXT_ISSUE=$(echo "$ISSUE_JSON" | jq -r '.[0].iid')
        ISSUE_TITLE=$(echo "$ISSUE_JSON" | jq -r '.[0].title')
        ISSUE_BODY=$(echo "$ISSUE_JSON" | jq -r '.[0].description')
    fi
else
    # Query Local Markdown Tracker in .scratch
    # Find files ending in .md containing 'Status: ready-for-agent'
    MATCHING_FILE=$(grep -rl "Status: ready-for-agent" "$SCRATCH_DIR"/**/issues/*.md 2>/dev/null | head -n 1 || true)
    if [ -n "$MATCHING_FILE" ]; then
        NEXT_ISSUE="$MATCHING_FILE"
        ISSUE_TITLE=$(basename "$MATCHING_FILE" .md)
        ISSUE_BODY=$(cat "$MATCHING_FILE")
    fi
fi

if [ -z "$NEXT_ISSUE" ]; then
    echo "✅ No issues marked 'ready-for-agent' found. Loop idle."
    exit 0
fi

echo "🚀 Found issue: $ISSUE_TITLE"
echo "──────────────────────────────────────────"

# 4. Create isolated git branch
BRANCH_NAME="auto/issue-$(echo "$ISSUE_TITLE" | sed 's/[^a-zA-Z0-9]/-/g' | tr '[:upper:]' '[:lower:]')"
echo "🌿 Checking out new branch: $BRANCH_NAME"
git checkout -b "$BRANCH_NAME"

# 5. Run agy Headless Implementation
PROMPT="You are an autonomous senior developer. Implement the following issue in full:
Title: $ISSUE_TITLE
Details:
$ISSUE_BODY

Instructions:
1. Follow the '/implement' skill requirements.
2. Design clean module seams following '/codebase-design'.
3. Use '/tdd' where possible to write unit tests for the core seams first.
4. Run compiler/lint checks and local storybook checks to ensure code health.
5. Finally, run '/review' to verify that the implementation matches the requirements and has no standards violations.
Do not prompt the user for input. Complete all tasks autonomously."

echo "⚙️ Invoking agy headless execution..."
set +e # Allow agy failure to be handled gracefully
agy -p "$PROMPT" --dangerously-skip-permissions
AGY_EXIT_CODE=$?
set -e

if [ $AGY_EXIT_CODE -ne 0 ]; then
    echo "❌ Headless agy run failed with exit code $AGY_EXIT_CODE."
    FAILED_BRANCH="failed/${BRANCH_NAME#auto/}"
    echo "💾 Saving failed implementation changes..."
    git add .
    git commit -m "chore(auto): failed implementation draft" --no-verify || true
    echo "🌿 Renaming branch to: $FAILED_BRANCH"
    git branch -m "$FAILED_BRANCH"
    git checkout main
    exit 1
fi

# 6. Run Final Workspace Verification Tests
echo "🧪 Running workspace verification checks..."
set +e
npm run build
BUILD_EXIT=$?
npx playwright test
TEST_EXIT=$?
set -e

if [ $BUILD_EXIT -ne 0 ] || [ $TEST_EXIT -ne 0 ]; then
    echo "❌ Workspace verification checks failed."
    FAILED_BRANCH="failed/${BRANCH_NAME#auto/}"
    echo "💾 Saving failed workspace changes..."
    git add .
    git commit -m "chore(auto): build/test verification failed" --no-verify || true
    echo "🌿 Renaming branch to: $FAILED_BRANCH"
    git branch -m "$FAILED_BRANCH"
    git checkout main
    exit 1
fi

# 7. Auto-Commit and Push Changes
echo "💾 Commit and Push Changes..."
git add .
git commit -m "feat(auto): implement $ISSUE_TITLE" || true # Avoid error if agy already committed
git push origin "$BRANCH_NAME"

echo "🎉 Implementation of '$ISSUE_TITLE' completed and pushed successfully!"
