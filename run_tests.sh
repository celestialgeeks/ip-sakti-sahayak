#!/usr/bin/env bash
# ==============================================================================
# IP-SAKTI Sahayak — Unified Test Runner & Quality Gate
# Executes full test suites for both Backend (FastAPI/Pytest) and Frontend (Next.js)
# ==============================================================================

set -eo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   IP-SAKTI Sahayak — Automated Test Suite & Audit   ${NC}"
echo -e "${BLUE}======================================================${NC}\n"

FAILED=0

# ------------------------------------------------------------------------------
# 1. Backend Pytest Suite
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/3] Running Backend Tests (pytest)...${NC}"
cd "$ROOT_DIR/backend"

if [ -f "./venv/bin/pytest" ]; then
    PYTEST_BIN="./venv/bin/pytest"
else
    PYTEST_BIN="pytest"
fi

if $PYTEST_BIN tests/ -v; then
    echo -e "${GREEN}✓ Backend test suite passed successfully.${NC}\n"
else
    echo -e "${RED}✗ Backend test suite failed.${NC}\n"
    FAILED=1
fi

# ------------------------------------------------------------------------------
# 2. Frontend TypeScript Compilation
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[2/3] Checking Frontend TypeScript Types (tsc --noEmit)...${NC}"
cd "$ROOT_DIR/frontend"

if npx tsc --noEmit; then
    echo -e "${GREEN}✓ TypeScript compilation check passed with 0 errors.${NC}\n"
else
    echo -e "${RED}✗ TypeScript compilation check failed.${NC}\n"
    FAILED=1
fi

# ------------------------------------------------------------------------------
# 3. Frontend Test Suite
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[3/3] Running Frontend Tests (node --test)...${NC}"
cd "$ROOT_DIR/frontend"

if npm test; then
    echo -e "${GREEN}✓ Frontend tests passed successfully.${NC}\n"
else
    echo -e "${RED}✗ Frontend tests failed.${NC}\n"
    FAILED=1
fi

# ------------------------------------------------------------------------------
# Summary & Exit
# ------------------------------------------------------------------------------
echo -e "${BLUE}======================================================${NC}"
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED! Quality requirements met.${NC}"
    echo -e "${BLUE}======================================================${NC}"
    exit 0
else
    echo -e "${RED}❌ ONE OR MORE TESTS FAILED. Please review output above.${NC}"
    echo -e "${BLUE}======================================================${NC}"
    exit 1
fi
