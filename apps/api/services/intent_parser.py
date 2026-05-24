from typing import Dict, Any, Optional
from apps.api.schemas.intent_schema import IntentType
import re
from datetime import datetime, timedelta

# Importar servicios
from apps.api.services.task_service import service as task_service
from apps.api.services.meeting_service import service as meeting_service
from apps.api.schemas.task_schema import TaskCreate
from apps.api.schemas.meeting_schema import MeetingCreate

# Heurística basada en frases y regex. Fácilmente reemplazable por LLM.
def parse_intent(query: str) -> Dict[str, Any]:
    q = query.lower()
    # Consulta general (prioridad)
    if any(q.startswith(x) for x in ["qué", "¿qué", "mostrar", "listar"]):
        if "tarea" in q:
            return {"intent": IntentType.GENERAL_QUERY, "parameters": {"type": "tasks"}}
        if "reunión" in q or "reuniones" in q:
            return {"intent": IntentType.GENERAL_QUERY, "parameters": {"type": "meetings"}}
    # Tarea
    if any(x in q for x in ["tarea", "crear tarea", "añade tarea", "agrega tarea", "tengo que", "recordatorio"]):
        # Extraer nombre, fecha
        title = None
        due_date = None
        m = re.search(r"llamada? (.+)", q)
        if m:
            title = m.group(1).strip()
        if not title:
            palabras = q.split()
            for i, p in enumerate(palabras):
                if p in ("llamada", "llamado", "tarea", "llamada:"):
                    if i+1 < len(palabras):
                        title = " ".join(palabras[i+1:])
                        break
        # Fechas
        if "mañana" in q:
            due_date = (datetime.now() + timedelta(days=1))
        elif "hoy" in q:
            due_date = datetime.now()
        # TODO: Mejor NLP aquí
        params = {"title": title or "Tarea detectada", "due_date": due_date}
        return {"intent": IntentType.TASK_CREATE, "parameters": params}
    # Reuniones
    if any(x in q for x in ["reunión", "agenda reunión", "agendar reunión", "agenda una reunión"]):
        # Dia/hora y tema
        scheduled_for = None
        topic = None
        participants = ["auto"]
        m = re.search(r"el (viernes|jueves|lunes|martes|miércoles|sábado|domingo)(?: a las?\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?)?", q)
        if m:
            topic = "Reunión"
            dia = m.group(1)
            hora = int(m.group(2)) if m.group(2) else 15
            minuto = int(m.group(3)) if m.group(3) else 0
            ampm = m.group(4)
            days = {"lunes": 0, "martes": 1, "miércoles": 2, "jueves": 3, "viernes": 4, "sábado": 5, "domingo": 6}
            hoyw = datetime.now().weekday()
            tarw = days[dia]
            add_days = (tarw - hoyw + 7) % 7 or 7
            fecha = datetime.now() + timedelta(days=add_days)
            hora24 = hora if not ampm or ampm=="am" or hora==12 else hora+12
            scheduled_for = fecha.replace(hour=hora24, minute=minuto, second=0, microsecond=0)
        params = {"topic": topic or "Reunión generada", "scheduled_for": scheduled_for, "participants": participants}
        return {"intent": IntentType.MEETING_SCHEDULE, "parameters": params}
    # Consulta general
    if "qué tareas" in q or "mostrar tareas" in q or "listar tareas" in q:
        return {"intent": IntentType.GENERAL_QUERY, "parameters": {"type": "tasks"}}
    if "qué reuniones" in q or "mostrar reuniones" in q or "listar reuniones" in q:
        return {"intent": IntentType.GENERAL_QUERY, "parameters": {"type": "meetings"}}
    return {"intent": IntentType.UNKNOWN, "parameters": {}}

class IntentParserService:
    def parse(self, query: str) -> Dict[str, Any]:
        parsed = parse_intent(query)
        intent = parsed["intent"]
        params = parsed["parameters"]
        result = None
        message = None
        if intent == IntentType.TASK_CREATE:
            task = task_service.add_task(TaskCreate(**{k: v for k, v in params.items() if v is not None}))
            result = {"task": task.dict()}
            message = f"Tarea creada: {task.title}"
        elif intent == IntentType.MEETING_SCHEDULE:
            meeting = meeting_service.add_meeting(MeetingCreate(**{k: v for k, v in params.items() if v is not None}))
            result = {"meeting": meeting.dict()}
            message = f"Reunión agendada: {meeting.topic}"
        elif intent == IntentType.GENERAL_QUERY:
            tipo = params.get("type")
            if tipo=="tasks":
                tasks = task_service.get_tasks()
                result = {"tasks": [t.dict() for t in tasks]}
                message = f"Tienes {len(tasks)} tareas."
            elif tipo=="meetings":
                meetings = meeting_service.get_meetings()
                result = {"meetings": [m.dict() for m in meetings]}
                message = f"Tienes {len(meetings)} reuniones."
        else:
            message = "No se pudo interpretar la intención."
        return {
            "intent": intent,
            "parameters": params,
            "result": result,
            "message": message
        }

service = IntentParserService()
