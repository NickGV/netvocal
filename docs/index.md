# NETVOCAL — Software Journey

## DevVoice Assistant

Bitácora de co-creación y análisis arquitectónico del proyecto de asistente de voz con IA.

> **Equipo:** Nicolas Gomez, Elber Mendoza, Estiven Bernal, Kevin Rojas  
> **Fecha:** Mayo 2026

## Resumen Ejecutivo

NETVOCAL es un asistente de voz impulsado por IA que transforma la interacción humano-computadora mediante un pipeline de voz completo: desde la captura de audio mediante micrófono, pasando por reconocimiento de voz (STT), procesamiento con modelos de lenguaje grande (LLM), síntesis de voz (TTS) y respuesta mediante altavoz. 

El proyecto siguió metodologías de desarrollo ágil y principios de diseño de software sólidos, enfocándose primero en validar los componentes de mayor riesgo técnico mediante el enfoque de "Bala Trazadora" antes de invertir en funcionalidades periféricas.

## Secciones del Software Journey

1. [**Bala Trazadora**](01-tracer-bullet.md) — Cómo priorizamos el pipeline de voz completo como componente de mayor riesgo para validar nuestra arquitectura temprano
2. [**Anatomía de la Complejidad**](02-deep-shallow-modules.md) — Análisis de nuestros módulos usando los principios de deep vs shallow modules de John Ousterhout
3. [**Veredicto Retrospectivo**](03-retrospective-verdict.md) — Evaluación de cómo las decisiones arquitectónicas impactaron el desarrollo y lecciones aprendidas

## Equipo de Desarrollo

| Nombre | Rol | Contribuciones principales |
|--------|-----|----------------------------|
| **Nicolas Gomez** | Arquitecto & Documentación | Sección 3: Veredicto retrospectivo, integración final, revisión de tono unificado |
| **Elber Mendoza** | Documentación & Investigación | Sección 1: Bala trazadora, análisis de Ralph y desglose de issues |
| **Estiven Bernal** | Documentación & Análisis de Código | Sección 2: Anatomía de la complejidad, identificación de deep/shallow modules |
| **Kevin Rojas** | Infraestructura & Calidad | Setup de MkDocs, testing backend/frontend, GitHub Actions para deploy |

## Estado Actual

- ✅ Backend tests: todos pasando
- ✅ Frontend tests: todos pasando  
- ✅ MkDocs configurado y sitio generado correctamente
- ✅ Las 3 secciones completadas y revisadas
- ✅ Sitio desplegado en GitHub Pages
- ✅ Tag v1.0.0 creado

---

*Este sitio está construido con MkDocs + Material for MkDocs*
