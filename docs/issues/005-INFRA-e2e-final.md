# [INFRA] E2E final y lanzamiento del sitio

## 🎯 Objetivo
Verificar que todo el sistema funciona correctamente (E2E) y lanzar el sitio de documentación final.

## 📋 Tareas

### 1. Verificar tests del backend
```bash
cd apps/api
source .venv/bin/activate
pip install -e ".[dev]"
python -m pytest -v
```
- [ ] Todos los tests del backend deben pasar (health, voice, tasks, meetings, services, etc.)
- [ ] Si algún test falla, investigar y arreglar antes de continuar

### 2. Verificar tests del frontend
```bash
pnpm install
pnpm -C apps/web test
```
- [ ] Ya sabemos que pasan 70/70 ✅, pero verificar después de cualquier cambio
- [ ] Si fallan, diagnosticar y corregir

### 3. Build del frontend de producción
```bash
pnpm -C apps/web build
```
- [ ] Debe completar sin errores
- [ ] Verificar que `.next/` se genere correctamente

### 4. Build final de MkDocs
```bash
mkdocs build --strict
```
- [ ] Debe completar sin warnings ni errores
- [ ] Verificar que `site/` se genere con todo el contenido

### 5. Probar sitio localmente
```bash
mkdocs serve
```
- [ ] Abrir http://127.0.0.1:8000
- [ ] Verificar que las 3 secciones se carguen correctamente
- [ ] Verificar navegación y búsqueda funcionen

### 6. Lanzar a GitHub Pages
#### Opción A: GitHub Actions (recomendado)
1. Hacer push a `main` para triggerear el workflow `.github/workflows/deploy-docs.yml`
2. Verificar en Actions que el deploy complete exitosamente
3. Ir a Settings → Pages y confirmar que:
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`

#### Opción B: Manual (si se prefiere)
```bash
mkdocs gh-deploy --force
```
- [ ] Esperar a que complete el push a la branch `gh-pages`
- [ ] Verificar en Settings → Pages que esté configurado correctamente

### 7. Verificar deploy en producción
- [ ] Visitar `https://nickgv.github.io/netvocal/`
- [ ] Confirmar que carga el sitio completo
- [ ] Probar todas las secciones y enlaces
- [ ] Verificar que el tema Material se aplique correctamente

### 8. Crear tag de release
```bash
git tag v1.0.0 -m "Entrega Final Tarea 3 - Software Journey"
git push --tags
```

## ✅ Definition of Done
- [ ] Backend tests: 100% pasando (`pytest -v`)
- [ ] Frontend tests: 100% pasando (`pnpm -C apps/web test`)
- [ ] MkDocs build: sin warnings ni errores (`mkdocs build --strict`)
- [ ] Sitio desplegado y accesible en `https://nickgv.github.io/netvocal/`
- [ ] Todas las 3 secciones visibles y navegables
- [ ] Tag `v1.0.0` creado y pusheado
- [ ] URLs de entrega registradas:
  - Repo: `https://github.com/NickGV/netvocal`
  - Docs: `https://nickgv.github.io/netvocal/`