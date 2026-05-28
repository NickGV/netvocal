# [INFRA] Limpieza del repo y setup de MkDocs

## 🎯 Objetivo
Limpiar el repositorio eliminando ramas problemáticas y configurar el sitio de documentación con MkDocs + Material theme.

## 📋 Tareas

### 1. Eliminar rama problemática
```bash
# Verificar que es la rama correcta primero
git fetch origin
git log origin/developkevin --not origin/main --oneline
# Si confirma que solo tiene basura/destructive changes:
git push origin --delete developkevin
```

### 2. Verificar tests del backend
```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
python -m pytest -v
```

### 3. Verificar tests del frontend
```bash
pnpm install
pnpm -C apps/web test
```

### 4. Instalar MkDocs y tema Material
```bash
pip install mkdocs mkdocs-material
```

### 5. Inicializar estructura de docs
```bash
mkdocs new .
# Esto creará mkdocs.yml y docs/index.md
```

### 6. Configurar mkdocs.yml
```yaml
site_name: "NETVOCAL — Software Journey"
site_description: "Bitácora de co-creación y análisis arquitectónico del DevVoice Assistant"
repo_url: https://github.com/NickGV/netvocal
theme:
  name: material
  palette:
    primary: indigo
  features:
    - navigation.tabs
    - navigation.sections
nav:
  - "Inicio": index.md
  - "Bala Trazadora": 01-tracer-bullet.md
  - "Deep vs Shallow Modules": 02-deep-shallow-modules.md
  - "Veredicto Retrospectivo": 03-retrospective-verdict.md
```

### 7. Configurar GitHub Actions para deploy
Crear `.github/workflows/deploy-docs.yml`:
```yaml
name: Deploy MkDocs
on:
  push:
    branches: [main]
    paths: ["docs/**", "mkdocs.yml"]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.x"
      - run: pip install mkdocs mkdocs-material
      - run: mkdocs gh-deploy --force
```

### 8. Verificar sitio local
```bash
mkdocs serve
# Abrir http://127.0.0.1:8000
```

## ✅ Definition of Done
- [ ] Branch `developkevin` eliminada del remoto
- [ ] Backend tests pasando (`pytest -v`)
- [ ] Frontend tests pasando (`pnpm -C apps/web test`)
- [ ] MkDocs instalado y funcionando localmente
- [ ] GitHub Actions configurado y deployando a `https://nickgv.github.io/netvocal/`
- [ ] Sitio accesible públicamente