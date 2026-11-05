# ============================================================
#  Anchored Support Platform — Docker Makefile
#  Usage: make <target>
#  Supports: macOS, Linux, Windows (Git Bash / WSL)
# ============================================================

COMPOSE         = docker compose
APP_NAME        = AnchoredSupportPlatform
DOCKER_TIMEOUT  = 60

# ── Detect OS ───────────────────────────────────────────────
ifeq ($(OS),Windows_NT)
  PLATFORM := windows
else
  UNAME := $(shell uname -s)
  ifeq ($(UNAME),Darwin)
    PLATFORM := macos
  else
    PLATFORM := linux
  endif
endif

	
# ── Colors ─────────────────────────────────────────────────
RESET  = \033[0m
BOLD   = \033[1m
GREEN  = \033[32m
YELLOW = \033[33m
CYAN   = \033[36m
RED    = \033[31m

.DEFAULT_GOAL := help

# ============================================================
#  HELP
# ============================================================

.PHONY: help
help:
	@echo ""
	@echo "$(BOLD)$(CYAN)$(APP_NAME) — Docker Commands$(RESET)"
	@echo ""
	@echo "$(BOLD)Development$(RESET)"
	@echo "  make start-anchored-app            Start all services (builds if needed)"
	@echo "  make start-anchored-app-clean      Force rebuild and start all services"
	@echo "  make stop-anchored-app             Stop all services"
	@echo "  make restart-anchored-app          Restart all services"
	@echo "  make restart-server                Restart only the backend service"
	@echo "  make restart-frontend              Restart only the client service"
	@echo ""
	@echo "$(BOLD)Logs$(RESET)"
	@echo "  make logs-all                      Tail logs from all services"
	@echo "  make logs-server                   Tail logs from the server"
	@echo "  make logs-frontend                 Tail logs from the client"
	@echo "  make logs-db                       Tail logs from the database"
	
# ============================================================
#  DOCKER — cross-platform startup guard
# ============================================================

# Attempts to start Docker Desktop if not running, then waits
# until the daemon is ready. Behavior varies by platform:
#   macOS   — launches Docker.app via `open`
#   Windows — launches Docker Desktop via `start`
#   Linux   — Docker is daemon-managed; prints a hint if down

.PHONY: docker-start
docker-start:
	@if ! docker info > /dev/null 2>&1; then \
	    echo "$(YELLOW)► Docker is not running. Attempting to start it...$(RESET)"; \
	    if [ "$(PLATFORM)" = "macos" ]; then \
	        open -a Docker; \
	    elif [ "$(PLATFORM)" = "windows" ]; then \
	        start "" "C:/Program Files/Docker/Docker/Docker Desktop.exe" 2>/dev/null || \
	        echo "$(YELLOW)  Could not auto-start Docker Desktop. Please start it manually.$(RESET)"; \
	    else \
	        echo "$(YELLOW)  Linux detected. Try: sudo systemctl start docker$(RESET)"; \
	        echo "$(RED)✖ Please start the Docker daemon and re-run the command.$(RESET)"; \
	        exit 1; \
	    fi; \
	    echo "$(YELLOW)► Waiting for Docker to be ready (max $(DOCKER_TIMEOUT)s)...$(RESET)"; \
	    elapsed=0; \
	    while ! docker info > /dev/null 2>&1; do \
	        if [ $$elapsed -ge $(DOCKER_TIMEOUT) ]; then \
	            echo "$(RED)✖ Docker did not start within $(DOCKER_TIMEOUT)s. Please start it manually.$(RESET)"; \
	            exit 1; \
	        fi; \
	        sleep 2; \
	        elapsed=$$((elapsed + 2)); \
	        printf "$(YELLOW).$(RESET)"; \
	    done; \
	    echo ""; \
	    echo "$(GREEN)✔ Docker is ready.$(RESET)"; \
	else \
	    echo "$(GREEN)✔ Docker is already running.$(RESET)"; \
	fi
    
    
# ============================================================
#  DEVELOPMENT
# ============================================================

.PHONY: start-anchored-app
start-anchored-app: docker-start
	@echo "$(CYAN)► Rebuilding and starting all services...$(RESET)"
	@$(COMPOSE) up -d --build
	@echo ""
	@echo "$(GREEN)✔ Services rebuilt and up.$(RESET)"
	@echo ""
	@echo "  Anchored App  →  http://localhost"
	@echo ""
	@$(COMPOSE) logs -f --tail=100 server
	
.PHONY: start-anchored-app-clean
start-anchored-app-clean: docker-start
	@echo "$(CYAN)► Rebuilding and starting all services with clean build...$(RESET)"
	@$(COMPOSE) build --no-cache && $(COMPOSE) up -d
	@echo ""
	@echo "$(GREEN)✔ Services rebuilt and up.$(RESET)"
	@echo ""
	@echo "  Anchored App  →  http://localhost"
	@echo ""
	@$(COMPOSE) logs -f --tail=100 server
	
.PHONY: stop-anchored-app
stop-anchored-app: docker-start
	@echo "$(CYAN)► Stopping all services...$(RESET)"
	@$(COMPOSE) down
	@echo "$(GREEN)✔ All services stopped.$(RESET)"

.PHONY: restart-anchored-app
restart-anchored-app: docker-start
	@echo "$(CYAN)► Restarting all services...$(RESET)"
	@$(COMPOSE) restart
	@echo "$(GREEN)✔ All services restarted.$(RESET)"

.PHONY: restart-server
restart-server: docker-start
	@echo "$(CYAN)► Restarting Server...$(RESET)"
	@$(COMPOSE) restart server
	@echo "$(GREEN)✔ Server restarted.$(RESET)"

.PHONY: restart-frontend
restart-frontend: docker-start
	@echo "$(CYAN)► Restarting client...$(RESET)"
	@$(COMPOSE) restart frontend
	@echo "$(GREEN)✔ Client restarted.$(RESET)"
	
# ============================================================
#  LOGS
# ============================================================

.PHONY: logs-all
logs-all: docker-start
	@$(COMPOSE) logs -f --tail=100

.PHONY: logs-server
logs-server: docker-start
	@$(COMPOSE) logs -f --tail=100 server

.PHONY: logs-frontend
logs-frontend: docker-start
	@$(COMPOSE) logs -f --tail=100 frontend

.PHONY: logs-db
logs-db: docker-start
	@$(COMPOSE) logs -f --tail=100 db