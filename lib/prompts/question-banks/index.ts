// lib/prompts/question-banks/index.ts
import { htmlBank } from "./html";
import { cssBank } from "./css";
import { javascriptBank } from "./javascript";
import { pythonBank } from "./python";
import { javaBank } from "./java";
import { cBank } from "./c";
import { cppBank } from "./cpp";
import { csharpBank } from "./csharp";
import { sqlBank } from "./sql";

export interface QuestionBankItem {
  language: string;
  displayName: string;
  topics: string[];
  codingChallenges: {
    junior: {
      title: string;
      description: string;
      starterCode: string;
      testCriteria: string[];
    };
    mid: {
      title: string;
      description: string;
      starterCode: string;
      testCriteria: string[];
    };
    senior: {
      title: string;
      description: string;
      starterCode: string;
      testCriteria: string[];
    };
  };
}

export const QUESTION_BANKS: Record<string, QuestionBankItem> = {
  html: htmlBank,
  css: cssBank,
  javascript: javascriptBank,
  python: pythonBank,
  java: javaBank,
  c: cBank,
  cpp: cppBank,
  csharp: csharpBank,
  sql: sqlBank,
};

export const SUPPORTED_LANGUAGES = [
  { id: "javascript", name: "JavaScript", extension: "js", monacoLang: "javascript", icon: "⚡" },
  { id: "python", name: "Python", extension: "py", monacoLang: "python", icon: "🐍" },
  { id: "html", name: "HTML5", extension: "html", monacoLang: "html", icon: "🌐" },
  { id: "css", name: "CSS3", extension: "css", monacoLang: "css", icon: "🎨" },
  { id: "java", name: "Java", extension: "java", monacoLang: "java", icon: "☕" },
  { id: "c", name: "C", extension: "c", monacoLang: "c", icon: "⚙️" },
  { id: "cpp", name: "C++", extension: "cpp", monacoLang: "cpp", icon: "🚀" },
  { id: "csharp", name: "C#", extension: "cs", monacoLang: "csharp", icon: "🔷" },
  { id: "sql", name: "SQL", extension: "sql", monacoLang: "sql", icon: "🗄️" },
];

export function getQuestionBank(lang: string): QuestionBankItem {
  const normalized = lang.toLowerCase().trim();
  return QUESTION_BANKS[normalized] || QUESTION_BANKS.javascript;
}
