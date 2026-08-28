# Vaani-Setu Architecture

## System Overview
Vaani-Setu is an AI-powered multilingual voice and text portal designed to bridge the gap between Indian citizens and government welfare schemes.

### Core Layers
1. **Presentation Layer**: Responsive HTML5/CSS3 interface with native accessibility (WCAG 2.1 AA).
2. **Internationalization (i18n)**: 12 regional Indian languages supported with dynamic string translation and RTL/LTR layout management.
3. **Voice Engine**: Web Speech API integration (SpeechRecognition & SpeechSynthesis) with graceful degradation to text.
4. **Schemes Eligibility Engine**: Rule-based matching engine mapping citizen demographic criteria to state & central benefits.
5. **Backend Proxy / Server**: Node.js microservice delivering static assets, mock API routes, and rate-limiting headers.
