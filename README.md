# Productividad Backend — Track B

Este módulo implementa el subsystema de Productividad sobre FastAPI siguiendo práctica limpia, modular y profesional.

## Endpoints principales

### Tareas
- `GET /tasks` — Lista todas las tareas.
- `POST /tasks` — Crea una nueva tarea.
- `DELETE /tasks/{id}` — Elimina una tarea por su ID.

### Reuniones
- `GET /meetings` — Lista todas las reuniones.
- `POST /meetings` — Agenda una reunión.
- `DELETE /meetings/{id}` — Elimina una reunión.

### Intent Parser (NLP)
- `POST /intent/parse` — Analiza texto natural e interpreta intención, ejecutando la acción relevante (crear tarea, agendar reunión o consulta de estado).

## Detalles técnicos

- Persistencia en memoria
- Manejo de IDs únicos (UUID)
- Validaciones robustas en schemas
- Separación router/service/store limpia
- Cobertura de pruebas con `pytest`
- Modular y fácil de extender

## Cómo correr los tests

```bash
python -m pytest apps/api/tests/ -v
```

## Seguimiento de progreso
El avance y los commits de implementación están documentados en `ralph/progress_track.txt` siguiendo el estándar solicitado.

## Autoría y cumplimiento
- Implementación conforme a la rama: `develop-elber2`.
- Solo código backend de Track B (Productividad).
- Commits convencionales y manejo estricto de reglas.

## Soporte de intenciones compatibles (vía NLP)
- Crear tareas por texto natural
- Agendar reuniones por texto natural
- Consultar tareas y reuniones vía pregunta


---

> "Track B terminado y validado. Listo para integración o extensión."
