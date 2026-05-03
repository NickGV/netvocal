# 📄 Client Brief – DevVoice Assistant

**Equipo:** Elber Mendoza -Nicolas Gomez - Estiven Bernal - Kevin Rojas
**Fecha:** 
**Proyecto:** NETVOCAL  

---

## 1. 🧩 Descripción del problema

En el día a día, los desarrolladores y estudiantes necesitan capturar ideas, gestionar tareas, recordar reuniones y realizar consultas rápidas sin interrumpir su flujo de trabajo.

Las herramientas actuales requieren interacción manual (teclado/mouse) o funcionan como sistemas cerrados, lo que limita tanto la productividad como la comprensión técnica de cómo funcionan los asistentes de voz modernos.

Existe la necesidad de una solución que permita interactuar mediante voz de forma natural, al mismo tiempo que sirva como base para entender la arquitectura de sistemas conversacionales en tiempo real.

---

## 2. 🎯 Objetivo del proyecto

Desarrollar una aplicación de asistente de voz que permita a los usuarios interactuar mediante audio en tiempo real, implementando un flujo completo de:

**Micrófono → Speech-to-Text → LLM → Text-to-Speech → Altavoz**

El sistema estará diseñado para ayudar en tareas diarias simples, responder preguntas, generar recordatorios y gestionar compromisos como reuniones y tareas.

Además, el proyecto busca construir una solución funcional mientras se comprende la arquitectura interna de los agentes conversacionales modernos.

---

## 3. 👥 Usuarios objetivo

- Estudiantes de ingeniería de software  
- Desarrolladores junior y mid  
- Personas interesadas en inteligencia artificial aplicada  
- Usuarios que buscan incrementar su productividad diaria  

---

## 4. 📦 Alcance del proyecto (MVP)

### ✅ Incluye

- Captura de audio desde el usuario  
- Transcripción de voz a texto (Speech-to-Text)  
- Procesamiento de texto mediante un modelo de lenguaje (LLM)  
- Generación de respuestas inteligentes  
- Conversión de texto a voz (Text-to-Speech)  
- Reproducción de audio al usuario  
- Interfaz web básica para control de la conversación  
- Creación de tareas y recordatorios  
- Registro de reuniones y compromisos  
- Consulta de eventos y tareas almacenadas  

### ❌ No incluye (por ahora)

- Entrenamiento de modelos propios  
- Soporte multiusuario avanzado  
- Integraciones externas complejas (Google Calendar, etc.)  
- Optimización de latencia en tiempo real a nivel productivo  

---

## 5. ⚙️ Requerimientos funcionales

- El usuario puede iniciar y detener una conversación  
- El sistema captura audio desde el micrófono  
- El sistema transcribe el audio a texto  
- El sistema envía el texto a un modelo de lenguaje (LLM)  
- El sistema genera una respuesta coherente  
- El sistema convierte la respuesta en audio  
- El sistema reproduce la respuesta al usuario  
- El sistema muestra la conversación en la interfaz  

### Funcionalidades de productividad:

- El sistema permite crear tareas mediante comandos de voz  
- El sistema permite registrar reuniones y compromisos  
- El sistema puede consultar tareas pendientes  
- El sistema puede recordar eventos futuros  
- El sistema mantiene un historial básico de interacciones  

---

## 6. 🧱 Requerimientos no funcionales

- **Usabilidad:** interfaz simple, clara e intuitiva  
- **Rendimiento:** tiempo de respuesta entre 3 y 5 segundos  
- **Modularidad:** separación clara entre STT, LLM y TTS  
- **Escalabilidad:** arquitectura preparada para crecimiento futuro  
- **Mantenibilidad:** código limpio, organizado y documentado  
- **Extensibilidad:** facilidad para agregar nuevas funcionalidades  

---

## 7. 🧪 Stack tecnológico propuesto

### Frontend
- Next.js (React)
- Tailwind CSS

### Backend
- Python  
- FastAPI  
- asyncio  
- Pipecat (para orquestación de flujo de audio en tiempo real)

### IA / Procesamiento
- API de LLM (OpenAI, Claude u otro)  
- Librerías de Speech-to-Text  
- Librerías de Text-to-Speech  

---

## 8. 🔄 Flujo principal del sistema

1. El usuario inicia la interacción por voz  
2. El sistema captura el audio desde el micrófono  
3. El audio es procesado y convertido a texto (STT)  
4. El texto es enviado al modelo de lenguaje (LLM)  
5. El LLM genera una respuesta basada en la solicitud  
6. La respuesta es convertida a audio (TTS)  
7. El sistema reproduce el audio al usuario  
8. La interacción se muestra en la interfaz web  
9. Si aplica, la información se almacena como tarea, recordatorio o evento  

---

## 9. 📊 Criterios de éxito

- El sistema permite mantener una conversación básica por voz  
- El flujo completo de audio funciona correctamente  
- El usuario puede crear y consultar tareas o recordatorios  
- La arquitectura está correctamente separada en frontend y backend  
- El código sigue buenas prácticas de desarrollo  
- El repositorio contiene documentación clara y estructurada  
- Se implementa un flujo de trabajo basado en issues  

---

## 10. 🧠 Enfoque de desarrollo

El desarrollo del proyecto seguirá un enfoque iterativo basado en issues, donde cada funcionalidad será dividida en tareas pequeñas y manejables.

Se priorizará:
- desarrollo incremental  
- validación continua  
- separación por módulos  
- implementación por fases (MVP → mejoras)  

Este enfoque permite mantener control sobre la complejidad del sistema y facilita la colaboración en equipo.

---
